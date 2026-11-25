-- =====================================================================================
-- Legalize Corretor · Fase 01 — CRM (agenda, propostas, histórico), planos comerciais,
-- redes do corretor e cadastro aberto com aprovação.
-- Só acréscimos: nenhuma tabela, coluna ou política existente é removida ou muda de sentido.
-- =====================================================================================

-- ---------------------------------------------------------------------------
-- Acesso a um contato: gerente da conta, admin da plataforma ou o corretor responsável.
-- ---------------------------------------------------------------------------
create function private.can_access_lead(p_tenant_id uuid, p_lead_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_tenant_manager(p_tenant_id) or private.is_platform_admin()
    or exists (select 1 from public.leads l
               where l.id = p_lead_id and l.tenant_id = p_tenant_id
                 and l.broker_id is not null and l.broker_id = private.current_broker_id(p_tenant_id))
$$;
revoke execute on function private.can_access_lead(uuid, uuid) from public, anon;
grant execute on function private.can_access_lead(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Agenda: tarefas, ligações, visitas e retornos
-- ---------------------------------------------------------------------------
create table public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  lead_id uuid,
  property_id uuid,
  broker_id uuid,
  kind text not null default 'task' check (kind in ('task', 'call', 'visit', 'follow_up')),
  title text not null check (char_length(title) between 2 and 140),
  notes text check (char_length(notes) <= 2000),
  due_at timestamptz not null,
  done_at timestamptz,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, lead_id) references public.leads (tenant_id, id) on delete cascade,
  foreign key (tenant_id, property_id) references public.properties (tenant_id, id) on delete set null (property_id),
  foreign key (tenant_id, broker_id) references public.brokers (tenant_id, id) on delete set null (broker_id)
);
create index crm_tasks_due_idx on public.crm_tasks (tenant_id, done_at, due_at);
create index crm_tasks_lead_idx on public.crm_tasks (lead_id);
create trigger crm_tasks_updated_at before update on public.crm_tasks
  for each row execute function public.set_updated_at();
create trigger crm_tasks_tenant_immutable before update on public.crm_tasks
  for each row execute function public.prevent_tenant_change();

-- ---------------------------------------------------------------------------
-- Propostas
-- ---------------------------------------------------------------------------
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  lead_id uuid not null,
  property_id uuid,
  amount numeric(14, 2) not null check (amount > 0 and amount < 1000000000),
  terms text check (char_length(terms) <= 1000),
  status text not null default 'open' check (status in ('open', 'accepted', 'rejected', 'withdrawn')),
  proposed_on date not null default current_date,
  notes text check (char_length(notes) <= 2000),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, lead_id) references public.leads (tenant_id, id) on delete cascade,
  foreign key (tenant_id, property_id) references public.properties (tenant_id, id) on delete set null (property_id)
);
create index proposals_lead_idx on public.proposals (lead_id, proposed_on desc);
create index proposals_tenant_idx on public.proposals (tenant_id, proposed_on desc);
create trigger proposals_updated_at before update on public.proposals
  for each row execute function public.set_updated_at();
create trigger proposals_tenant_immutable before update on public.proposals
  for each row execute function public.prevent_tenant_change();

