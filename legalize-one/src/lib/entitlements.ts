/**
 * PLANOS E ENTITLEMENTS — fonte única para a interface.
 * Espelha a tabela `plans` (supabase/seed.sql); os limites críticos são aplicados
 * pelo banco (trigger `enforce_property_plan`). Valores PROVISÓRIOS, sem cobrança.
 * Use `hasFeature` / `limitOf` / `canAdd` — nunca compare o código do plano no meio da UI.
 */
export type PlanCode = 'start' | 'pro' | 'premium'

export type Feature =
  | 'model3d'
  | 'virtual_tour'
  | 'analytics_advanced'
  | 'reports'
  | 'premium_listings'
  | 'custom_domain'

export type LimitKey = 'max_properties' | 'max_users' | 'max_brokers'

export interface Entitlements {
  plan: PlanCode
  /** `null` = ilimitado. */
  limits: Record<LimitKey, number | null>
  features: Record<Feature, boolean> & { support: 'email' | 'whatsapp' | 'priority' }
}

export const PLANS: Record<PlanCode, Entitlements & { name: string }> = {
  start: {
    plan: 'start',
    name: 'Start',
    limits: { max_properties: 30, max_users: 2, max_brokers: 3 },
    features: {
      model3d: false,
      virtual_tour: true,
      analytics_advanced: false,
      reports: false,
      premium_listings: false,
      custom_domain: false,
      support: 'email',
    },
  },
  pro: {
    plan: 'pro',
    name: 'Pro',
    limits: { max_properties: 150, max_users: 5, max_brokers: 15 },
    features: {
      model3d: true,
      virtual_tour: true,
      analytics_advanced: true,
      reports: true,
      premium_listings: false,
      custom_domain: true,
      support: 'whatsapp',
    },
  },
  premium: {
    plan: 'premium',
    name: 'Premium',
    limits: { max_properties: null, max_users: 15, max_brokers: null },
    features: {
      model3d: true,
      virtual_tour: true,
      analytics_advanced: true,
      reports: true,
      premium_listings: true,
      custom_domain: true,
      support: 'priority',
    },
  },
}

/** Normaliza o JSON de `tenant_entitlements()` (desconhecido → plano Start, o mais restrito). */
export function parseEntitlements(raw: unknown): Entitlements {
  const value = (raw ?? {}) as { plan?: string; limits?: Record<string, unknown>; features?: Record<string, unknown> }
  const base = PLANS[(value.plan as PlanCode) in PLANS ? (value.plan as PlanCode) : 'start']
  const limits = { ...base.limits }
  for (const key of Object.keys(limits) as LimitKey[]) {
    const v = value.limits?.[key]
    if (v === null) limits[key] = null
    else if (typeof v === 'number') limits[key] = v
  }
  const features = { ...base.features }
  for (const key of Object.keys(features) as (keyof typeof features)[]) {
    const v = value.features?.[key]
    if (typeof v === typeof features[key]) (features as Record<string, unknown>)[key] = v
  }
  return { plan: base.plan, limits, features }
}

export function hasFeature(ent: Entitlements, feature: Feature): boolean {
  return ent.features[feature]
}

export function limitOf(ent: Entitlements, key: LimitKey): number | null {
  return ent.limits[key]
}

/** Ainda cabe mais um item? (ex.: canAdd(ent, 'max_properties', imoveisAtivos)) */
export function canAdd(ent: Entitlements, key: LimitKey, current: number): boolean {
  const limit = ent.limits[key]
  return limit === null || current < limit
}
