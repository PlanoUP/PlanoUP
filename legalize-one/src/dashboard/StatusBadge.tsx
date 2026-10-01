import { cn } from '@/utils/cn'
import { STATUS_LABELS, type PropertyStatus } from './propertiesApi'

const TONES: Record<PropertyStatus, string> = {
  published: 'bg-tour/12 text-tour',
  draft: 'bg-gold-500/20 text-navy-900',
  sold: 'bg-navy-950 text-white',
  rented: 'bg-navy-800 text-white',
  archived: 'bg-sand-300 text-slate',
}

export function StatusBadge({ status, className }: { status: PropertyStatus; className?: string }) {
  return (
    <span className={cn('inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-semibold', TONES[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  )
}
