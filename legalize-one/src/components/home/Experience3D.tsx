import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Tour3DPreview } from '@/components/tour/Tour3DPreview'
import { tourFeatures } from '@/data/content'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getTourById } from '@/services/propertyService'

const TOUR_PROPERTY_SLUG = 'casa-condominio-nova-parnamirim'

export function Experience3D() {
  const { data: tour } = useAsyncData(() => getTourById(), 'default-tour')

  return (
    <section id="tour-3d" aria-labelledby="tour-title" className="relative overflow-hidden bg-navy-950 text-white">
      <div className="pointer-events-none absolute -top-40 -left-40 size-[480px] rounded-full bg-navy-800/50 blur-3xl" />
      <div className="relative grid lg:grid-cols-[minmax(0,40%)_minmax(0,60%)]">
        <div className="flex flex-col justify-center px-4 py-14 sm:px-6 sm:py-16 lg:py-20 lg:pr-12 lg:pl-[max(2.5rem,calc((100vw-1280px)/2+2.5rem))]">
          <p className="eyebrow text-[11.5px] tracking-[0.3em] text-white/80">Legalize 3D Experience</p>
          <h2
            id="tour-title"
            className="mt-4 font-display text-[44px] leading-[0.95] font-extrabold tracking-[-0.04em] [word-spacing:0.08em] sm:text-[56px]"
          >
            Visite antes
            <br />
            de visitar.
          </h2>
          <p className="mt-5 max-w-[420px] text-[15.5px] leading-relaxed text-white/80">
            Explore os ambientes em um tour 3D interativo e conheça cada detalhe do imóvel, como se você já estivesse
            lá.
          </p>
          <ButtonLink
            to={`/imovel/${TOUR_PROPERTY_SLUG}#tour`}
            variant="gold"
            size="lg"
            className="mt-8 self-start rounded-lg px-10"
          >
            Explorar um imóvel em 3D
            <ArrowRight className="size-4" />
          </ButtonLink>

          <ul className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8 lg:mt-12">
            {tourFeatures.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <Icon className="size-7 shrink-0 text-white/90" strokeWidth={1.3} aria-hidden="true" />
                <p className="text-[11.5px] leading-snug text-white/70">
                  <span className="block font-medium text-white">{title}</span>
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative px-3 pb-3 sm:px-6 sm:pb-6 lg:p-0">
          {tour ? (
            <Tour3DPreview
              tour={tour}
              className="h-[480px] rounded-2xl sm:h-[560px] lg:h-full lg:min-h-[640px] lg:rounded-none"
            />
          ) : (
            <div className="h-[480px] animate-pulse rounded-2xl bg-navy-900 sm:h-[560px] lg:h-full lg:min-h-[640px] lg:rounded-none" />
          )}
        </div>
      </div>
    </section>
  )
}
