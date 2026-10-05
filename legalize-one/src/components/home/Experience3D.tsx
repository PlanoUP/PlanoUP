import { ArrowRight, Images, Rotate3d } from 'lucide-react'
import { Link } from 'react-router'
import { AUTO_START_3D, type AutoStart3DState } from '@/components/three/autoStart'
import { Property3DShowcase } from '@/components/three/Property3DShowcase'
import { prefetchImmersiveTour } from '@/components/tour/prefetch'
import { useTourLauncher } from '@/components/tour/useTourLauncher'
import { SmartImage } from '@/components/ui/SmartImage'
import { tourFeatures } from '@/data/content'
import { useAsyncData } from '@/hooks/useAsyncData'
import { track } from '@/lib/analytics'
import { resizeImage } from '@/lib/images'
import { getTourById } from '@/services/propertyService'
import { cn } from '@/utils/cn'
import { useTenant } from '@/tenant/store'

const TOUR_PROPERTY_SLUG = 'casa-condominio-nova-parnamirim'
/** Imóvel demonstrativo do modelo 3D (a Home mostra só a capa — o GLB nunca carrega aqui). */
const MODEL_PROPERTY_SLUG = 'casa-condominio-capim-macio-natal'
const MODEL_HREF = `/imovel/${MODEL_PROPERTY_SLUG}#modelo-3d`
const MODEL_POSTER = '/models/casa-mobiliada/poster.webp'
const MODEL_ALT = 'casa de três pavimentos em Capim Macio, com garagem e piscina'

export function Experience3D() {
  const tenant = useTenant()
  const { data: tour } = useAsyncData(() => getTourById(), 'default-tour')
  const launcher = useTourLauncher(tour, {
    placement: 'home_section',
    propertyHref: `/imovel/${TOUR_PROPERTY_SLUG}`,
    contactMessage: 'Olá! Fiz o tour 3D da Casa Nova Parnamirim e gostaria de agendar uma visita.',
  })

  const tourCover = tour?.scenes[0]
  const modelState: AutoStart3DState = { [AUTO_START_3D]: 'home_section_cta' }

  const tourCard = (className: string) =>
    tour && (
      <button
        type="button"
        onClick={() => launcher.open(undefined, 'home_section_secondary')}
        onPointerEnter={prefetchImmersiveTour}
        onFocus={prefetchImmersiveTour}
        className={cn(
          'group w-full items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-3 pr-4 text-left transition-colors hover:border-white/30 hover:bg-white/10',
          className,
        )}
      >
        <span className="relative block h-[72px] w-[108px] shrink-0 overflow-hidden rounded-xl">
          <SmartImage
            src={resizeImage(tourCover?.image ?? '', 320)}
            alt=""
            fallback={tourCover?.fallback ?? 'living'}
            className="absolute inset-0"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-navy-950/30">
            <Rotate3d className="size-6 text-white drop-shadow" strokeWidth={1.6} aria-hidden="true" />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.16em] text-white/70 uppercase">
            <Images className="size-3.5" aria-hidden="true" />
            Tour por fotos 360°
          </span>
          <span className="mt-1 block text-[13.5px] leading-snug text-white/80">
            Percorra os ambientes da {tour.title} em fotos panorâmicas.
          </span>
          <span className="mt-1.5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white">
            Fazer tour por fotos
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </span>
      </button>
    )

  return (
    <section id="tour-3d" aria-labelledby="tour-title" className="relative overflow-hidden bg-navy-950 text-white">
      <div className="pointer-events-none absolute -top-40 -left-40 size-[480px] rounded-full bg-navy-800/50 blur-3xl" />
      <div className="relative grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,40%)_minmax(0,60%)]">
        <div className="flex flex-col justify-center px-4 py-14 sm:px-6 sm:py-16 lg:py-20 lg:pr-12 lg:pl-[max(2.5rem,calc((100vw-1280px)/2+2.5rem))]">
          <p className="eyebrow text-[11.5px] tracking-[0.3em] text-white/80">{tenant.name} 3D Experience</p>
          <h2
            id="tour-title"
            className="mt-4 font-display text-[44px] leading-[0.95] font-extrabold tracking-[-0.04em] [word-spacing:0.08em] sm:text-[56px]"
          >
            Visite antes
            <br />
            de visitar.
          </h2>
          <p className="mt-5 max-w-[420px] text-[15.5px] leading-relaxed text-white/80">
            Gire, aproxime e explore a casa por todos os ângulos — fachada, planta e ambientes — em um modelo 3D
            interativo, como se você já estivesse lá.
          </p>
          {/* Destaque: modelo 3D interativo. No mobile a vitrine logo abaixo já oferece o mesmo convite. */}
          <Link
            to={MODEL_HREF}
            state={modelState}
            onClick={() => track('model3d_cta_clicked', { placement: 'home_section_cta' })}
            className="mt-8 hidden h-14 items-center gap-2 self-start rounded-lg bg-gradient-to-b from-gold-400 to-gold-500 px-10 text-[16px] font-semibold text-navy-950 shadow-[0_18px_40px_-14px_rgb(217_180_122/0.8)] transition-transform hover:scale-[1.02] active:scale-[0.98] lg:inline-flex"
          >
            Explorar modelo 3D
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>

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

          {/* Secundário: tour por fotos 360° (no celular aparece depois da vitrine do modelo) */}
          {tourCard('mt-8 hidden lg:flex')}
        </div>

        <div className="relative px-3 pb-3 sm:px-6 sm:pb-6 lg:p-0">
          <Property3DShowcase
            href={MODEL_HREF}
            poster={MODEL_POSTER}
            posterAlt={MODEL_ALT}
            title="Casa em condomínio · Capim Macio"
            subtitle="280 m² · 4 suítes · 5 banheiros"
            placement="home_section"
            className="h-[460px] rounded-2xl sm:h-[520px] lg:h-full lg:min-h-[640px] lg:rounded-none"
          />
        </div>
        {tourCard('mx-3 mb-8 flex w-auto sm:mx-6 lg:hidden')}
        {launcher.element}
      </div>
    </section>
  )
}
