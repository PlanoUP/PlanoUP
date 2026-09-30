import { ArrowUpRight, Plus, Sparkles } from 'lucide-react'
import type { TourHotspot } from '@/types/tour'
import { cn } from '@/utils/cn'

interface TourHotspotMarkerProps {
  hotspot: TourHotspot
  active: boolean
  targetLabel?: string
  onSelect: (hotspot: TourHotspot) => void
}

const kindLabel = { navigation: 'Ir para', info: 'Detalhe', feature: 'Destaque' } as const

/**
 * Três linguagens visuais:
 * - navegação: pílula com seta e nome do ambiente de destino;
 * - informação: ponto branco com "+";
 * - destaque do imóvel: ponto dourado com brilho (e rótulo em telas grandes).
 * Todas com área de toque ≥ 44px.
 */
export function TourHotspotMarker({ hotspot, active, targetLabel, onSelect }: TourHotspotMarkerProps) {
  const { kind } = hotspot
  const label = kind === 'navigation' ? `${kindLabel.navigation} ${targetLabel ?? hotspot.title}` : `${kindLabel[kind]}: ${hotspot.title}`

  return (
    <button
      type="button"
      data-hotspot={kind}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(hotspot)
      }}
      aria-label={label}
      aria-pressed={kind === 'navigation' ? undefined : active}
      className="group/hs absolute z-10 flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center outline-none"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
    >
      {kind === 'navigation' && (
        <span className="flex items-center gap-2 rounded-full border border-white/45 bg-navy-950/55 py-1.5 pr-3.5 pl-1.5 text-[12.5px] font-semibold whitespace-nowrap text-white shadow-lg backdrop-blur-md transition-all group-hover/hs:bg-navy-950/80 group-focus-visible/hs:ring-2 group-focus-visible/hs:ring-gold-400">
          <span className="flex size-7 items-center justify-center rounded-full bg-white text-navy-950">
            <ArrowUpRight className="size-4" strokeWidth={2.4} />
          </span>
          {targetLabel ?? hotspot.title}
        </span>
      )}

      {kind === 'info' && (
        <span className="relative flex size-11 items-center justify-center">
          <span className="absolute inset-1.5 rounded-full bg-white/50 animate-pulse-ring" />
          <span
            className={cn(
              'relative flex size-8 items-center justify-center rounded-full border-2 border-white shadow-[0_4px_16px_rgb(0_0_0/0.35)] backdrop-blur-sm transition-all duration-200 group-hover/hs:scale-110 group-focus-visible/hs:ring-2 group-focus-visible/hs:ring-gold-400',
              active ? 'scale-110 bg-white text-navy-950' : 'bg-navy-950/35 text-white',
            )}
          >
            <Plus className={cn('size-4 transition-transform', active && 'rotate-45')} strokeWidth={2.6} />
          </span>
        </span>
      )}

      {kind === 'feature' && (
        <span className="flex items-center gap-2">
          <span className="relative flex size-11 items-center justify-center">
            <span className="absolute inset-1 rounded-full bg-gold-400/60 animate-pulse-ring" />
            <span
              className={cn(
                'relative flex size-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950 shadow-[0_6px_18px_rgb(0_0_0/0.4)] transition-transform duration-200 group-hover/hs:scale-110 group-focus-visible/hs:ring-2 group-focus-visible/hs:ring-white',
                active && 'scale-110',
              )}
            >
              <Sparkles className="size-4" strokeWidth={2.2} />
            </span>
          </span>
          {/* Rótulo some com o card aberto (o card já traz o título e ficaria por cima). */}
          <span
            className={cn(
              'hidden rounded-full bg-navy-950/60 px-3 py-1 text-[12px] font-semibold whitespace-nowrap text-white backdrop-blur-md',
              !active && 'lg:inline',
            )}
          >
            {hotspot.title}
          </span>
        </span>
      )}
    </button>
  )
}
