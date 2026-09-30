import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface IconCircleProps {
  icon: LucideIcon
  size?: 'md' | 'lg'
  className?: string
}

/** Ícone em círculo areia com halo dourado, usado em diferenciais e timeline. */
export function IconCircle({ icon: Icon, size = 'lg', className }: IconCircleProps) {
  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gradient-to-b from-[#f6ecdc] to-[#efe0c6] text-navy-950 ring-1 ring-gold-500/25',
        size === 'lg' ? 'size-[52px]' : 'size-11',
        className,
      )}
    >
      <Icon className={size === 'lg' ? 'size-[22px]' : 'size-5'} strokeWidth={1.6} aria-hidden="true" />
    </span>
  )
}
