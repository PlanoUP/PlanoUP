import { ArrowLeft, Box, CalendarCheck, Check, ChevronRight, MapPin, Rotate3d, Share2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { FavoriteButton } from '@/components/properties/FavoriteButton'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { PropertyGallery } from '@/components/properties/PropertyGallery'
import { PropertySpecs } from '@/components/properties/PropertySpecs'
import { Property3DExperience } from '@/components/three/Property3DExperience'
import { TourCtaCard } from '@/components/tour/TourCtaCard'
import { TourEntry } from '@/components/tour/TourEntry'
import { useTourLauncher } from '@/components/tour/useTourLauncher'
import { Badge } from '@/components/ui/Badge'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { documentationChecklist } from '@/data/content'
import { propertyTypeLabels } from '@/data/filters'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { track } from '@/lib/analytics'
import { setStickyActions } from '@/lib/uiStore'
import { whatsappLink } from '@/lib/whatsapp'
import { getPropertyBySlug, listRelatedProperties } from '@/services/propertyService'
import type { PropertyWithTour } from '@/types/property'
import { cn } from '@/utils/cn'
import { formatLocation, formatPropertyPrice } from '@/utils/format'

function contactMessages(property: PropertyWithTour) {
  const ref = `"${property.title}" em ${formatLocation(property.location)} (${formatPropertyPrice(property)})`
  return {
    interest: `Olá! Tenho interesse no imóvel ${ref}.`,
    schedule: `Olá! Gostaria de agendar uma visita ao imóvel ${ref}.`,
  }
}

export default function PropertyDetails() {
  const { slug = '' } = useParams()
  const { data: property, loading } = useAsyncData(() => getPropertyBySlug(slug), slug)
  const { data: related } = useAsyncData(
    () => (property ? listRelatedProperties(property) : Promise.resolve([])),
    property?.id ?? '',
  )
  const [copied, setCopied] = useState(false)
  const messages = property ? contactMessages(property) : null
  const launcher = useTourLauncher(property?.tour, { placement: 'property', contactMessage: messages?.schedule })

  usePageTitle(property ? `${property.title} em ${property.location.neighborhood}` : loading ? undefined : 'Imóvel não encontrado')

  useEffect(() => {
    if (property) track('property_viewed', { property_id: property.id, price: property.price })
  }, [property])

  // CTA fixo do mobile contextual: conversar sobre ESTE imóvel ou agendar visita.
  useEffect(() => {
    if (!property) return
    const { interest, schedule } = contactMessages(property)
    setStickyActions([
      {
        kind: 'whatsapp',
        label: 'WhatsApp',
        icon: 'whatsapp',
        href: whatsappLink(interest),
        external: true,
        onClick: () => track('property_whatsapp_clicked', { property_id: property.id, placement: 'mobile_sticky' }),
      },
      {
        kind: 'primary',
        label: 'Agendar visita',
        icon: 'calendar',
        href: whatsappLink(schedule),
        external: true,
        onClick: () => track('property_schedule_clicked', { property_id: property.id, placement: 'mobile_sticky' }),
      },
    ])
    return () => setStickyActions(null)
  }, [property])

  if (loading && !property) {
    return (
      <div className="container-page py-6 lg:py-10" aria-busy="true">
        <div className="-mx-4 aspect-[4/3] animate-pulse bg-sand-200 sm:mx-0 sm:aspect-[16/9] sm:rounded-2xl lg:aspect-[16/8]" />
        <div className="mt-6 h-8 w-1/3 animate-pulse rounded bg-sand-200" />
      </div>
    )
  }

  if (!property || !messages) {
    return (
      <div className="container-page flex flex-col items-center py-20 text-center sm:py-24">
        <p className="eyebrow text-gold-600">Imóvel não encontrado</p>
        <h1 className="mt-3 font-display text-[28px] leading-tight font-bold tracking-[-0.03em] text-balance text-navy-950 sm:text-3xl">
          Este imóvel não está mais disponível.
        </h1>
        <p className="mt-3 max-w-md text-slate">Ele pode ter sido vendido ou o endereço está incorreto.</p>
        <ButtonLink to="/imoveis" size="lg" className="mt-8">
          Ver imóveis disponíveis
        </ButtonLink>
      </div>
    )
  }

  const gallery = property.gallery.length ? property.gallery : [property.image]
  const tour = property.tour
  const openTour = (source: string) => {
    track('property_tour_cta_clicked', { property_id: property.id, placement: source })
    launcher.open(undefined, source)
  }

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: property?.title, url })
      else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // Compartilhamento cancelado pelo usuário.
    }
  }

  const trackWhatsApp = (placement: string) => () =>
    track('property_whatsapp_clicked', { property_id: property.id, placement })
  const trackSchedule = (placement: string) => () =>
    track('property_schedule_clicked', { property_id: property.id, placement })

  return (
    <>
      {/* 1. GALERIA */}
      <div className="bg-sand">
        <div className="container-page pb-5 sm:py-6 lg:py-8">
          <nav aria-label="Trilha" className="hidden items-center gap-1.5 text-[13px] text-slate sm:mb-5 sm:flex">
            <Link to="/" className="inline-flex min-h-10 items-center hover:text-navy-950">
              Início
            </Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <Link to={`/imoveis?finalidade=${property.purpose}`} className="inline-flex min-h-10 items-center hover:text-navy-950">
              Imóveis
            </Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span className="truncate text-navy-950">{property.title}</span>
          </nav>

          <PropertyGallery
            images={gallery}
            resetKey={property.id}
            overlay={
              <div className="absolute top-3 left-3 flex flex-wrap gap-2 sm:top-4 sm:left-4">
                {property.documentationVerified && (
                  <Badge tone="verified" icon={ShieldCheck}>
                    Documentação verificada
                  </Badge>
                )}
                {tour && (
                  <button
                    type="button"
                    onClick={() => openTour('property_gallery_badge')}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-tour px-3 text-[12px] font-semibold text-white shadow-sm transition-transform active:scale-95"
                  >
                    <Rotate3d className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
                    Tour 3D
                  </button>
                )}
                {property.has3DModel && (
                  <a
                    href="#modelo-3d"
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-navy-950/85 px-3 text-[12px] font-bold tracking-[0.04em] text-gold-400 uppercase shadow-sm ring-1 ring-gold-500/40 backdrop-blur"
                  >
                    <Box className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
                    Modelo 3D interativo
                  </a>
                )}
              </div>
            }
          />
        </div>
      </div>

      <div className="container-page grid gap-8 pt-6 pb-10 sm:pt-8 lg:grid-cols-[1fr_360px] lg:gap-14 lg:py-14">
        <div className="min-w-0">
          {/* 2–4. PREÇO · LOCALIZAÇÃO · ESPECIFICAÇÕES */}
          <p className="text-[13px] text-slate lg:hidden">{property.purpose === 'aluguel' ? 'Aluguel' : 'Valor de venda'}</p>
          <p className="font-display text-[32px] leading-none font-extrabold tracking-[-0.04em] text-navy-950 lg:hidden">
            {formatPropertyPrice(property)}
          </p>
          <div className="mt-3 flex items-start justify-between gap-3 lg:mt-0">
            <div className="min-w-0">
              <h1 className="font-display text-[24px] leading-tight font-bold tracking-[-0.03em] text-balance text-navy-950 sm:text-[32px] lg:text-[40px] lg:font-extrabold lg:tracking-[-0.04em]">
                {property.title} em {property.location.neighborhood}
              </h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-[14px] text-slate">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                {formatLocation(property.location)} · {propertyTypeLabels[property.type]}
              </p>
            </div>
            <div className="-mr-2 flex shrink-0 items-center">
              <button
                type="button"
                onClick={share}
                aria-label={copied ? 'Link copiado' : 'Compartilhar'}
                className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-[13px] font-medium text-navy-950 hover:bg-sand"
              >
                <Share2 className="size-[18px]" />
                <span className="hidden sm:inline">{copied ? 'Link copiado' : 'Compartilhar'}</span>
              </button>
              <FavoriteButton propertyId={property.id} className="size-11" />
            </div>
          </div>
          <PropertySpecs property={property} size="md" className="mt-4 border-y border-navy-950/8 py-4" />

          {/* 5. TOUR 3D — diferencial comercial */}
          {tour && <TourCtaCard tour={tour} onEnter={() => openTour('property_summary')} className="mt-6" />}

          {/* 5b. MODELO 3D — só baixa o arquivo depois do clique */}
          {property.has3DModel && property.model3DUrl && (
            <Property3DExperience
              className="mt-6 scroll-mt-24"
              url={property.model3DUrl}
              poster={property.model3DPoster}
              posterAlt={`Modelo 3D do imóvel ${property.title} em ${property.location.neighborhood}: vista geral com fachada, garagem e piscina`}
              title={`${property.title} em ${property.location.neighborhood}`}
              config={property.model3DConfig ?? {}}
              scheduleMessage={messages.schedule}
              onShowPhotos={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          )}

          {/* 6. DESCRIÇÃO E DIFERENCIAIS */}
          <h2 className="mt-8 font-display text-xl font-bold tracking-[-0.02em] text-navy-950">Sobre o imóvel</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-navy-950/80">{property.description}</p>

          <h2 className="mt-8 font-display text-xl font-bold tracking-[-0.02em] text-navy-950">Diferenciais</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {property.amenities.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[14.5px] text-navy-950/85">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sand text-gold-600">
                  <Check className="size-3.5" strokeWidth={2.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          {/* Tour em destaque (desktop): capa imersiva */}
          {tour && (
            <section id="tour" aria-label="Tour 3D" className="mt-12 hidden lg:block">
              <TourEntry
                tour={tour}
                placement="property_section"
                onEnter={(sceneId, source) => {
                  track('property_tour_cta_clicked', { property_id: property.id, placement: source ?? 'property_section' })
                  launcher.open(sceneId, source)
                }}
                eyebrow="Legalize 3D Experience"
                headline="Faça uma visita agora"
                description="Percorra os ambientes, toque nos destaques e navegue pela planta."
                className="h-[480px] rounded-2xl"
              />
            </section>
          )}

          {/* 7. DOCUMENTAÇÃO */}
          <div className="mt-10 rounded-2xl bg-navy-950 p-5 text-white sm:mt-12 sm:p-8">
            <div className="flex items-start gap-3">
              <ShieldCheck className="size-7 shrink-0 text-gold-400" strokeWidth={1.5} />
              <h2 className="font-display text-[19px] leading-snug font-bold tracking-[-0.02em] sm:text-xl">
                {property.documentationVerified ? 'Documentação verificada pela Legalize' : 'Análise documental em andamento'}
              </h2>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {documentationChecklist.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[14px] text-white/85">
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full',
                      property.documentationVerified ? 'bg-[#3f9a6b] text-white' : 'border border-white/30',
                    )}
                  >
                    {property.documentationVerified && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 8. CONTATO / AGENDAMENTO */}
        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Contato">
          <div className="rounded-2xl border border-navy-950/8 bg-white p-5 shadow-[var(--shadow-float)] sm:p-6">
            <p className="hidden text-[13px] text-slate lg:block">{property.purpose === 'aluguel' ? 'Aluguel' : 'Valor de venda'}</p>
            <p className="hidden font-display text-[32px] font-extrabold tracking-[-0.04em] text-navy-950 lg:block">
              {formatPropertyPrice(property)}
            </p>
            <p className="font-display text-[19px] font-bold tracking-[-0.02em] text-navy-950 lg:hidden">Gostou deste imóvel?</p>
            <p className="mt-1 text-[14px] text-slate lg:hidden">Fale com um especialista ou agende sua visita.</p>
            <ButtonAnchor
              href={whatsappLink(messages.interest)}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="mt-5 w-full lg:mt-6"
              onClick={trackWhatsApp('property_contact_card')}
            >
              <WhatsAppIcon className="size-5" />
              Falar com um especialista
            </ButtonAnchor>
            <ButtonAnchor
              href={whatsappLink(messages.schedule)}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="lg"
              className="mt-3 w-full"
              onClick={trackSchedule('property_contact_card')}
            >
              <CalendarCheck className="size-5" />
              Agendar visita
            </ButtonAnchor>
            {tour && (
              <button
                type="button"
                onClick={() => openTour('property_contact_card')}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-navy-800 hover:bg-sand"
              >
                <Rotate3d className="size-[18px]" />
                Fazer o tour 3D antes
              </button>
            )}
            <p className="mt-4 text-center text-[12px] text-slate">Atendimento em até 15 minutos em horário comercial.</p>
          </div>
          <Link to="/imoveis" className="mt-4 inline-flex h-11 items-center gap-2 text-[14px] font-medium text-navy-800">
            <ArrowLeft className="size-4" />
            Voltar para os imóveis
          </Link>
        </aside>
      </div>

      {related && related.length > 0 && (
        <section className="bg-sand py-12 sm:py-14">
          <div className="container-page">
            <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-navy-950">Você também pode gostar</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {launcher.element}
    </>
  )
}
