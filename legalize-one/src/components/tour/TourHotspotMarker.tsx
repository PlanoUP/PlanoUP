import { ArrowUpRight } from 'lucide-react'
import type { TourHotspot } from '@/types/tour'
import { cn } from '@/utils/cn'

interface TourHotspotMarkerProps {
  hotspot: TourHotspot
  active: boolean
  targetLabel?: string
  onSelect: (hotspot: TourHotspot) => void
}

export function TourHotspotMarker({ hotspot, active, targetLabel, onSelect }: TourHotspotMarkerProps) {
  const isNav = hotspot.kind === 'navigation'
  return (
    <button
      type="button"
      data-hotspot
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(hotspot)
      }}
      aria-label={isNav ? `${hotspot.title}` : `Ver detalhe: ${hotspot.title}`}
      aria-pressed={isNav ? undefined : active}
      className="group/hs absolute z-10 -translate-x-1/2 -translate-y-1/2 outline-none"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
    >
      {isNav ? (
        <span className="flex items-center gap-2 rounded-full border border-white/40 bg-navy-950/55 py-1.5 pr-3.5 pl-1.5 text-[12px] font-semibold text-white shadow-lg backdrop-blur-md transition-all group-hover/hs:bg-navy-950/75 group-focus-visible/hs:ring-2 group-focus-visible/hs:ring-gold-400">
          <span className="flex size-7 items-center justify-center rounded-full bg-white text-navy-950">
            <ArrowUpRight className="size-4" strokeWidth={2.2} />
          </span>
          {targetLabel ?? hotspot.title}
        </span>
      ) : (
        <span className="relative flex size-11 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-white/60 animate-pulse-ring" />
          <span
            className={cn(
              'relative flex size-9 items-center justify-center rounded-full border-2 border-white bg-white/30 shadow-[0_4px_18px_rgb(0_0_0/0.35)] backdrop-blur-sm transition-transform duration-200 group-hover/hs:scale-110 group-focus-visible/hs:ring-2 group-focus-visible/hs:ring-gold-400',
              active && 'scale-110',
            )}
          >
            <span className={cn('size-3.5 rounded-full transition-colors', active ? 'bg-white' : 'bg-gold-500')} />
          </span>
        </span>
      )}
    </button>
  )
}
