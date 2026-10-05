import { requireSupabase } from '@/lib/supabase'
import { PanelError, friendlyDbError } from './propertiesApi'

/** Contatos (leads) da imobiliária. Quem vê/altera o quê: políticas do banco (RLS). */

export type LeadStatus = 'new' | 'contacted' | 'visit_scheduled' | 'negotiation' | 'converted' | 'lost'
export type LeadChannel = 'whatsapp' | 'info_request' | 'visit_request' | 'call' | 'form'

export const LEAD_STATUS_ORDER: LeadStatus[] = ['new', 'contacted', 'visit_scheduled', 'negotiation', 'converted', 'lost']

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Em atendimento',
  visit_scheduled: 'Visita agendada',
  negotiation: 'Em negociação',
  converted: 'Fechado',
  lost: 'Perdido',
}

export const LEAD_CHANNEL_LABELS: Record<LeadChannel, string> = {
  whatsapp: 'WhatsApp',
  info_request: 'Pedido de informações',
  visit_request: 'Pedido de visita',
  call: 'Ligação',
  form: 'Formulário do site',
}

/** Origem (campo `source`) em linguagem simples. */
export function sourceLabel(source: string | null): string | null {
  if (!source) return null
  const known: Record<string, string> = {
    sell_page: 'Página "Vender"',
    vender: 'Página "Vender"',
    property_page: 'Página do imóvel',
    painel: 'Registrado no painel',
    impulsigo_site: 'Site Impulsigo (pedido de demonstração)',
  }
  return known[source] ?? source
}

export interface Lead {
  id: string
  tenant_id: string
  property_id: string | null
  broker_id: string | null
  name: string | null
  phone: string | null
  email: string | null
  message: string | null
  channel: LeadChannel
  status: LeadStatus
  source: string | null
  page_path: string | null
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  created_at: string
  updated_at: string
}

export interface LeadNote {
  id: string
  author_id: string | null
  body: string
  created_at: string
}

export interface NewLeadInput {
  name: string
  phone: string | null
  email: string | null
  channel: LeadChannel
  property_id: string | null
  broker_id: string | null
  message: string | null
}

const COLUMNS =
  'id, tenant_id, property_id, broker_id, name, phone, email, message, channel, status, source, page_path, referrer, utm_source, utm_medium, utm_campaign, created_at, updated_at'

function fail(error: { code?: string; message?: string }): never {
  if (/leads_phone_check|phone/.test(error.message ?? '') && error.code === '23514')
    throw new PanelError('Telefone inválido. Use DDD + número, só com dígitos.')
  if (/leads_email_check/.test(error.message ?? '')) throw new PanelError('E-mail inválido.')
  throw new PanelError(friendlyDbError(error))
}

export async function listLeads(tenantId: string): Promise<Lead[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from('leads')
    .select(COLUMNS)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1000)
  if (error) fail(error)
  return (data ?? []) as Lead[]
}

export async function countNewLeads(tenantId: string): Promise<number> {
  const supabase = await requireSupabase()
  const { count, error } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'new')
  if (error) fail(error)
  return count ?? 0
}

export async function getLead(tenantId: string, id: string): Promise<Lead | null> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('leads').select(COLUMNS).eq('tenant_id', tenantId).eq('id', id).maybeSingle()
  if (error) fail(error)
  return (data as Lead | null) ?? null
}

export async function updateLead(
  tenantId: string,
  id: string,
  patch: Partial<Pick<Lead, 'status' | 'broker_id' | 'name' | 'phone' | 'email' | 'property_id'>>,
): Promise<Lead> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('leads').update(patch).eq('tenant_id', tenantId).eq('id', id).select(COLUMNS)
  if (error) fail(error)
  if (!data?.length) throw new PanelError('Você não tem permissão para alterar este contato.')
  return data[0] as Lead
}

export async function createLead(tenantId: string, input: NewLeadInput): Promise<string> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from('leads')
    .insert({ ...input, tenant_id: tenantId, source: 'painel' })
    .select('id')
    .single()
  if (error) fail(error)
  return data.id as string
}

export async function deleteLead(tenantId: string, id: string): Promise<void> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('leads').delete().eq('tenant_id', tenantId).eq('id', id).select('id')
  if (error) fail(error)
  if (!data?.length) throw new PanelError('Você não tem permissão para excluir este contato.')
}

export async function listNotes(leadId: string): Promise<LeadNote[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from('lead_notes')
    .select('id, author_id, body, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  if (error) fail(error)
  return (data ?? []) as LeadNote[]
}

export async function addNote(tenantId: string, leadId: string, authorId: string, body: string): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.from('lead_notes').insert({ tenant_id: tenantId, lead_id: leadId, author_id: authorId, body })
  if (error) fail(error)
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.from('lead_notes').delete().eq('id', id)
  if (error) fail(error)
}

/** Nomes dos colegas (autores das anotações). */
export async function teamNames(userIds: string[]): Promise<Record<string, string>> {
  const ids = [...new Set(userIds)].filter(Boolean)
  if (!ids.length) return {}
  const supabase = await requireSupabase()
  const { data } = await supabase.from('profiles').select('id, full_name').in('id', ids)
  return Object.fromEntries((data ?? []).map((p) => [p.id as string, (p.full_name as string | null) ?? 'Equipe']))
}

/** Telefone para WhatsApp: números brasileiros sem DDI ganham o 55. */
export function whatsappNumber(phone: string | null): string | null {
  const d = (phone ?? '').replace(/\D/g, '')
  if (!d) return null
  return d.length === 10 || d.length === 11 ? `55${d}` : d
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

/** "01 out, 15:42" */
export function formatWhen(iso: string): string {
  return dateFormat.format(new Date(iso)).replace('.', '')
}
