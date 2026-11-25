import type { LeadStatus } from './leadsApi'

/** Ponto colorido de cada etapa (colunas do funil). */
export const LEAD_STATUS_DOTS: Record<LeadStatus, string> = {
  new: 'bg-gold-500',
  contacted: 'bg-navy-700',
  qualified: 'bg-sky-500',
  visit_scheduled: 'bg-tour',
  negotiation: 'bg-navy-950',
  proposal: 'bg-gold-400',
  converted: 'bg-emerald-600',
  lost: 'bg-slate',
}
