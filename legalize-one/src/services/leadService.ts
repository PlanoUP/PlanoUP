import { getAttribution } from '@/lib/attribution'
import { getSupabase } from '@/lib/supabase'
import { getTenant } from '@/tenant/store'

export type LeadChannel = 'whatsapp' | 'info_request' | 'visit_request' | 'call' | 'form'

export interface LeadInput {
  channel: LeadChannel
  propertyId?: string | null
  name?: string
  phone?: string
  email?: string
  message?: string
  /** Onde o contato aconteceu (ex.: "sell_page", "property_page"). */
  source: string
}

export type LeadResult = { stored: true; id: string } | { stored: false; reason: 'backend_disabled' | 'error' }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Registra um lead da imobiliária ativa (RPC submit_lead: validação e anti-abuso no banco).
 * Nunca lança: o contato pelo WhatsApp continua funcionando mesmo se o registro falhar.
 */
export async function submitLead(input: LeadInput): Promise<LeadResult> {
  const client = getSupabase()
  const tenantId = getTenant().id
  if (!client || !tenantId) return { stored: false, reason: 'backend_disabled' }
  try {
    const supabase = await client
    const { sessionId, utm, referrer } = getAttribution()
    const { data, error } = await supabase.rpc('submit_lead', {
      p_tenant_id: tenantId,
      p_channel: input.channel,
      p_property_id: input.propertyId && UUID.test(input.propertyId) ? input.propertyId : null,
      p_name: input.name?.trim() || null,
      p_phone: input.phone?.replace(/\D/g, '') || null,
      p_email: input.email?.trim() || null,
      p_message: input.message?.slice(0, 2000) || null,
      p_source: input.source,
      p_page_path: window.location.pathname,
      p_referrer: referrer || null,
      p_session_id: sessionId,
      p_utm: utm,
    })
    if (error) throw error
    return { stored: true, id: String(data) }
  } catch {
    return { stored: false, reason: 'error' }
  }
}
