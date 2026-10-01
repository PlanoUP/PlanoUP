import { integrations } from '@/config/site'
import { getSupabase } from '@/lib/supabase'
import { defaultTenant } from './defaultTenant'
import { mapTenantProfile } from './mapProfile'
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
 * Sem backend: sempre a imobiliária padrão (V1).
 */
export async function resolveTenant(hostname: string = window.location.hostname): Promise<TenantConfig> {
  const client = getSupabase()
  if (!client) return defaultTenant
  const supabase = await client

  const { data: matches, error } = await supabase.rpc('resolve_tenant', {
    p_hostname: hostname,
    p_slug: integrations.defaultTenantSlug,
  })
  if (error) throw error
  // A RPC devolve primeiro o domínio e depois o slug padrão: o domínio tem prioridade.
  const match = (matches as { tenant_id: string; slug: string }[] | null)?.[0]
  if (!match) throw new TenantNotFoundError(hostname)

  const { data: profile, error: profileError } = await supabase
    .from('public_tenant_profiles')
    .select('*')
    .eq('tenant_id', match.tenant_id)
    .single<PublicTenantProfileRow>()
  if (profileError) throw profileError
  return mapTenantProfile(profile)
}
