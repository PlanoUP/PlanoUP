import { ArrowRight, Rotate3d } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { resizeImage } from '@/lib/images'
import type { PropertyTour } from '@/types/tour'
import { cn } from '@/utils/cn'
import { prefetchImmersiveTour } from './prefetch'

interface TourCtaCardProps {
  tour: PropertyTour
  onEnter: () => void
  className?: string
}

/** Convite comercial para o tour na página do imóvel: "Faça uma visita agora". */
export function TourCtaCard({ tour, onEnter, className }: TourCtaCardProps) {
  const cover = tour.scenes[0]
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-navy-950 p-3 text-white shadow-[0_20px_40px_-24px_rgb(7_27_46/0.8)] ring-1 ring-gold-500/30',
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-gold-500/15 blur-3xl" />
      <div className="relative flex gap-3.5">
        <button
          type="button"
          onClick={onEnter}
          onPointerEnter={prefetchImmersiveTour}
          tabIndex={-1}
          aria-hidden="true"
          className="relative size-[104px] shrink-0 overflow-hidden rounded-xl sm:h-[112px] sm:w-[150px]"
        >
          {cover && <SmartImage src={resizeImage(cover.image, 400)} alt="" fallback={cover.fallback} className="absolute inset-0" />}
          <span className="absolute inset-0 flex items-center justify-center bg-navy-950/30">
            <span className="flex size-11 items-center justify-center rounded-full bg-gold-500 text-navy-950 shadow-lg">
              <Rotate3d className="size-5" />
            </span>
          </span>
        </button>
        <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-1">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-gold-400 uppercase">Tour 3D disponível</p>
          <p className="mt-1 font-display text-[19px] leading-tight font-bold tracking-[-0.02em] sm:text-[21px]">
            Faça uma visita agora
          </p>
          <p className="mt-1 text-[13px] leading-snug text-white/70">
            {tour.scenes.length} ambientes, planta e destaques — sem sair de casa.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onEnter}
        onPointerEnter={prefetchImmersiveTour}
        onFocus={prefetchImmersiveTour}
        className="relative mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-400 to-gold-500 text-[15px] font-bold text-navy-950 transition-transform active:scale-[0.99]"
      >
        Entrar no imóvel
        <ArrowRight className="size-4" />
      </button>
    </div>
  )
}
