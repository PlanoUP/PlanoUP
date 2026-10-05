// Testes de isolamento multi-tenant em Postgres real (PGlite), com os papéis do Supabase.
// Rodar: npm run test:db
import { PGlite } from '@electric-sql/pglite'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { after, before, describe, test } from 'node:test'

const root = new URL('..', import.meta.url)
const sql = (path) => readFileSync(new URL(path, root), 'utf8')

const U = {
  ownerA: '11111111-1111-4111-8111-111111111111',
  ownerB: '22222222-2222-4222-8222-222222222222',
  brokerA: '33333333-3333-4333-8333-333333333333',
  platform: '44444444-4444-4444-8444-444444444444',
  outsider: '55555555-5555-4555-8555-555555555555',
}

let db
let tenantA
let tenantB

/** Executa como um papel do Supabase (anon, usuário autenticado ou servidor). */
// `aal`: aal1 = entrou só com senha; aal2 = senha + código (verificação em duas etapas).
// O admin da plataforma usa aal2 por padrão (sem isso ele não tem poderes de plataforma).
async function as(who, fn, aal = who === 'platform' ? 'aal2' : 'aal1') {
  if (who === 'anon') {
    await db.exec(`select set_config('request.jwt.claim.sub', '', false), set_config('request.jwt.claims', '', false); set role anon;`)
  } else if (who === 'server') {
    await db.exec(`select set_config('request.jwt.claim.sub', '', false), set_config('request.jwt.claims', '', false); reset role;`)
  } else {
    const claims = JSON.stringify({ sub: U[who], aal })
    await db.exec(`select set_config('request.jwt.claim.sub', '${U[who]}', false), set_config('request.jwt.claims', '${claims}', false); set role authenticated;`)
  }
  try {
    return await fn()
  } finally {
    await db.exec('reset role;')
  }
}
const q = async (text, params = []) => (await db.query(text, params)).rows
async function rejects(promise, pattern) {
  await assert.rejects(promise, (err) => {
    assert.match(String(err.message), pattern)
    return true
  })
}

