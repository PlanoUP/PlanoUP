import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  tone?: 'dark' | 'light'
  className?: string
  action?: ReactNode
}

export function SectionHeading({ eyebrow, title, description, tone = 'dark', className, action }: SectionHeadingProps) {
  const light = tone === 'light'
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className={cn('eyebrow mb-3', light ? 'text-gold-400' : 'text-gold-600')}>{eyebrow}</p>}
        <h2
          className={cn(
            'font-display text-[28px] leading-[1.08] font-bold tracking-[-0.035em] text-balance sm:text-[34px]',
            light ? 'text-white' : 'text-navy-950',
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn('mt-2 text-[15px] leading-relaxed', light ? 'text-white/75' : 'text-slate')}>{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
