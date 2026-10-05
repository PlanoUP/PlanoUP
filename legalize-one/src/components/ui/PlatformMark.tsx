import { platform } from '@/config/site'
import { cn } from '@/utils/cn'

/** Assinatura discreta da plataforma (Impulsigo) — painel, login e rodapé dos sites. */
export function PlatformMark({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  return (
    <span className={cn('inline-flex items-baseline gap-1 text-[12px]', tone === 'dark' ? 'text-slate' : 'text-white/45', className)}>
      Tecnologia
      <span className={cn('font-display text-[13px] font-extrabold tracking-[-0.01em]', tone === 'dark' ? 'text-navy-950' : 'text-white/80')}>
        {platform.name.slice(0, -2)}
        <span className="text-gold-500">{platform.name.slice(-2)}</span>
      </span>
    </span>
  )
}