-- ---------------------------------------------------------------------------
-- Histórico do contato (escrito só por gatilhos)
-- ---------------------------------------------------------------------------
create table public.lead_events (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  lead_id uuid not null,
  kind text not null check (kind in ('created', 'status', 'assigned', 'note', 'task_created', 'task_done',
                                     'proposal', 'proposal_status')),
  detail jsonb not null default '{}'::jsonb check (jsonb_typeof(detail) = 'object'),
  actor_id uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (tenant_id, lead_id) references public.leads (tenant_id, id) on delete cascade
);
create index lead_events_lead_idx on public.lead_events (lead_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.crm_tasks enable row level security;
alter table public.proposals enable row level security;
alter table public.lead_events enable row level security;
grant select, insert, update, delete on public.crm_tasks to authenticated;
grant select, insert, update, delete on public.proposals to authenticated;
grant select on public.lead_events to authenticated;

-- Tarefas: gerente vê/edita todas; corretor vê/edita as dele e as dos contatos que atende.
-- Corretor cria tarefa só em nome próprio.
create policy crm_tasks_select on public.crm_tasks for select to authenticated
  using (private.is_tenant_manager(tenant_id) or private.is_platform_admin()
         or (broker_id is not null and broker_id = private.current_broker_id(tenant_id))
         or (lead_id is not null and private.can_access_lead(tenant_id, lead_id)));
create policy crm_tasks_insert on public.crm_tasks for insert to authenticated
  with check (private.is_tenant_manager(tenant_id) or private.is_platform_admin()
              or (broker_id is not null and broker_id = private.current_broker_id(tenant_id)
                  and (lead_id is null or private.can_access_lead(tenant_id, lead_id))));
create policy crm_tasks_update on public.crm_tasks for update to authenticated
  using (private.is_tenant_manager(tenant_id) or private.is_platform_admin()
         or (broker_id is not null and broker_id = private.current_broker_id(tenant_id)))
  with check (private.is_tenant_manager(tenant_id) or private.is_platform_admin()
              or (broker_id is not null and broker_id = private.current_broker_id(tenant_id)));
create policy crm_tasks_delete on public.crm_tasks for delete to authenticated
  using (private.is_tenant_manager(tenant_id) or private.is_platform_admin()
         or (broker_id is not null and broker_id = private.current_broker_id(tenant_id)));

-- Propostas: quem atende o contato.
create policy proposals_select on public.proposals for select to authenticated
  using (private.can_access_lead(tenant_id, lead_id));
create policy proposals_insert on public.proposals for insert to authenticated
  with check (private.can_access_lead(tenant_id, lead_id));
create policy proposals_update on public.proposals for update to authenticated
  using (private.can_access_lead(tenant_id, lead_id))
  with check (private.can_access_lead(tenant_id, lead_id));
create policy proposals_delete on public.proposals for delete to authenticated
  using (private.is_tenant_manager(tenant_id) or private.is_platform_admin());

create policy lead_events_select on public.lead_events for select to authenticated
  using (private.can_access_lead(tenant_id, lead_id));

-- ---------------------------------------------------------------------------
-- Gatilhos: histórico e avanço automático do funil
-- (comparações por texto: não dependem da ordem dos valores do enum)
-- ---------------------------------------------------------------------------
create function public.log_lead_event() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_status text;
begin
  if tg_table_name = 'leads' then
    if tg_op = 'INSERT' then
      insert into public.lead_events (tenant_id, lead_id, kind, detail)
      values (new.tenant_id, new.id, 'created', jsonb_build_object('channel', new.channel, 'source', new.source));
    else
      if new.status is distinct from old.status then
        insert into public.lead_events (tenant_id, lead_id, kind, detail)
        values (new.tenant_id, new.id, 'status', jsonb_build_object('from', old.status, 'to', new.status));
      end if;
      if new.broker_id is distinct from old.broker_id then
        insert into public.lead_events (tenant_id, lead_id, kind, detail)
        values (new.tenant_id, new.id, 'assigned', jsonb_build_object('from', old.broker_id, 'to', new.broker_id));
      end if;
    end if;
    return new;

  elsif tg_table_name = 'lead_notes' then
    insert into public.lead_events (tenant_id, lead_id, kind, detail)
    values (new.tenant_id, new.lead_id, 'note', jsonb_build_object('note_id', new.id));
    return new;

  elsif tg_table_name = 'crm_tasks' then
    if new.lead_id is null then
      return new;
    end if;
    if tg_op = 'INSERT' then
      insert into public.lead_events (tenant_id, lead_id, kind, detail)
      values (new.tenant_id, new.lead_id, 'task_created',
              jsonb_build_object('task_id', new.id, 'kind', new.kind, 'title', new.title, 'due_at', new.due_at));
      -- Visita marcada leva o contato para "Visita agendada" se ele ainda estiver antes dessa etapa.
      if new.kind = 'visit' then
        select status::text into v_status from public.leads where id = new.lead_id;
        if v_status in ('new', 'contacted', 'qualified') then
          update public.leads set status = 'visit_scheduled' where id = new.lead_id;
        end if;
      end if;
    elsif new.done_at is not null and old.done_at is null then
      insert into public.lead_events (tenant_id, lead_id, kind, detail)
      values (new.tenant_id, new.lead_id, 'task_done', jsonb_build_object('task_id', new.id, 'kind', new.kind, 'title', new.title));
    end if;
    return new;

  else -- proposals
    if tg_op = 'INSERT' then
      insert into public.lead_events (tenant_id, lead_id, kind, detail)
      values (new.tenant_id, new.lead_id, 'proposal',
              jsonb_build_object('proposal_id', new.id, 'amount', new.amount, 'status', new.status));
      select status::text into v_status from public.leads where id = new.lead_id;
      if v_status in ('new', 'contacted', 'qualified', 'visit_scheduled', 'negotiation') then
        update public.leads set status = 'proposal' where id = new.lead_id;
      end if;
    elsif new.status is distinct from old.status then
      insert into public.lead_events (tenant_id, lead_id, kind, detail)
      values (new.tenant_id, new.lead_id, 'proposal_status',
              jsonb_build_object('proposal_id', new.id, 'amount', new.amount, 'from', old.status, 'to', new.status));
      -- Proposta aceita = negócio ganho (o corretor pode voltar a etapa manualmente).
      if new.status = 'accepted' then
        update public.leads set status = 'converted' where id = new.lead_id and status::text <> 'converted';
      end if;
    end if;
    return new;
  end if;
end $$;
revoke execute on function public.log_lead_event() from public, anon, authenticated;

create trigger leads_log after insert or update on public.leads
  for each row execute function public.log_lead_event();
create trigger lead_notes_log after insert on public.lead_notes
  for each row execute function public.log_lead_event();
create trigger crm_tasks_log after insert or update on public.crm_tasks
  for each row execute function public.log_lead_event();
create trigger proposals_log after insert or update on public.proposals
  for each row execute function public.log_lead_event();

-- Contatos que já existiam ganham o evento de criação (com a data original).
insert into public.lead_events (tenant_id, lead_id, kind, detail, actor_id, created_at)
select l.tenant_id, l.id, 'created', jsonb_build_object('channel', l.channel, 'source', l.source), null, l.created_at
from public.leads l;

-- ---------------------------------------------------------------------------
-- Planos comerciais (preços de teste, editáveis pelo admin da plataforma; sem cobrança)
-- ---------------------------------------------------------------------------
alter table public.plans
  add column public_name text check (char_length(public_name) <= 60),
  add column audience text check (audience in ('agency', 'solo')),
  add column setup_fee numeric(10, 2) check (setup_fee >= 0),
  add column monthly_fee numeric(10, 2) check (monthly_fee >= 0),
  add column highlights text[] not null default '{}' check (cardinality(highlights) <= 12);

insert into public.plans (code, name, public_name, audience, position, setup_fee, monthly_fee, highlights, limits, features) values
  ('presenca_pro', 'Presença Pro', 'PRESENÇA PRO', 'solo', 10, 990, 99,
   array['Site profissional', 'Vitrine de imóveis', 'Integração com WhatsApp', 'CRM básico', 'Indicadores essenciais'],
   '{"max_properties": 50, "max_users": 1, "max_brokers": 1}',
   '{"model3d": false, "virtual_tour": false, "analytics_advanced": false, "reports": false, "premium_listings": false, "custom_domain": false, "qr_codes": false, "support": "whatsapp"}'),
  ('legalize_premium', 'Legalize Premium', 'LEGALIZE PREMIUM', 'solo', 11, 2490, 249,
   array['Tudo do Presença Pro', 'Dashboard comercial avançado', 'Relatórios para proprietários', 'QR Codes rastreáveis',
         'Recursos de apresentação premium', 'Acompanhamento ampliado'],
   '{"max_properties": 150, "max_users": 2, "max_brokers": 1}',
   '{"model3d": true, "virtual_tour": true, "analytics_advanced": true, "reports": true, "premium_listings": true, "custom_domain": false, "qr_codes": true, "support": "priority"}')
on conflict (code) do nothing;

-- Admin da plataforma ajusta nome comercial, preços, destaques e se o plano está à venda.
-- Limites e recursos continuam só por migration (afetam regras do banco).
grant update (public_name, setup_fee, monthly_fee, highlights, active) on public.plans to authenticated;
create policy plans_update on public.plans for update to authenticated
  using (private.is_platform_admin()) with check (private.is_platform_admin());

-- ---------------------------------------------------------------------------
-- Página do corretor: outras redes e descrição para buscadores
-- ---------------------------------------------------------------------------
alter table public.brokers
  add column social_links jsonb not null default '{}'::jsonb
    check (jsonb_typeof(social_links) = 'object' and pg_column_size(social_links) <= 2048),
  add column seo_description text check (char_length(seo_description) <= 160);

create or replace function public.get_broker_profile(p_slug text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'brokerId', b.id, 'tenantId', b.tenant_id, 'slug', b.profile_slug, 'isDemo', b.is_demo,
    'name', b.name, 'creci', b.creci, 'photoUrl', b.photo_url, 'coverUrl', b.cover_url, 'logoUrl', b.logo_url,
    'professionalTitle', b.professional_title, 'tagline', b.tagline,
    'headline', b.headline, 'bio', b.bio, 'city', b.city, 'state', b.state, 'yearsExperience', b.years_experience,
    'specialties', b.specialties, 'regions', b.regions, 'languages', b.languages, 'highlights', b.highlights,
    'whatsapp', b.whatsapp, 'phone', b.phone, 'email', b.email, 'instagramUrl', b.instagram_url,
    'accentColor', b.accent_color, 'socialLinks', b.social_links, 'seoDescription', b.seo_description,
    'account', jsonb_build_object('kind', t.kind, 'slug', t.slug, 'name', s.display_name, 'logoUrl', s.logo_url,
                                  'primaryColor', s.primary_color, 'secondaryColor', s.secondary_color)
  )
  from private.public_broker(p_slug) b
  join public.tenants t on t.id = b.tenant_id
  join public.tenant_settings s on s.tenant_id = b.tenant_id
$$;

-- ---------------------------------------------------------------------------
-- Cadastro aberto do corretor autônomo (conta nasce aguardando aprovação)
-- ---------------------------------------------------------------------------
create function public.create_solo_account(p_name text, p_slug text, p_creci text default null, p_whatsapp text default null)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_slug text := lower(trim(p_slug));
  v_name text := trim(p_name);
  v_phone text := nullif(regexp_replace(coalesce(p_whatsapp, ''), '[^0-9]', '', 'g'), '');
  v_id uuid;
  v_broker uuid;
begin
  if v_user is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  -- Uma conta por pessoa (evita contas em série enquanto não há cobrança).
  if exists (select 1 from public.tenant_members where user_id = v_user) then
    raise exception 'user already has an account' using errcode = '23505';
  end if;
  if v_slug is null or v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(v_slug) not between 3 and 48
     or private.is_reserved_slug(v_slug) then
    raise exception 'invalid slug' using errcode = '22023';
  end if;
  if v_name is null or char_length(v_name) not between 2 and 120 then
    raise exception 'invalid name' using errcode = '22023';
  end if;
  if v_phone is not null and v_phone !~ '^[0-9]{10,13}$' then
    raise exception 'invalid whatsapp' using errcode = '22023';
  end if;
  if exists (select 1 from public.tenants where slug = v_slug)
     or exists (select 1 from public.brokers where profile_slug = v_slug) then
    raise exception 'slug already taken' using errcode = '23505';
  end if;

  insert into public.tenants (slug, name, status, plan_code, kind, created_by)
  values (v_slug, v_name, 'pending', 'presenca_pro', 'solo', v_user) returning id into v_id;
  insert into public.tenant_settings (tenant_id, display_name, creci, whatsapp)
  values (v_id, v_name, nullif(trim(p_creci), ''), v_phone);
  insert into public.subscriptions (tenant_id, plan_code, status) values (v_id, 'presenca_pro', 'trialing');
  insert into public.tenant_members (tenant_id, user_id, role) values (v_id, v_user, 'owner');
  insert into public.brokers (tenant_id, user_id, name, creci, whatsapp, profile_slug, public_profile, professional_title)
  values (v_id, v_user, v_name, nullif(trim(p_creci), ''), v_phone, v_slug, false, 'Corretor de imóveis')
  returning id into v_broker;
  return v_id;
end $$;
revoke execute on function public.create_solo_account(text, text, text, text) from public, anon;
grant execute on function public.create_solo_account(text, text, text, text) to authenticated;
