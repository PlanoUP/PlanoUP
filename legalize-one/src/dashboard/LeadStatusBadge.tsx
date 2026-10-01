import { cn } from '@/utils/cn'
import { LEAD_STATUS_LABELS, type LeadStatus } from './leadsApi'

const TONES: Record<LeadStatus, string> = {
  new: 'bg-gold-500 text-navy-950',
  contacted: 'bg-navy-800/10 text-navy-800',
  visit_scheduled: 'bg-tour/12 text-tour',
  negotiation: 'bg-navy-800 text-white',
  converted: 'bg-tour text-white',
  lost: 'bg-sand-300 text-slate',
}

export function LeadStatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span className={cn('inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-semibold', TONES[status], className)}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  )
}
