import { cn } from '@/utils/cn'
import { STAGE_TONES } from './clientStageTones'
import { STAGE_LABELS, type ClientStage } from './clientsApi'

export function ClientStageBadge({ stage, className }: { stage: ClientStage; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold', STAGE_TONES[stage].badge, className)}>
      <span className={cn('size-1.5 rounded-full', STAGE_TONES[stage].dot)} aria-hidden="true" />
      {STAGE_LABELS[stage]}
    </span>
  )
}

/** Barra de progresso dos documentos ("4 de 7"). */
export function DocMeter({ done, total, className }: { done: number; total: number; className?: string }) {
  const pct = total ? Math.round((done / total) * 100) : 0
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span className="h-1.5 w-full max-w-28 overflow-hidden rounded-full bg-navy-950/8" aria-hidden="true">
        <span className={cn('block h-full rounded-full', done === total ? 'bg-emerald-500' : 'bg-gold-500')} style={{ width: `${pct}%` }} />
      </span>
      <span className="shrink-0 text-[12px] font-medium text-slate tabular-nums">
        {done}/{total} docs
      </span>
    </span>
  )
}
