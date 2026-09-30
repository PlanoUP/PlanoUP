import { Info, Sparkles, X } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import type { TourHotspot } from '@/types/tour'
import { cn } from '@/utils/cn'
import type { ScreenPoint } from './renderers'

interface HotspotCardProps {
  hotspot: TourHotspot
  anchor: ScreenPoint
  /** `docked`: fixo acima dos controles inferiores (celular em retrato). */
  docked: boolean
  /** Áreas reservadas pelas barras do tour, em px (lidas no momento da medição). */
  getInsets: () => { top: number; bottom: number }
  onClose: () => void
}

const MARGIN = 12
const GAP = 28

/**
 * Card do hotspot. Posicionado por medição real (card + viewport), então nunca
 * sai da tela: ancorado ao lado do ponto em telas largas; acoplado acima dos
 * controles no celular em retrato.
 */
export function HotspotCard({ hotspot, anchor, docked, getInsets, onClose }: HotspotCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Posiciona direto no DOM a cada render (acompanha o arraste sem re-render extra).
  useLayoutEffect(() => {
    const el = ref.current
    const parent = el?.offsetParent as HTMLElement | null
    if (!el || !parent) return
    const W = parent.clientWidth
    const H = parent.clientHeight
    const w = el.offsetWidth
    const h = el.offsetHeight
    const insets = getInsets()

    if (docked) {
      el.style.left = `${MARGIN}px`
      el.style.right = `${MARGIN}px`
      el.style.top = 'auto'
      el.style.bottom = `${insets.bottom + MARGIN}px`
    } else {
      const ax = anchor.x * W
      const ay = anchor.y * H
      let left = ax + GAP
      if (left + w > W - MARGIN) left = ax - GAP - w
      left = Math.min(Math.max(left, MARGIN), W - w - MARGIN)
      const minTop = insets.top + MARGIN
      const maxTop = Math.max(minTop, H - insets.bottom - h - MARGIN)
      const top = Math.min(Math.max(ay - h / 2, minTop), maxTop)
      el.style.left = `${left}px`
      el.style.right = 'auto'
      el.style.top = `${top}px`
      el.style.bottom = 'auto'
    }
    el.style.visibility = 'visible'
  })

  const feature = hotspot.kind === 'feature'
  const Icon = feature ? Sparkles : Info

  return (
    <div
      ref={ref}
      role="dialog"
      aria-labelledby={`hs-${hotspot.id}`}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      style={{ visibility: 'hidden' }}
      className={cn('absolute z-30', docked ? '' : 'w-[300px]')}
    >
      <div
        key={hotspot.id}
        className={cn(
          'animate-pop rounded-2xl border p-4 shadow-[0_24px_50px_-18px_rgb(0_0_0/0.6)] backdrop-blur-xl',
          feature ? 'border-gold-400/50 bg-navy-950/92 text-white' : 'border-white/60 bg-white/96 text-navy-950',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={cn(
                'flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.18em] uppercase',
                feature ? 'text-gold-400' : 'text-gold-600',
              )}
            >
              <Icon className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
              {feature ? 'Destaque do imóvel' : 'Detalhe'}
            </p>
            <p id={`hs-${hotspot.id}`} className="mt-1.5 font-display text-[16px] leading-snug font-bold tracking-[-0.02em]">
              {hotspot.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhe"
            className={cn(
              '-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full',
              feature ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-navy-950/60 hover:bg-sand hover:text-navy-950',
            )}
          >
            <X className="size-4" />
          </button>
        </div>
        {hotspot.highlight && (
          <p
            className={cn(
              'mt-2 inline-flex rounded-md px-2.5 py-1 text-[12px] font-semibold',
              feature ? 'bg-gold-500 text-navy-950' : 'bg-navy-950 text-gold-400',
            )}
          >
            {hotspot.highlight}
          </p>
        )}
        <p className={cn('mt-2.5 text-[13.5px] leading-relaxed', feature ? 'text-white/80' : 'text-slate')}>
          {hotspot.description}
        </p>
      </div>
    </div>
  )
}
