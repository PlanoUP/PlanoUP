/**
 * Aviso de contato novo por e-mail — regras (sem Deno/Supabase; testadas no Vitest).
 * A Edge Function `notify-lead` (index.ts) busca os dados com a chave de serviço e envia pelo Resend.
 */
export interface LeadForNotice {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  message: string | null
  channel: string
  source: string | null
  created_at: string
  notified_at: string | null
}

/** Só avisa contatos recentes, ainda não avisados e identificados (clique anônimo no WhatsApp não gera e-mail). */
export function shouldNotify(lead: LeadForNotice | null, now: Date): boolean {
  if (!lead || lead.notified_at) return false
  if (!lead.name || (!lead.phone && !lead.email)) return false
  return now.getTime() - new Date(lead.created_at).getTime() <= 10 * 60 * 1000
}

/** E-mails únicos, válidos, em minúsculas. */
export function recipients(emails: (string | null | undefined)[]): string[] {
  const ok = emails.map((e) => (e ?? '').trim().toLowerCase()).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))
  return [...new Set(ok)]
}

const CHANNELS: Record<string, string> = {
  info_request: 'Pediu que liguem',
  visit_request: 'Pediu uma visita',
  form: 'Formulário do site',
  whatsapp: 'WhatsApp',
  call: 'Ligação',
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

function phoneDisplay(digits: string): string {
  const d = digits.replace(/^55(?=\d{10,11}$)/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return digits
}

export function buildLeadEmail(input: {
  tenantName: string
  lead: LeadForNotice
  propertyTitle: string | null
  panelUrl: string
}): { subject: string; text: string; html: string } {
  const { lead } = input
  const what = CHANNELS[lead.channel] ?? 'Contato pelo site'
  const subject = `Novo contato: ${lead.name}${input.propertyTitle ? ` · ${input.propertyTitle}` : ''}`
  const rows: [string, string][] = [
    ['Nome', lead.name ?? ''],
    ['Tipo', what],
    ...(input.propertyTitle ? ([['Imóvel', input.propertyTitle]] as [string, string][]) : []),
    ...(lead.phone ? ([['Telefone', phoneDisplay(lead.phone)]] as [string, string][]) : []),
    ...(lead.email ? ([['E-mail', lead.email]] as [string, string][]) : []),
    ...(lead.message ? ([['Mensagem', lead.message]] as [string, string][]) : []),
  ]
  const whatsapp = lead.phone ? `https://wa.me/${lead.phone.length <= 11 ? `55${lead.phone}` : lead.phone}` : null
  const text = [
    `Novo contato no site da ${input.tenantName}.`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    `Abrir no painel: ${input.panelUrl}`,
    ...(whatsapp ? [`Responder no WhatsApp: ${whatsapp}`] : []),
    '',
    'Responder rápido aumenta muito a chance de fechar.',
  ].join('\n')
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;color:#0b1f4d">
<p style="font-size:16px">Novo contato no site da <strong>${esc(input.tenantName)}</strong>.</p>
<table style="border-collapse:collapse;font-size:15px">${rows
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#667085">${esc(k)}</td><td style="padding:4px 0"><strong>${esc(v)}</strong></td></tr>`)
    .join('')}</table>
<p style="margin-top:20px"><a href="${esc(input.panelUrl)}" style="background:#0b1f4d;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold">Abrir no painel</a>${
    whatsapp ? ` <a href="${esc(whatsapp)}" style="margin-left:8px;color:#1f8a5b;font-weight:bold">Responder no WhatsApp</a>` : ''
  }</p>
<p style="color:#667085;font-size:13px">Responder rápido aumenta muito a chance de fechar.</p></div>`
  return { subject, text, html }
}
