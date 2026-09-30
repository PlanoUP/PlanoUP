import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useAsyncData } from '@/hooks/useAsyncData'
import { listFeaturedProperties } from '@/services/propertyService'
import { cn } from '@/utils/cn'
import { PropertyCard, PropertyCardSkeleton } from './PropertyCard'

const cardWidth = 'w-[84%] shrink-0 snap-start sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-60px)/4)]'

export function FeaturedProperties() {
  const { data: properties, loading } = useAsyncData(() => listFeaturedProperties(), [])
  const trackRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const updateEdges = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    })
  }, [])

  useEffect(() => {
    updateEdges()
    window.addEventListener('resize', updateEdges)
    return () => window.removeEventListener('resize', updateEdges)
  }, [updateEdges, properties])

  function scrollBy(direction: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-card]')
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8
    el.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  return (
    <section aria-labelledby="destaques-title" className="bg-white py-14 sm:py-16">
      <div className="container-page">
        <SectionHeading
          title={<span id="destaques-title">Imóveis em destaque</span>}
          description="Seleção especial de imóveis com as melhores oportunidades."
          action={
            <Link
              to="/imoveis"
              className="group inline-flex items-center gap-2 text-[14px] font-semibold text-navy-800 hover:text-navy-950"
            >
              Ver todos os imóveis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />

        <div className="relative mt-7">
          <div
            ref={trackRef}
            onScroll={updateEdges}
            className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pt-1 pb-6 sm:mx-0 sm:scroll-px-0 sm:px-0"
            aria-label="Carrossel de imóveis em destaque"
          >
            {loading || !properties
              ? Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className={cardWidth}>
                    <PropertyCardSkeleton />
                  </div>
                ))
              : properties.map((property) => (
                  <div key={property.id} data-card className={cardWidth}>
                    <PropertyCard property={property} className="h-full" />
                  </div>
                ))}
          </div>

          {[
            { dir: -1 as const, disabled: edges.start, icon: ChevronLeft, label: 'Anterior', pos: '-left-5' },
            { dir: 1 as const, disabled: edges.end, icon: ChevronRight, label: 'Próximo', pos: '-right-5' },
          ].map(({ dir, disabled, icon: Icon, label, pos }) => (
            <button
              key={label}
              type="button"
              onClick={() => scrollBy(dir)}
              disabled={disabled}
              aria-label={`${label} imóvel`}
              className={cn(
                'absolute top-[28%] z-10 hidden size-11 items-center justify-center rounded-full border border-navy-950/8 bg-white text-navy-950 shadow-[var(--shadow-float)] transition-all hover:scale-105 disabled:pointer-events-none disabled:opacity-0 sm:inline-flex',
                pos,
              )}
            >
              <Icon className="size-5" />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
