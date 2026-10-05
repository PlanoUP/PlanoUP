import { requireSupabase } from '@/lib/supabase'
import { PanelError, friendlyDbError } from './propertiesApi'

/** Resultados da imobiliária (função `tenant_metrics` no banco; só gestores). */

export interface MetricTotals {
  visitors: number
  page_views: number
  property_views: number
  property_viewers: number
  model3d_opens: number
  model3d_interactions: number
  tour_opens: number
  immersive_sessions: number
  whatsapp_clicks: number
  visit_requests: number
  intent_sessions: number
  searches: number
  leads: number
}

export interface DailyMetric {
  day: string
  visitors: number
  contacts: number
  leads: number
}

export interface PropertyMetric {
  id: string
  title: string
  code: string | null
  slug: string
  status: string
  has3d: boolean
  has_tour: boolean
  views: number
  viewers: number
  model3d_opens: number
  tour_opens: number
  immersive_sessions: number
  whatsapp_clicks: number
  visit_requests: number
  intent_sessions: number
  leads: number
}

export interface SourceMetric {
  source: string
  visitors: number
}

export interface TenantMetrics {
  period: { days: number; from: string; to: string }
  totals: MetricTotals
  previous: MetricTotals
  daily: DailyMetric[]
  properties: PropertyMetric[]
  sources: SourceMetric[]
}

export const PERIODS = [7, 30, 90] as const
export type PeriodDays = (typeof PERIODS)[number]

export async function getMetrics(tenantId: string, days: PeriodDays): Promise<TenantMetrics> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.rpc('tenant_metrics', { p_tenant_id: tenantId, p_days: days })
  if (error) throw new PanelError(/not allowed/.test(error.message) ? 'Resultados disponíveis só para gerentes.' : friendlyDbError(error))
  return data as TenantMetrics
}

/** Variação contra o período anterior (null quando não há base de comparação). */
export function delta(current: number, previous: number): number | null {
  if (!previous) return null
  return (current - previous) / previous
}

const SOURCE_NAMES: Record<string, string> = {
  direto: 'Acesso direto',
  'google.com': 'Google',
  'google.com.br': 'Google',
  google: 'Google',
  instagram: 'Instagram',
  'instagram.com': 'Instagram',
  'l.instagram.com': 'Instagram',
  facebook: 'Facebook',
  'facebook.com': 'Facebook',
  'm.facebook.com': 'Facebook',
  'l.facebook.com': 'Facebook',
  whatsapp: 'WhatsApp',
  'wa.me': 'WhatsApp',
  'bing.com': 'Bing',
}

export function sourceName(source: string): string {
  return SOURCE_NAMES[source] ?? source
}