before(async () => {
  db = new PGlite()
  await db.exec(sql('tests/supabase-shim.sql'))
  for (const file of readdirSync(new URL('migrations/', root)).filter((f) => f.endsWith('.sql')).sort()) {
    await db.exec(sql(`migrations/${file}`))
  }
  await db.exec(sql('seed.sql'))
  for (const [name, id] of Object.entries(U)) {
    await q(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`, [
      id,
      `${name}@example.com`,
      JSON.stringify({ full_name: name }),
    ])
  }
  await q(`update public.profiles set is_platform_admin = true where id = $1`, [U.platform])
  // Plano de teste com limite baixo.
  await q(`insert into public.plans (code, name, limits, features) values ('tiny', 'Tiny', '{"max_properties": 2}', '{"model3d": false}')`)

  tenantA = await as('ownerA', async () => (await q(`select public.create_tenant_with_owner('imob-a', 'Imobiliária A') as id`))[0].id)
  tenantB = await as('ownerB', async () => (await q(`select public.create_tenant_with_owner('imob-b', 'Imobiliária B') as id`))[0].id)
})

after(async () => {
  await db?.close()
})

describe('onboarding e papéis', () => {
  test('create_tenant_with_owner: cria tenant, configurações, assinatura e owner', async () => {
    const rows = await as('ownerA', () => q(`select role from public.tenant_members where tenant_id = $1`, [tenantA]))
    assert.deepEqual(rows, [{ role: 'owner' }])
    const settings = await as('ownerA', () => q(`select display_name from public.tenant_settings where tenant_id = $1`, [tenantA]))
    assert.equal(settings[0].display_name, 'Imobiliária A')
  })

  test('anônimo não cria imobiliária', async () => {
    await as('anon', () => rejects(q(`select public.create_tenant_with_owner('imob-x', 'X')`), /permission denied/))
  })

  test('usuário não se promove a admin da plataforma', async () => {
    await as('ownerA', () =>
      rejects(q(`update public.profiles set is_platform_admin = true where id = $1`, [U.ownerA]), /permission denied/),
    )
  })

  test('owner não altera status, plano nem slug do próprio tenant', async () => {
    await as('ownerA', () => rejects(q(`update public.tenants set plan_code = 'premium' where id = $1`, [tenantA]), /only platform admins/))
    await as('ownerA', () => rejects(q(`update public.tenants set status = 'suspended' where id = $1`, [tenantA]), /only platform admins/))
    const renamed = await as('ownerA', () => q(`update public.tenants set name = 'Imobiliária A Ltda' where id = $1 returning id`, [tenantA]))
    assert.equal(renamed.length, 1)
  })

  test('admin da plataforma vê todas as imobiliárias; usuários comuns só as suas', async () => {
    const all = await as('platform', () => q(`select slug from public.tenants order by slug`))
    assert.deepEqual(all.map((r) => r.slug), ['imob-a', 'imob-b', 'legalize'])
    const mine = await as('ownerA', () => q(`select slug from public.tenants`))
    assert.deepEqual(mine.map((r) => r.slug), ['imob-a'])
    const none = await as('outsider', () => q(`select slug from public.tenants`))
    assert.equal(none.length, 0)
  })
})

describe('isolamento de imóveis', () => {
  let propA
  let propB

  test('owner cadastra imóvel; slug gerado automaticamente', async () => {
    const rows = await as('ownerA', () =>
      q(
        `insert into public.properties (tenant_id, title, type, purpose, neighborhood, city, state, price, street, street_number, hide_exact_address)
         values ($1, 'Casa em condomínio', 'casa-condominio', 'venda', 'Capim Macio', 'Natal', 'RN', 1180000, 'Rua das Flores', '123', true)
         returning id, slug, status`,
        [tenantA],
      ),
    )
    propA = rows[0].id
    assert.equal(rows[0].slug, 'casa-em-condominio-capim-macio-natal')
    assert.equal(rows[0].status, 'draft')
  })

  test('slug é único dentro do tenant e pode repetir entre tenants', async () => {
    const dup = await as('ownerA', () =>
      q(`insert into public.properties (tenant_id, title, type, neighborhood, city) values ($1, 'Casa em condomínio', 'casa', 'Capim Macio', 'Natal') returning slug`, [tenantA]),
    )
    assert.equal(dup[0].slug, 'casa-em-condominio-capim-macio-natal-2')
    const other = await as('ownerB', () =>
      q(`insert into public.properties (tenant_id, title, type, neighborhood, city) values ($1, 'Casa em condomínio', 'casa', 'Capim Macio', 'Natal') returning id, slug`, [tenantB]),
    )
    propB = other[0].id
    assert.equal(other[0].slug, 'casa-em-condominio-capim-macio-natal')
  })

  test('um tenant não vê, não altera e não cria imóveis em outro', async () => {
    const seen = await as('ownerA', () => q(`select id from public.properties where tenant_id = $1`, [tenantB]))
    assert.equal(seen.length, 0)
    const updated = await as('ownerA', () => q(`update public.properties set title = 'Hackeado' where id = $1 returning id`, [propB]))
    assert.equal(updated.length, 0)
    const deleted = await as('ownerA', () => q(`delete from public.properties where id = $1 returning id`, [propB]))
    assert.equal(deleted.length, 0)
    await as('ownerA', () =>
      rejects(q(`insert into public.properties (tenant_id, title, type) values ($1, 'Intruso', 'casa')`, [tenantB]), /row-level security/),
    )
  })

  test('tenant_id é imutável (não dá para "mover" um imóvel para outra imobiliária)', async () => {
    await as('ownerA', () => rejects(q(`update public.properties set tenant_id = $1 where id = $2`, [tenantB, propA]), /immutable|row-level security/))
  })

  test('anônimo não lê tabelas internas', async () => {
    for (const table of ['properties', 'leads', 'tenant_settings', 'analytics_events', 'tenant_members', 'brokers', 'tenants']) {
      await as('anon', () => rejects(q(`select 1 from public.${table} limit 1`), /permission denied/))
    }
  })

  test('site público: só imóveis publicados, com endereço exato oculto quando pedido', async () => {
    let pub = await as('anon', () => q(`select id from public.get_published_properties($1)`, [tenantA]))
    assert.equal(pub.length, 0, 'rascunho não aparece')
    await as('ownerA', () => q(`update public.properties set status = 'published' where id = $1`, [propA]))
    pub = await as('anon', () => q(`select slug, street, street_number, neighborhood, published_at from public.get_published_properties($1)`, [tenantA]))
    assert.equal(pub.length, 1)
    assert.equal(pub[0].street, null)
    assert.equal(pub[0].street_number, null)
    assert.equal(pub[0].neighborhood, 'Capim Macio')
    assert.ok(pub[0].published_at, 'published_at preenchido ao publicar')
  })

  test('imobiliária suspensa some do site público', async () => {
    await as('platform', () => q(`update public.tenants set status = 'suspended' where id = $1`, [tenantA]))
    const pub = await as('anon', () => q(`select id from public.get_published_properties($1)`, [tenantA]))
    assert.equal(pub.length, 0)
    const resolved = await as('anon', () => q(`select * from public.resolve_tenant(null, 'imob-a')`))
    assert.equal(resolved.length, 0)
    await as('platform', () => q(`update public.tenants set status = 'active' where id = $1`, [tenantA]))
  })

  test('3D: não sai no público quando desativado', async () => {
    await as('platform', () => q(`update public.tenants set plan_code = 'pro' where id = $1`, [tenantA]))
    await as('ownerA', () =>
      q(`update public.properties set model3d = '{"enabled": false, "url": "/m.glb"}' where id = $1`, [propA]),
    )
    let pub = await as('anon', () => q(`select model3d from public.get_published_properties($1) where id = $2`, [tenantA, propA]))
    assert.equal(pub[0].model3d, null)
    await as('ownerA', () => q(`update public.properties set model3d = '{"enabled": true, "url": "/m.glb"}' where id = $1`, [propA]))
    pub = await as('anon', () => q(`select model3d from public.get_published_properties($1) where id = $2`, [tenantA, propA]))
    assert.equal(pub[0].model3d.url, '/m.glb')
  })

  test('domínio identifica a imobiliária', async () => {
    const byHost = await as('anon', () => q(`select slug from public.resolve_tenant('legalize-one.vercel.app:443')`))
    assert.deepEqual(byHost, [{ slug: 'legalize' }])
    const unknown = await as('anon', () => q(`select slug from public.resolve_tenant('desconhecido.com')`))
    assert.equal(unknown.length, 0)
    // Domínio tem prioridade sobre o slug padrão; domínio desconhecido cai no slug padrão.
    const priority = await as('anon', () => q(`select slug from public.resolve_tenant('legalize-one.vercel.app', 'imob-a')`))
    assert.deepEqual(priority, [{ slug: 'legalize' }])
    const fallback = await as('anon', () => q(`select slug from public.resolve_tenant('localhost', 'imob-a')`))
    assert.deepEqual(fallback, [{ slug: 'imob-a' }])
    const profile = await as('anon', () => q(`select display_name, legal_name, whatsapp from public.get_tenant_profile('00000000-0000-4000-8000-000000000001')`))
    assert.deepEqual(profile, [{ display_name: 'Legalize', legal_name: 'Legalize Soluções Imobiliárias', whatsapp: '5584999999999' }])
  })
})

describe('corretores', () => {
  let brokerRow
  let assigned
  let unassigned

  test('owner adiciona corretor (membro + cadastro)', async () => {
    await as('ownerA', () => q(`insert into public.tenant_members (tenant_id, user_id, role) values ($1, $2, 'broker')`, [tenantA, U.brokerA]))
    brokerRow = (await as('ownerA', () =>
      q(`insert into public.brokers (tenant_id, user_id, name, whatsapp) values ($1, $2, 'Corretor A', '5584988887777') returning id`, [tenantA, U.brokerA]),
    ))[0].id
    assigned = (await as('ownerA', () =>
      q(`insert into public.properties (tenant_id, title, type, broker_id, status) values ($1, 'Apartamento do corretor', 'apartamento', $2, 'published') returning id`, [tenantA, brokerRow]),
    ))[0].id
    unassigned = (await as('ownerA', () => q(`select id from public.properties where tenant_id = $1 and broker_id is null limit 1`, [tenantA])))[0].id
  })

  test('admin não concede papel owner; owner pode', async () => {
    // Promove brokerA a admin temporariamente e tenta criar um owner.
    await as('ownerA', () => q(`update public.tenant_members set role = 'admin' where tenant_id = $1 and user_id = $2`, [tenantA, U.brokerA]))
    await as('brokerA', () =>
      rejects(q(`insert into public.tenant_members (tenant_id, user_id, role) values ($1, $2, 'owner')`, [tenantA, U.outsider]), /row-level security/),
    )
    await as('ownerA', () => q(`update public.tenant_members set role = 'broker' where tenant_id = $1 and user_id = $2`, [tenantA, U.brokerA]))
  })

  test('corretor vê os imóveis da imobiliária, edita só os seus e não muda status', async () => {
    const seen = await as('brokerA', () => q(`select id from public.properties where tenant_id = $1`, [tenantA]))
    assert.ok(seen.length >= 3)
    const ok = await as('brokerA', () => q(`update public.properties set description = 'Vista mar' where id = $1 returning id`, [assigned]))
    assert.equal(ok.length, 1)
    const notMine = await as('brokerA', () => q(`update public.properties set description = 'x' where id = $1 returning id`, [unassigned]))
    assert.equal(notMine.length, 0)
    await as('brokerA', () => rejects(q(`update public.properties set status = 'sold' where id = $1`, [assigned]), /brokers cannot change/))
    await as('brokerA', () => rejects(q(`insert into public.properties (tenant_id, title, type) values ($1, 'Novo', 'casa')`, [tenantA]), /row-level security/))
  })

  test('corretor cadastra imóvel próprio só como rascunho, sem destaque nem verificação', async () => {
    const draft = await as('brokerA', () =>
      q(`insert into public.properties (tenant_id, title, type, broker_id) values ($1, 'Casa do corretor', 'casa', $2) returning status`, [tenantA, brokerRow]),
    )
    assert.equal(draft[0].status, 'draft')
    await as('brokerA', () =>
      rejects(q(`insert into public.properties (tenant_id, title, type, broker_id, status) values ($1, 'Publicada', 'casa', $2, 'published')`, [tenantA, brokerRow]), /row-level security/),
    )
    await as('brokerA', () =>
      rejects(q(`insert into public.properties (tenant_id, title, type, broker_id, featured) values ($1, 'Destaque', 'casa', $2, true)`, [tenantA, brokerRow]), /row-level security/),
    )
    await as('brokerA', () =>
      rejects(q(`insert into public.properties (tenant_id, title, type, broker_id) values ($1, 'Em outro', 'casa', $2)`, [tenantB, brokerRow]), /row-level security|foreign key/),
    )
    await as('brokerA', () => rejects(q(`update public.properties set featured = true where id = $1`, [assigned]), /brokers cannot change/))
    await as('brokerA', () =>
      rejects(q(`update public.properties set documentation_verified = true where id = $1`, [assigned]), /brokers cannot change/),
    )
  })

  test('fotos: corretor grava só na pasta dos próprios imóveis; gerente em qualquer imóvel', async () => {
    const mine = await as('brokerA', () =>
      q(`insert into storage.objects (bucket_id, name) values ('property-media', $1) returning id`, [`${tenantA}/${assigned}/a.webp`]),
    )
    assert.equal(mine.length, 1)
    await as('brokerA', () =>
      rejects(q(`insert into storage.objects (bucket_id, name) values ('property-media', $1)`, [`${tenantA}/${unassigned}/a.webp`]), /row-level security/),
    )
    await as('brokerA', () =>
      rejects(q(`insert into storage.objects (bucket_id, name) values ('property-media', $1)`, [`${tenantA}/qualquer/a.webp`]), /row-level security/),
    )
    const manager = await as('ownerA', () =>
      q(`insert into storage.objects (bucket_id, name) values ('property-media', $1) returning id`, [`${tenantA}/${unassigned}/b.webp`]),
    )
    assert.equal(manager.length, 1)
    const media = await as('brokerA', () =>
      q(`insert into public.property_media (tenant_id, property_id, storage_path) values ($1, $2, $3) returning id`, [tenantA, assigned, `${tenantA}/${assigned}/a.webp`]),
    )
    assert.equal(media.length, 1)
    await as('brokerA', () =>
      rejects(q(`insert into public.property_media (tenant_id, property_id, storage_path) values ($1, $2, 'x')`, [tenantA, unassigned]), /row-level security/),
    )
  })

  test('corretor não ativa/desativa o próprio acesso', async () => {
    await as('brokerA', () => rejects(q(`update public.brokers set active = false where id = $1`, [brokerRow]), /not allowed/))
    const ok = await as('brokerA', () => q(`update public.brokers set phone = '84988887777' where id = $1 returning id`, [brokerRow]))
    assert.equal(ok.length, 1)
  })

  describe('leads', () => {
    let leadMine
    let leadOther

    test('anônimo registra lead validado; corretor responsável é atribuído', async () => {
      leadMine = (await as('anon', () =>
        q(`select public.submit_lead($1, 'visit_request', $2, 'Maria', '(84) 98888-1111', null, 'Quero visitar', 'property_page', '/imovel/x', null, 'sess-1', '{"utm_source":"instagram"}') as id`, [tenantA, assigned]),
      ))[0].id
      leadOther = (await as('anon', () =>
        q(`select public.submit_lead($1, 'whatsapp', null) as id`, [tenantA]),
      ))[0].id
      const row = (await as('server', () => q(`select broker_id, phone, utm_source, channel from public.leads where id = $1`, [leadMine])))[0]
      assert.equal(row.broker_id, brokerRow)
      assert.equal(row.phone, '84988881111')
      assert.equal(row.utm_source, 'instagram')
    })

    test('lead é rejeitado com dados inválidos ou imóvel de outra imobiliária', async () => {
      const call = (args) => as('anon', () => q(`select public.submit_lead(${args})`, [tenantA]))
      await rejects(call(`$1, 'form', null, null, '84999990000'`), /name and phone or email/)
      await rejects(call(`$1, 'form', null, 'João', '123'`), /invalid phone/)
      await rejects(call(`$1, 'form', null, 'João', null, 'nao-e-email'`), /invalid email/)
      await rejects(call(`$1, 'canal-inventado'`), /invalid channel/)
      const foreignProperty = (await as('server', () => q(`select id from public.properties where tenant_id = $1 limit 1`, [tenantB])))[0].id
      await rejects(as('anon', () => q(`select public.submit_lead($1, 'whatsapp', $2)`, [tenantA, foreignProperty])), /invalid property/)
      await as('anon', () => rejects(q(`insert into public.leads (tenant_id, channel) values ($1, 'form')`, [tenantA]), /permission denied/))
    })

    test('corretor vê só os próprios leads; admin vê todos; outra imobiliária não vê nenhum', async () => {
      const broker = await as('brokerA', () => q(`select id from public.leads`))
      assert.deepEqual(broker.map((r) => r.id), [leadMine])
      const owner = await as('ownerA', () => q(`select id from public.leads`))
      assert.equal(owner.length, 2)
      const otherTenant = await as('ownerB', () => q(`select id from public.leads`))
      assert.equal(otherTenant.length, 0)
      assert.ok(leadOther)
    })

    test('notas: corretor anota o próprio lead; outra imobiliária não', async () => {
      const note = await as('brokerA', () => q(`insert into public.lead_notes (tenant_id, lead_id, body) values ($1, $2, 'Ligar amanhã') returning id`, [tenantA, leadMine]))
      assert.equal(note.length, 1)
      await as('ownerB', () =>
        rejects(q(`insert into public.lead_notes (tenant_id, lead_id, body) values ($1, $2, 'x')`, [tenantA, leadMine]), /row-level security/),
      )
    })

    test('corretor registra contato só em nome próprio; atualiza status do próprio lead', async () => {
      const own = await as('brokerA', () =>
        q(`insert into public.leads (tenant_id, broker_id, name, phone, channel) values ($1, $2, 'Cliente WhatsApp', '84999990001', 'whatsapp') returning id`, [tenantA, brokerRow]),
      )
      assert.equal(own.length, 1)
      await as('brokerA', () =>
        rejects(q(`insert into public.leads (tenant_id, name, channel) values ($1, 'Sem corretor', 'call')`, [tenantA]), /row-level security/),
      )
      const moved = await as('brokerA', () => q(`update public.leads set status = 'contacted' where id = $1 returning status`, [leadMine]))
      assert.equal(moved[0].status, 'contacted')
      const notMine = await as('brokerA', () => q(`update public.leads set status = 'lost' where id = $1 returning id`, [leadOther]))
      assert.equal(notMine.length, 0)
    })

    test('colegas veem o nome uns dos outros; outra imobiliária não', async () => {
      const seen = await as('brokerA', () => q(`select id, full_name from public.profiles where id = $1`, [U.ownerA]))
      assert.equal(seen[0]?.full_name, 'ownerA')
      const foreign = await as('ownerB', () => q(`select id from public.profiles where id = $1`, [U.ownerA]))
      assert.equal(foreign.length, 0)
      const outsider = await as('outsider', () => q(`select id from public.profiles where id <> $1`, [U.outsider]))
      assert.equal(outsider.length, 0)
    })
  })
})

describe('analytics', () => {
  test('evento anônimo registrado; imóvel de outra imobiliária é descartado', async () => {
    const foreign = (await as('server', () => q(`select id from public.properties where tenant_id = $1 limit 1`, [tenantB])))[0].id
    await as('anon', () =>
      q(`select public.track_event($1, 'property_view', $2, 'sess-9', '/imovel/x', 'https://google.com', '{"utm_medium":"cpc"}', '{"device":"mobile"}')`, [tenantA, foreign]),
    )
    const rows = await as('ownerA', () => q(`select property_id, utm_medium, metadata from public.analytics_events where session_id = 'sess-9'`))
    assert.equal(rows.length, 1)
    assert.equal(rows[0].property_id, null)
    assert.equal(rows[0].utm_medium, 'cpc')
    await as('anon', () => rejects(q(`select public.track_event($1, 'evento_inventado')`, [tenantA]), /check constraint/))
    const other = await as('ownerB', () => q(`select id from public.analytics_events where session_id = 'sess-9'`))
    assert.equal(other.length, 0)
  })

  test('corretor não lê analytics (só gestores)', async () => {
    const rows = await as('brokerA', () => q(`select id from public.analytics_events`))
    assert.equal(rows.length, 0)
  })

  test('resultados: resumo do período só para gestores, com números corretos', async () => {
    const prop = (await as('server', () => q(`select id from public.properties where tenant_id = $1 and status = 'published' limit 1`, [tenantA])))[0].id
    const ev = (type, session, property = null) =>
      as('anon', () => q(`select public.track_event($1, $2, $3, $4, '/x', 'https://www.google.com/search', '{}', '{}')`, [tenantA, type, property, session]))
    for (const sess of ['m-1', 'm-2', 'm-3']) await ev('page_view', sess)
    await ev('page_view', 'm-1')
    await ev('property_view', 'm-1', prop)
    await ev('property_view', 'm-2', prop)
    await ev('3d_open', 'm-1', prop)
    await ev('whatsapp_click', 'm-1', prop)
    // Evento antigo (fora do período) entra só no "período anterior".
    await as('server', () => q(`insert into public.analytics_events (tenant_id, event_type, session_id, occurred_at) values ($1, 'page_view', 'old', now() - interval '40 days')`, [tenantA]))

    const m = (await as('ownerA', () => q(`select public.tenant_metrics($1, 30) as m`, [tenantA])))[0].m
    assert.ok(m.totals.visitors >= 3)
    assert.equal(m.previous.visitors, 1)
    const p = m.properties.find((x) => x.id === prop)
    assert.equal(p.views, 2)
    assert.equal(p.viewers, 2)
    assert.equal(p.immersive_sessions, 1)
    assert.equal(p.intent_sessions, 1)
    assert.equal(m.daily.length, 31)
    assert.ok(m.sources.some((s) => s.source === 'google.com'))

    await as('brokerA', () => rejects(q(`select public.tenant_metrics($1)`, [tenantA]), /not allowed/))
    await as('ownerB', () => rejects(q(`select public.tenant_metrics($1)`, [tenantA]), /not allowed/))
    await as('anon', () => rejects(q(`select public.tenant_metrics($1)`, [tenantA]), /permission denied/))
    const viaAdmin = (await as('platform', () => q(`select public.tenant_metrics($1, 7) as m`, [tenantA])))[0].m
    assert.equal(viaAdmin.period.days, 7)
  })
})

describe('planos e limites', () => {
  test('limite de imóveis aplicado pelo banco', async () => {
    await as('platform', () => q(`update public.tenants set plan_code = 'tiny' where id = $1`, [tenantB]))
    await as('ownerB', () => q(`insert into public.properties (tenant_id, title, type) values ($1, 'Segundo imóvel', 'casa')`, [tenantB]))
    await as('ownerB', () =>
      rejects(q(`insert into public.properties (tenant_id, title, type) values ($1, 'Terceiro imóvel', 'casa')`, [tenantB]), /plan_limit_reached:max_properties/),
    )
  })

  test('3D bloqueado em plano sem o recurso', async () => {
    const id = (await as('server', () => q(`select id from public.properties where tenant_id = $1 limit 1`, [tenantB])))[0].id
    await as('ownerB', () =>
      rejects(q(`update public.properties set model3d = '{"enabled": true}' where id = $1`, [id]), /plan_feature_unavailable:model3d/),
    )
  })

  test('entitlements visíveis só para membros', async () => {
    const ent = await as('ownerA', () => q(`select public.tenant_entitlements($1) as e`, [tenantA]))
    assert.equal(ent[0].e.plan, 'pro')
    await as('ownerB', () => rejects(q(`select public.tenant_entitlements($1)`, [tenantA]), /not a member/))
  })
})

describe('storage', () => {
  test('upload só na pasta da própria imobiliária', async () => {
    const ok = await as('ownerA', () => q(`insert into storage.objects (bucket_id, name) values ('property-media', $1) returning id`, [`${tenantA}/casa/foto-1.webp`]))
    assert.equal(ok.length, 1)
    await as('ownerA', () =>
      rejects(q(`insert into storage.objects (bucket_id, name) values ('property-media', $1)`, [`${tenantB}/casa/foto-1.webp`]), /row-level security/),
    )
    await as('ownerA', () =>
      rejects(q(`insert into storage.objects (bucket_id, name) values ('property-media', 'sem-tenant/foto.webp')`), /row-level security/),
    )
    await as('brokerA', () =>
      rejects(q(`insert into storage.objects (bucket_id, name) values ('tenant-assets', $1)`, [`${tenantA}/logo.png`]), /row-level security/),
    )
    const platform = await as('platform', () =>
      q(`insert into storage.objects (bucket_id, name) values ('property-media', $1) returning id`, [`${tenantB}/casa/foto-2.webp`]),
    )
    assert.equal(platform.length, 1)
    await as('outsider', () =>
      rejects(q(`insert into storage.objects (bucket_id, name) values ('property-media', $1)`, [`${tenantA}/casa/foto-3.webp`]), /row-level security/),
    )
  })
})

describe('salvaguardas do schema', () => {
  test('toda tabela do schema public tem RLS habilitada', async () => {
    const rows = await q(`select tablename from pg_tables where schemaname = 'public' and not rowsecurity`)
    assert.deepEqual(rows, [], `tabelas sem RLS: ${rows.map((r) => r.tablename).join(', ')}`)
  })

  test('anônimo só lê o catálogo de planos (demais leituras via funções públicas)', async () => {
    const rows = await q(`
      select table_name from information_schema.role_table_grants
      where grantee = 'anon' and table_schema in ('public', 'private') and privilege_type = 'SELECT' order by table_name`)
    assert.deepEqual(rows.map((r) => r.table_name), ['plans'])
    const writes = await q(`
      select table_name, privilege_type from information_schema.role_table_grants
      where grantee = 'anon' and table_schema = 'public' and privilege_type <> 'SELECT'`)
    assert.deepEqual(writes, [])
  })

  test('views ficam fora do schema exposto e não são lidas diretamente', async () => {
    for (const view of ['public_properties', 'public_tenant_profiles', 'public_property_media']) {
      await as('anon', () => rejects(q(`select 1 from private.${view} limit 1`), /permission denied/))
      const inPublic = await q(`select 1 from pg_views where schemaname = 'public' and viewname = $1`, [view])
      assert.equal(inPublic.length, 0)
    }
  })

  test('funções expostas pela API = só a superfície pública intencional', async () => {
    // SECURITY DEFINER no schema public executáveis por anon/authenticated (viram endpoints RPC).
    const rows = await q(`
      select p.proname, has_function_privilege('anon', p.oid, 'execute') as anon
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.prosecdef
        and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('authenticated', p.oid, 'execute'))
      order by p.proname`)
    assert.deepEqual(rows, [
      { proname: 'create_tenant_with_owner', anon: false },
      { proname: 'get_broker_media', anon: true },
      { proname: 'get_broker_profile', anon: true },
      { proname: 'get_broker_properties', anon: true },
      { proname: 'get_broker_testimonials', anon: true },
      { proname: 'get_published_media', anon: true },
      { proname: 'get_published_properties', anon: true },
      { proname: 'get_tenant_profile', anon: true },
      { proname: 'platform_add_domain', anon: false },
      { proname: 'platform_create_tenant', anon: false },
      { proname: 'platform_list_tenants', anon: false },
      { proname: 'platform_update_tenant', anon: false },
      { proname: 'resolve_tenant', anon: true },
      { proname: 'submit_broker_lead', anon: true },
      { proname: 'submit_lead', anon: true },
      { proname: 'tenant_entitlements', anon: false },
      { proname: 'tenant_metrics', anon: false },
      { proname: 'track_event', anon: true },
    ])
  })
})

describe('painel da plataforma (novas imobiliárias)', () => {
  let created

  test('só o admin da plataforma cria, lista e altera imobiliárias', async () => {
    for (const who of ['ownerA', 'outsider', 'brokerA']) {
      await as(who, () => rejects(q(`select public.platform_create_tenant('Imob Z', 'imob-z', 'start')`), /not_allowed/))
      await as(who, () => rejects(q(`select public.platform_list_tenants()`), /not_allowed/))
      await as(who, () => rejects(q(`select public.platform_update_tenant($1, 'premium')`, [tenantA]), /not_allowed/))
      await as(who, () => rejects(q(`select public.platform_add_domain($1, 'www.exemplo.com.br')`, [tenantA]), /not_allowed/))
    }
    await as('anon', () => rejects(q(`select public.platform_list_tenants()`), /permission denied/))
  })

  test('cria imobiliária com configurações, assinatura e domínio, sem tornar o admin membro', async () => {
    created = await as('platform', async () =>
      (await q(`select public.platform_create_tenant('Imobiliária Nova', 'imob-nova', 'pro', 'https://WWW.ImobNova.com.br/') as id`))[0].id,
    )
    const [t] = await as('server', () => q(`select name, plan_code, status from public.tenants where id = $1`, [created]))
    assert.deepEqual(t, { name: 'Imobiliária Nova', plan_code: 'pro', status: 'active' })
    const [s] = await as('server', () => q(`select display_name from public.tenant_settings where tenant_id = $1`, [created]))
    assert.equal(s.display_name, 'Imobiliária Nova')
    const [sub] = await as('server', () => q(`select plan_code, status from public.subscriptions where tenant_id = $1`, [created]))
    assert.deepEqual(sub, { plan_code: 'pro', status: 'trialing' })
    const members = await as('server', () => q(`select 1 from public.tenant_members where tenant_id = $1`, [created]))
    assert.equal(members.length, 0)
    const resolved = await as('anon', () => q(`select tenant_id from public.resolve_tenant('www.imobnova.com.br', null)`))
    assert.equal(resolved[0].tenant_id, created)
  })

  test('valida slug, plano e domínio duplicados', async () => {
    await as('platform', () => rejects(q(`select public.platform_create_tenant('Outra', 'imob-nova', 'start')`), /slug_taken/))
    await as('platform', () => rejects(q(`select public.platform_create_tenant('Outra', 'Com Espaço', 'start')`), /invalid_slug/))
    await as('platform', () => rejects(q(`select public.platform_create_tenant('Outra', 'outra', 'nao-existe')`), /invalid_plan/))
    await as('platform', () => rejects(q(`select public.platform_add_domain($1, 'www.imobnova.com.br')`, [tenantA]), /domain_taken/))
    await as('platform', () => rejects(q(`select public.platform_add_domain($1, 'sem-ponto')`, [tenantA]), /invalid_domain/))
  })

  test('lista com números e muda plano/situação mantendo a assinatura em sincronia', async () => {
    await as('platform', () => q(`select public.platform_update_tenant($1, 'premium', 'suspended')`, [created]))
    const [list] = await as('platform', () => q(`select public.platform_list_tenants() as data`))
    const row = list.data.find((r) => r.id === created)
    assert.equal(row.plan, 'premium')
    assert.equal(row.status, 'suspended')
    assert.deepEqual(row.domains, ['www.imobnova.com.br'])
    assert.equal(row.owner, null)
    const a = list.data.find((r) => r.id === tenantA)
    assert.equal(a.owner.email, 'ownerA@example.com')
    const [sub] = await as('server', () => q(`select plan_code from public.subscriptions where tenant_id = $1`, [created]))
    assert.equal(sub.plan_code, 'premium')
    // Suspensa: o site deixa de resolver.
    const resolved = await as('anon', () => q(`select tenant_id from public.resolve_tenant('www.imobnova.com.br', null)`))
    assert.equal(resolved.length, 0)
  })
})

describe('verificação em duas etapas (exigida no banco)', () => {
  test('admin da plataforma sem o código (aal1) não tem poderes de plataforma', async () => {
    await as('platform', () => rejects(q(`select public.platform_list_tenants()`), /not_allowed/), 'aal1')
    const seen = await as('platform', () => q(`select slug from public.tenants`), 'aal1')
    assert.equal(seen.length, 0)
    const ok = await as('platform', () => q(`select slug from public.tenants`), 'aal2')
    assert.ok(ok.length >= 3)
  })

  test('quem ativou a verificação só acessa a imobiliária com o código', async () => {
    const before = await as('ownerA', () => q(`select id from public.properties where tenant_id = $1`, [tenantA]))
    await as('server', () => q(`insert into auth.mfa_factors (user_id, status) values ($1, 'verified')`, [U.ownerA]))
    try {
      const tenants = await as('ownerA', () => q(`select id from public.tenants`), 'aal1')
      assert.equal(tenants.length, 0, 'senha sozinha não mostra a imobiliária')
      const props = await as('ownerA', () => q(`select id from public.properties where tenant_id = $1`, [tenantA]), 'aal1')
      assert.equal(props.length, 0)
      await as('ownerA', () =>
        rejects(q(`insert into public.properties (tenant_id, title, type, purpose, price) values ($1, 'X', 'casa', 'venda', 1)`, [tenantA]), /row-level security/),
      'aal1')
      await as('ownerA', () => rejects(q(`select public.tenant_metrics($1, 30)`, [tenantA]), /not allowed|42501|permission/i), 'aal1')
      const withCode = await as('ownerA', () => q(`select id from public.properties where tenant_id = $1`, [tenantA]), 'aal2')
      assert.equal(withCode.length, before.length, 'com o código, tudo como antes')
    } finally {
      await as('server', () => q(`update auth.mfa_factors set status = 'unverified' where user_id = $1`, [U.ownerA]))
    }
  })

  test('fator ainda não confirmado não bloqueia (cadastro em andamento)', async () => {
    const tenants = await as('ownerA', () => q(`select id from public.tenants`), 'aal1')
    assert.equal(tenants.length, 1)
  })
})

describe('modalidade corretor (perfil público, imóveis, depoimentos)', () => {
  const SOLO = '66666666-6666-4666-8666-666666666666'
  let soloBroker
  let agencyBroker
  let soloPublished

  before(async () => {
    await as('server', async () => {
      await q(`insert into public.tenants (id, slug, name, plan_code, kind) values ($1, 'joao-corretor', 'João Corretor', 'corretor', 'solo')`, [SOLO])
      await q(`insert into public.tenant_settings (tenant_id, display_name) values ($1, 'João Corretor')`, [SOLO])
      await q(`insert into public.tenant_members (tenant_id, user_id, role) values ($1, $2, 'owner')`, [SOLO, U.outsider])
      soloBroker = (await q(
        `insert into public.brokers (tenant_id, user_id, name, creci, whatsapp, profile_slug, public_profile, headline)
         values ($1, $2, 'João Silva', 'CRECI 1234', '5584999990000', 'joao-silva', true, 'Especialista em condomínios') returning id`,
        [SOLO, U.outsider],
      ))[0].id
      soloPublished = (await q(`insert into public.properties (tenant_id, title, type, status, city) values ($1, 'Casa do João', 'casa', 'published', 'Natal') returning id`, [SOLO]))[0].id
      await q(`insert into public.properties (tenant_id, title, type, status) values ($1, 'Rascunho do João', 'casa', 'draft')`, [SOLO])
      // Corretor da imobiliária A com página própria.
      agencyBroker = (await q(`select id from public.brokers where tenant_id = $1 and user_id = $2`, [tenantA, U.brokerA]))[0].id
      await q(`update public.brokers set profile_slug = 'corretor-a', public_profile = true where id = $1`, [agencyBroker])
    })
  })

  test('contas existentes continuam como imobiliária', async () => {
    const rows = await as('server', () => q(`select kind from public.tenants where id = any($1)`, [[tenantA, tenantB]]))
    assert.deepEqual(rows.map((r) => r.kind), ['agency', 'agency'])
  })

  test('perfil público: só publicado, ativo e sem dados internos', async () => {
    const [{ p }] = await as('anon', () => q(`select public.get_broker_profile('JOAO-SILVA') as p`))
    assert.equal(p.name, 'João Silva')
    assert.equal(p.account.kind, 'solo')
    assert.equal(p.whatsapp, '5584999990000')
    assert.equal(p.user_id, undefined)
    assert.equal(p.userId, undefined)
    await as('server', () => q(`update public.brokers set public_profile = false where id = $1`, [soloBroker]))
    assert.equal((await as('anon', () => q(`select public.get_broker_profile('joao-silva') as p`)))[0].p, null)
    await as('server', () => q(`update public.brokers set public_profile = true where id = $1`, [soloBroker]))
    await as('server', () => q(`update public.tenants set status = 'suspended' where id = $1`, [SOLO]))
    assert.equal((await as('anon', () => q(`select public.get_broker_profile('joao-silva') as p`)))[0].p, null)
    await as('server', () => q(`update public.tenants set status = 'active' where id = $1`, [SOLO]))
  })

  test('imóveis: autônomo = publicados da conta; de imobiliária = só os que ele atende', async () => {
    const solo = await as('anon', () => q(`select id from public.get_broker_properties('joao-silva')`))
    assert.deepEqual(solo.map((r) => r.id), [soloPublished])
    const agency = await as('anon', () => q(`select id, broker_name from public.get_broker_properties('corretor-a')`))
    assert.ok(agency.length >= 1)
    const owners = await as('server', () => q(`select distinct broker_id from public.properties where id = any($1)`, [agency.map((r) => r.id)]))
    assert.deepEqual(owners.map((r) => r.broker_id), [agencyBroker])
  })

  test('endereço do perfil: único, formato válido e palavras reservadas recusadas', async () => {
    await as('server', () => rejects(q(`update public.brokers set profile_slug = 'joao-silva' where id = $1`, [agencyBroker]), /duplicate key|unique/))
    await as('server', () => rejects(q(`update public.brokers set profile_slug = 'entrar' where id = $1`, [agencyBroker]), /check constraint/))
    await as('server', () => rejects(q(`update public.brokers set profile_slug = 'Com Espaço' where id = $1`, [agencyBroker]), /check constraint/))
  })

  test('corretor edita o próprio perfil, mas não se marca como demonstração', async () => {
    const ok = await as('brokerA', () => q(`update public.brokers set headline = 'Apartamentos no Tirol' where id = $1 returning id`, [agencyBroker]))
    assert.equal(ok.length, 1)
    await as('brokerA', () => rejects(q(`update public.brokers set is_demo = true where id = $1`, [agencyBroker]), /demo flag/))
  })

  test('depoimentos: dono cadastra manual; origem verificada é da plataforma; isolados entre contas', async () => {
    await as('outsider', () => q(`insert into public.broker_testimonials (tenant_id, broker_id, author_name, rating, comment) values ($1, $2, 'Maria', 5, 'Ótimo atendimento')`, [SOLO, soloBroker]))
    await as('outsider', () => q(`insert into public.broker_testimonials (tenant_id, broker_id, author_name, rating, comment, status) values ($1, $2, 'Oculto', 4, 'Não aparece', 'hidden')`, [SOLO, soloBroker]))
    await as('outsider', () =>
      rejects(q(`insert into public.broker_testimonials (tenant_id, broker_id, author_name, rating, comment, source) values ($1, $2, 'Falso', 5, 'Verificado?', 'verified')`, [SOLO, soloBroker]), /managed by the platform/),
    )
    await as('ownerA', () =>
      rejects(q(`insert into public.broker_testimonials (tenant_id, broker_id, author_name, rating, comment) values ($1, $2, 'Intruso', 5, 'Outra conta')`, [SOLO, soloBroker]), /row-level security/),
    )
    assert.equal((await as('ownerA', () => q(`select id from public.broker_testimonials where tenant_id = $1`, [SOLO]))).length, 0)
    await as('anon', () => rejects(q(`select id from public.broker_testimonials`), /permission denied/))
    const pub = await as('anon', () => q(`select author_name, source from public.get_broker_testimonials('joao-silva')`))
    assert.deepEqual(pub, [{ author_name: 'Maria', source: 'manual' }])
  })

  test('contato pela página do corretor chega a ele', async () => {
    const [{ id }] = await as('anon', () =>
      q(`select public.submit_broker_lead('joao-silva', 'form', null, 'Cliente', '84988887777', null, 'Quero ver casas') as id`),
    )
    const [lead] = await as('server', () => q(`select tenant_id, broker_id, source from public.leads where id = $1`, [id]))
    assert.deepEqual(lead, { tenant_id: SOLO, broker_id: soloBroker, source: 'broker_page' })
    await as('anon', () => rejects(q(`select public.submit_broker_lead('nao-existe', 'form', null, 'X', '84988887777')`), /invalid broker/))
  })
})
