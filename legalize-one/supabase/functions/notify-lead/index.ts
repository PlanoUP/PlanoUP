// Edge Function `notify-lead`: e-mail para os gerentes (e o corretor responsável) quando chega um contato.
// Chamada pelo site logo após registrar o contato. Sem login (o visitante é anônimo): só age sobre contatos
// reais, recentes e ainda não avisados, uma única vez. Regras em ./core.ts.
// Envio pelo Resend: segredo RESEND_API_KEY (e RESEND_FROM, opcional) no Supabase; sem ele, não envia nada.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildLeadEmail, recipients, shouldNotify, type LeadForNotice } from './core.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })
  let leadId = ''
  try {
    leadId = String((await req.json())?.leadId ?? '')
  } catch {
    return json(400, { error: 'invalid_body' })
  }
  if (!UUID.test(leadId)) return json(400, { error: 'invalid_lead' })

  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) return json(200, { sent: false, reason: 'email_not_configured' })
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    const { data: lead } = await admin
      .from('leads')
      .select('id, tenant_id, property_id, broker_id, name, phone, email, message, channel, source, created_at, notified_at')
      .eq('id', leadId)
      .maybeSingle()
    if (!shouldNotify(lead as LeadForNotice | null, new Date())) return json(200, { sent: false, reason: 'not_applicable' })

    // Marca antes de enviar: chamadas repetidas não geram e-mail duplicado.
    const { data: claimed } = await admin
      .from('leads')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', leadId)
      .is('notified_at', null)
      .select('id')
    if (!claimed?.length) return json(200, { sent: false, reason: 'already_notified' })

    const [{ data: settings }, { data: members }, { data: property }, { data: broker }, { data: domain }] = await Promise.all([
      admin.from('tenant_settings').select('display_name').eq('tenant_id', lead!.tenant_id).maybeSingle(),
      admin.from('tenant_members').select('user_id').eq('tenant_id', lead!.tenant_id).in('role', ['owner', 'admin']),
      lead!.property_id
        ? admin.from('properties').select('title').eq('id', lead!.property_id).maybeSingle()
        : Promise.resolve({ data: null }),
      lead!.broker_id
        ? admin.from('brokers').select('user_id, email').eq('id', lead!.broker_id).maybeSingle()
        : Promise.resolve({ data: null }),
      admin.from('tenant_domains').select('hostname').eq('tenant_id', lead!.tenant_id).order('is_primary', { ascending: false }).limit(1).maybeSingle(),
    ])

    const userIds = [...(members ?? []).map((m) => m.user_id as string), ...(broker?.user_id ? [broker.user_id as string] : [])]
    const emails: (string | null)[] = [broker?.email ?? null]
    for (const id of new Set(userIds)) {
      const { data } = await admin.auth.admin.getUserById(id)
      emails.push(data?.user?.email ?? null)
    }
    const to = recipients(emails)
    if (!to.length) return json(200, { sent: false, reason: 'no_recipients' })

    const origin = domain?.hostname ? `https://${domain.hostname}` : Deno.env.get('PANEL_URL') ?? 'https://legalize-one.vercel.app'
    const mail = buildLeadEmail({
      tenantName: (settings?.display_name as string | undefined) ?? 'sua imobiliária',
      lead: lead as LeadForNotice,
      propertyTitle: (property?.title as string | undefined) ?? null,
      panelUrl: `${origin}/dashboard/contatos/${leadId}`,
    })
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: Deno.env.get('RESEND_FROM') ?? 'Impulsigo <onboarding@resend.dev>', to, ...mail }),
    })
    if (!r.ok) {
      console.error('resend_error', r.status, await r.text())
      return json(200, { sent: false, reason: 'provider_error' })
    }
    return json(200, { sent: true, recipients: to.length })
  } catch (error) {
    console.error('notify_error', error)
    return json(200, { sent: false, reason: 'internal_error' })
  }
})
