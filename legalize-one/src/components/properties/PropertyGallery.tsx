import { useState, type ReactNode, type UIEvent } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import type { PropertyImage } from '@/types/property'
import { cn } from '@/utils/cn'

interface PropertyGalleryProps {
  images: PropertyImage[]
  /** Selos sobrepostos à foto (documentação, Tour 3D...). */
  overlay?: ReactNode
  /** Chave que zera a foto ativa ao trocar de imóvel. */
  resetKey: string
}

/**
 * Galeria do imóvel.
 * - Mobile/tablet: carrossel de largura total com deslize (scroll-snap nativo) e contador.
 * - Desktop: foto principal + miniaturas laterais.
 */
export function PropertyGallery({ images, overlay, resetKey }: PropertyGalleryProps) {
  const isDesktop = useIsDesktop()
  const [state, setState] = useState({ key: resetKey, index: 0 })
  const active = state.key === resetKey ? state.index : 0
  const setActive = (index: number) => setState({ key: resetKey, index })

  if (!isDesktop) {
    const onScroll = (e: UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget
      const index = Math.round(el.scrollLeft / el.clientWidth)
      if (index !== active) setActive(index)
    }
    return (
      <div className="relative -mx-4 sm:mx-0">
        <div
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto sm:rounded-2xl"
          aria-label="Fotos do imóvel"
          role="region"
          tabIndex={0}
        >
          {images.map((img, i) => (
            <SmartImage
              key={img.src}
              src={img.src}
              alt={`${img.alt} (foto ${i + 1} de ${images.length})`}
              fallback={img.fallback}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : undefined}
              sizes="100vw"
              className="aspect-[4/3] w-full shrink-0 snap-center sm:aspect-[16/9]"
            />
          ))}
        </div>
        {overlay}
        {images.length > 1 && (
          <>
            <span
              className="absolute right-3 bottom-3 rounded-full bg-navy-950/70 px-2.5 py-1 text-[12px] font-semibold text-white tabular-nums backdrop-blur"
              aria-live="polite"
            >
              {active + 1}/{images.length}
            </span>
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5" aria-hidden="true">
              {images.map((img, i) => (
                <span
                  key={img.src}
                  className={cn('h-1.5 rounded-full bg-white transition-all', i === active ? 'w-5' : 'w-1.5 opacity-60')}
                />
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  const main = images[active] ?? images[0]
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
      <div className="relative overflow-hidden rounded-2xl">
        <SmartImage
          key={main.src}
          src={main.src}
          alt={main.alt}
          fallback={main.fallback}
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1280px) 900px, 70vw"
          className="aspect-[16/8] animate-fade-in"
        />
        {overlay}
      </div>
      <div className="flex flex-col gap-3">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ver foto ${i + 1}: ${img.alt}`}
            aria-pressed={i === active}
            className={cn(
              'relative min-h-[80px] flex-1 overflow-hidden rounded-xl ring-2 transition-all',
              i === active ? 'ring-gold-500' : 'opacity-80 ring-transparent hover:opacity-100',
            )}
          >
            <SmartImage src={img.src} alt="" fallback={img.fallback} sizes="280px" className="absolute inset-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
