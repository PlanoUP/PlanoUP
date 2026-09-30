import { Sparkles, X } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { TourHotspot } from '@/types/tour'
import { cn } from '@/utils/cn'

interface HotspotCardProps {
  hotspot: TourHotspot
  /** Posição do hotspot na viewport do tour (0–1). */
  screenX: number
  screenY: number
  onClose: () => void
}

/**
 * Card informativo do hotspot. No mobile aparece fixo na base do viewer;
 * a partir de `sm` acompanha a posição do hotspot na panorâmica.
 */
export function HotspotCard({ hotspot, screenX, screenY, onClose }: HotspotCardProps) {
  const x = Math.min(Math.max(screenX, 0.04), 0.96)
  const y = Math.min(Math.max(screenY, 0.12), 0.8)
  const placeLeft = x > 0.58
  const placeAbove = y > 0.55

  const style = {
    '--hx': `${x * 100}%`,
    '--hy': `${y * 100}%`,
  } as CSSProperties

  return (
    <div
      role="dialog"
      aria-label={hotspot.title}
      style={style}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        'absolute inset-x-3 bottom-[104px] z-30 sm:inset-x-auto sm:bottom-auto sm:left-[var(--hx)] sm:top-[var(--hy)] sm:w-[280px]',
        placeLeft ? 'sm:-translate-x-[calc(100%+30px)]' : 'sm:translate-x-[30px]',
        placeAbove ? 'sm:-translate-y-[85%]' : 'sm:-translate-y-[15%]',
      )}
    >
      <div className="animate-pop rounded-2xl border border-white/60 bg-white/95 p-4 text-navy-950 shadow-[0_24px_50px_-18px_rgb(0_0_0/0.55)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-gold-500/20 text-gold-600">
              <Sparkles className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
            </span>
            <p className="font-display text-[15px] font-bold tracking-[-0.02em]">{hotspot.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhe"
            className="-m-1 inline-flex size-8 items-center justify-center rounded-full text-navy-950/60 hover:bg-sand hover:text-navy-950"
          >
            <X className="size-4" />
          </button>
        </div>
        {hotspot.highlight && (
          <p className="mt-3 inline-flex rounded-md bg-navy-950 px-2.5 py-1 text-[11.5px] font-semibold text-gold-400">
            {hotspot.highlight}
          </p>
        )}
        <p className="mt-2.5 text-[13px] leading-relaxed text-slate">{hotspot.description}</p>
      </div>
    </div>
  )
}
