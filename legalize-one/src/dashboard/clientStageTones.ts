import type { ClientStage } from './clientsApi'

/** Cores de cada etapa (selo, ponto do funil). */
export const STAGE_TONES: Record<ClientStage, { badge: string; dot: string }> = {
  docs_pending: { badge: 'bg-amber-100 text-amber-900', dot: 'bg-amber-500' },
  in_review: { badge: 'bg-sky-100 text-sky-900', dot: 'bg-sky-500' },
  approved: { badge: 'bg-emerald-100 text-emerald-900', dot: 'bg-emerald-500' },
  rejected: { badge: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
  withdrawn: { badge: 'bg-slate-200 text-slate-700', dot: 'bg-slate-400' },
}
