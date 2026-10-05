import { integrations } from '@/config/site'
import { getSupabase } from '@/lib/supabase'
import { defaultTenant } from './defaultTenant'
import { brokerSlugFromPath, brokerTenant } from '@/broker/profile'
import type { BrokerProfile } from '@/broker/types'
import { mapTenantProfile } from './mapProfile'
import { clearPreview, previewSlug } from './preview'
import type { PublicTenantProfileRow, TenantConfig } from './types'

export class TenantNotFoundError extends Error {
  constructor(hostname: string) {
    super(`tenant_not_found:${hostname}`)
  }
}

/**
 * Descobre qual imobiliária este site representa.
 * 1. Domínio (subdomínio `x.legalizeone.com` ou domínio próprio) → tabela tenant_domains.
 * 2. Fallback: VITE_DEFAULT_TENANT (mantém localhost e o domínio atual funcionando).
 * Antes de tudo, `?previa=<slug>` (imobiliária nova, ainda sem domínio) — ver preview.ts.
 * Sem backend: sempre a imobiliária padrão (V1).
 */
export async function resolveTenant(hostname: string = window.location.hostname): Promise<TenantConfig> {
  const client = getSupabase()
  if (!client) return defaultTenant
  const supabase = await client

  // Página de corretor: o site representa o corretor (e a conta dele), em qualquer domínio.
  const brokerSlug = brokerSlugFromPath()
  if (brokerSlug) {
    const { data, error } = await supabase.rpc('get_broker_profile', { p_slug: brokerSlug })
    if (error) throw error
    if (!data) throw new TenantNotFoundError(`corretor:${brokerSlug}`)
    return brokerTenant(data as BrokerProfile)
  }

  type Match = { tenant_id: string; slug: string }
  let match: Match | undefined
  const preview = previewSlug()
  if (preview) {
    const { data, error } = await supabase.rpc('resolve_tenant', { p_hostname: null, p_slug: preview })
    if (error) throw error
    match = (data as Match[] | null)?.[0]
    if (!match) clearPreview() // endereço curto inexistente ou suspenso: volta ao site do domínio
  }
  if (!match) {
    const { data: matches, error } = await supabase.rpc('resolve_tenant', {
      p_hostname: hostname,
      p_slug: integrations.defaultTenantSlug,
    })
    if (error) throw error
    // A RPC devolve primeiro o domínio e depois o slug padrão: o domínio tem prioridade.
    match = (matches as Match[] | null)?.[0]
  }
  if (!match) throw new TenantNotFoundError(hostname)
  const isPreview = Boolean(preview && match.slug === preview)

  const { data: profile, error: profileError } = await supabase
    .rpc('get_tenant_profile', { p_tenant_id: match.tenant_id })
    .single<PublicTenantProfileRow>()
  if (profileError) throw profileError
  return { ...mapTenantProfile(profile), preview: isPreview }
}
