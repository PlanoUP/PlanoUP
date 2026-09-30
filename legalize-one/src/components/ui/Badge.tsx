import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type Tone = 'gold' | 'tour' | 'model3d' | 'navy' | 'glass' | 'verified'

const tones: Record<Tone, string> = {
  gold: 'bg-gold-500 text-navy-950',
  tour: 'bg-tour text-white',
  // Modelo 3D: navy + dourado, distinto do verde do tour 360.
  model3d: 'bg-navy-950/90 text-gold-400 uppercase tracking-[0.06em] font-bold ring-1 ring-gold-500/50 backdrop-blur',
  navy: 'bg-navy-950/85 text-white backdrop-blur',
  glass: 'bg-white/90 text-navy-950 backdrop-blur',
  verified: 'bg-white/95 text-navy-800 backdrop-blur',
}

interface BadgeProps {
  tone?: Tone
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'glass', icon: Icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-[-0.005em] shadow-sm',
        tones[tone],
        className,
      )}
    >
      {Icon && <Icon className="size-3.5" strokeWidth={2.2} aria-hidden="true" />}
      {children}
    </span>
  )
}
