import { requireSupabase } from '@/lib/supabase'
import { PanelError } from './propertiesApi'

/** Painel da plataforma: imobiliárias clientes (RPCs `platform_*`, só admin da plataforma). */

export type TenantStatus = 'active' | 'suspended'

export interface PlatformTenant {
  id: string
  slug: string
  name: string
  status: TenantStatus
  plan: string
  createdAt: string
  members: number
  properties: number
  published: number
  leads30d: number
  owner: { name: string; email: string } | null
  domains: string[]
}

export interface PlanOption {
  code: string
  name: string
  limits: { max_properties?: number | null; max_users?: number | null; max_brokers?: number | null }
}

const MESSAGES: Record<string, string> = {
  not_allowed: 'Só o administrador da plataforma pode fazer isso.',
  invalid_name: 'Informe o nome da imobiliária (2 a 120 letras).',
  invalid_slug: 'Endereço curto inválido: use letras minúsculas, números e hífen (3 a 48).',
  slug_taken: 'Já existe uma imobiliária com este endereço curto.',
  invalid_plan: 'Plano inválido.',
  invalid_domain: 'Domínio inválido. Exemplo: www.imobiliaria.com.br',
  domain_taken: 'Este domínio já está ligado a outra imobiliária.',
  tenant_not_found: 'Imobiliária não encontrada.',
}

function fail(error: { message?: string }): never {
  const code = Object.keys(MESSAGES).find((k) => error.message?.includes(k))
  throw new PanelError(code ? MESSAGES[code] : 'Não foi possível concluir agora. Tente novamente em instantes.')
}

export async function listTenants(): Promise<PlatformTenant[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.rpc('platform_list_tenants')
  if (error) fail(error)
  return (data ?? []) as PlatformTenant[]
}

export async function listPlans(): Promise<PlanOption[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('plans').select('code, name, limits').eq('active', true).order('position')
  if (error) fail(error)
  return (data ?? []) as PlanOption[]
}

export async function createTenant(input: { name: string; slug: string; plan: string; hostname: string }): Promise<string> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.rpc('platform_create_tenant', {
    p_name: input.name,
    p_slug: input.slug,
    p_plan: input.plan,
    p_hostname: input.hostname || null,
  })
  if (error) fail(error)
  return data as string
}

export async function updateTenant(tenantId: string, change: { plan?: string; status?: TenantStatus }): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.rpc('platform_update_tenant', {
    p_tenant_id: tenantId,
    p_plan: change.plan ?? null,
    p_status: change.status ?? null,
  })
  if (error) fail(error)
}

export async function addDomain(tenantId: string, hostname: string): Promise<string> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.rpc('platform_add_domain', { p_tenant_id: tenantId, p_hostname: hostname })
  if (error) fail(error)
  return data as string
}

/** Endereço curto sugerido a partir do nome ("Imobiliária São João" → "imobiliaria-sao-joao"). */
export function suggestSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/, '')
}

/** Site da imobiliária: domínio próprio ou, sem domínio, a pré-visualização pelo endereço curto. */
export function siteUrl(tenant: Pick<PlatformTenant, 'slug' | 'domains'>, origin = window.location.origin): string {
  return tenant.domains[0] ? `https://${tenant.domains[0]}` : `${origin}/?previa=${tenant.slug}`
}

/** Link de entrada no painel (com a marca da imobiliária quando ainda não há domínio). */
export function loginUrl(tenant: Pick<PlatformTenant, 'slug' | 'domains'>, origin = window.location.origin): string {
  return tenant.domains[0] ? `https://${tenant.domains[0]}/entrar` : `${origin}/entrar?previa=${tenant.slug}`
}
