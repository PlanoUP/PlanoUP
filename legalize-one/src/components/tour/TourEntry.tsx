import { Layers, Rotate3d, Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'
import { resizeImage } from '@/lib/images'
import { track } from '@/lib/analytics'
import type { PropertyTour } from '@/types/tour'
import { cn } from '@/utils/cn'
import { prefetchImmersiveTour } from './prefetch'

interface TourEntryProps {
  tour: PropertyTour
  onEnter: (sceneId?: string, source?: string) => void
  /** Onde a entrada aparece (analytics). */
  placement: string
  eyebrow?: string
  headline?: string
  description?: string
  className?: string
}

/**
 * ENTRADA do Legalize 3D Experience: capa premium com movimento lento e o
 * convite "Entrar no imóvel". Leve — não carrega o tour até o usuário entrar.
 * O site continua navegável normalmente; a experiência é opcional.
 */
export function TourEntry({ tour, onEnter, placement, eyebrow, headline, description, className }: TourEntryProps) {
  const ref = useRef<HTMLDivElement>(null)
  const cover = tour.scenes[0]
  const featureCount = tour.scenes.reduce((n, s) => n + s.hotspots.filter((h) => h.kind === 'feature').length, 0)

  // Métrica de exposição + pré-carregamento quando a entrada fica visível.
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        track('tour_entry_viewed', { tour_id: tour.id, placement })
        prefetchImmersiveTour()
        observer.disconnect()
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [tour.id, placement])

  if (!cover) return null

  return (
    <div
      ref={ref}
      className={cn('group/entry relative isolate flex flex-col overflow-hidden bg-navy-950 text-white', className)}
    >
      {/* Capa com movimento lento (estático com "reduzir movimento") */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <SmartImage
          src={cover.panorama?.src ?? cover.image}
          alt=""
          fallback={cover.fallback}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="absolute inset-y-0 left-0 w-[130%] animate-poster-pan"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/45 to-navy-950/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(7_27_46/0.55))]" />
      </div>

      {/* Imóvel */}
      <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/15 bg-navy-950/55 py-2 pr-4 pl-2 backdrop-blur-md">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 font-display text-[13px] font-bold text-navy-950 ring-2 ring-white/70"
          >
            {tour.agent.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold">{tour.title}</p>
            <p className="truncate text-[11.5px] text-white/70">{tour.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Convite */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-6 text-center">
        {eyebrow && <p className="eyebrow text-[10.5px] tracking-[0.3em] text-gold-400 sm:text-[11px]">{eyebrow}</p>}
        {headline && (
          <p className="mt-2 font-display text-[28px] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance sm:text-[34px]">
            {headline}
          </p>
        )}
        {description && <p className="mt-2 max-w-sm text-[14px] text-white/75">{description}</p>}
        <button
          type="button"
          onClick={() => onEnter(undefined, placement)}
          onPointerEnter={prefetchImmersiveTour}
          onFocus={prefetchImmersiveTour}
          className={cn(
            'relative mt-5 inline-flex h-14 items-center gap-3 rounded-full bg-gradient-to-b from-gold-400 to-gold-500 pr-7 pl-2.5 text-[16px] font-bold text-navy-950 shadow-[0_18px_40px_-14px_rgb(217_180_122/0.9)] transition-transform hover:scale-[1.03] active:scale-[0.98]',
            !headline && 'sm:mt-0',
          )}
        >
          <span className="absolute inset-0 rounded-full ring-2 ring-gold-400/60 animate-pulse-ring" aria-hidden="true" />
          <span className="flex size-10 items-center justify-center rounded-full bg-navy-950 text-gold-400">
            <Rotate3d className="size-5" strokeWidth={1.8} />
          </span>
          Entrar no imóvel
        </button>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[12px] text-white/75">
          <li className="inline-flex items-center gap-1.5">
            <Rotate3d className="size-3.5 text-gold-400" aria-hidden="true" />
            {tour.scenes.length} ambientes
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Layers className="size-3.5 text-gold-400" aria-hidden="true" />
            Planta interativa
          </li>
          {featureCount > 0 && (
            <li className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-gold-400" aria-hidden="true" />
              {featureCount} destaques
            </li>
          )}
        </ul>
      </div>

      {/* Atalhos para os ambientes */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <p className="sr-only">Entrar direto em um ambiente:</p>
        <div className="no-scrollbar -mx-1 flex snap-x gap-2 overflow-x-auto px-1">
          {tour.scenes.map((scene) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => onEnter(scene.id, `${placement}_scene`)}
              onPointerEnter={prefetchImmersiveTour}
              aria-label={`Entrar no tour pelo ambiente ${scene.label}`}
              className="group/th relative h-[52px] w-[84px] shrink-0 snap-start overflow-hidden rounded-lg border border-white/25 transition-colors hover:border-gold-400 sm:h-[58px] sm:w-[96px]"
            >
              <SmartImage src={resizeImage(scene.image, 240)} alt="" fallback={scene.fallback} className="absolute inset-0" />
              <span className="absolute inset-0 bg-gradient-to-t from-navy-950/85 to-transparent" />
              <span className="absolute inset-x-1 bottom-1 truncate text-center text-[10.5px] font-semibold">{scene.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
