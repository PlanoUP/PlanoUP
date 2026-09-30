import { ArrowLeft, Box, CalendarCheck, Check, ChevronRight, MapPin, Share2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { FavoriteButton } from '@/components/properties/FavoriteButton'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { PropertySpecs } from '@/components/properties/PropertySpecs'
import { Tour3DPreview } from '@/components/tour/Tour3DPreview'
import { Badge } from '@/components/ui/Badge'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { SmartImage } from '@/components/ui/SmartImage'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { documentationChecklist } from '@/data/content'
import { propertyTypeLabels } from '@/data/filters'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { track } from '@/lib/analytics'
import { whatsappLink } from '@/lib/whatsapp'
import { getPropertyBySlug, listRelatedProperties } from '@/services/propertyService'
import { cn } from '@/utils/cn'
import { formatLocation, formatPropertyPrice } from '@/utils/format'

export default function PropertyDetails() {
  const { slug = '' } = useParams()
  const { data: property, loading } = useAsyncData(() => getPropertyBySlug(slug), slug)
  const { data: related } = useAsyncData(
    () => (property ? listRelatedProperties(property) : Promise.resolve([])),
    property?.id ?? '',
  )
  const [imageState, setImageState] = useState({ slug, index: 0 })
  const activeImage = imageState.slug === slug ? imageState.index : 0
  const setActiveImage = (index: number) => setImageState({ slug, index })
  const [copied, setCopied] = useState(false)

  usePageTitle(property ? `${property.title} em ${property.location.neighborhood}` : loading ? undefined : 'Imóvel não encontrado')

  useEffect(() => {
    if (property) track('property_viewed', { property_id: property.id, price: property.price })
  }, [property])

  if (loading && !property) {
    return (
      <div className="container-page py-10" aria-busy="true">
        <div className="aspect-[16/8] animate-pulse rounded-2xl bg-sand-200" />
        <div className="mt-6 h-8 w-1/3 animate-pulse rounded bg-sand-200" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <p className="eyebrow text-gold-600">Imóvel não encontrado</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-navy-950">
          Este imóvel não está mais disponível.
        </h1>
        <p className="mt-3 max-w-md text-slate">Ele pode ter sido vendido ou o endereço está incorreto.</p>
        <ButtonLink to="/imoveis" className="mt-8">
          Ver imóveis disponíveis
        </ButtonLink>
      </div>
    )
  }

  const gallery = property.gallery.length ? property.gallery : [property.image]
  const mainImage = gallery[activeImage] ?? gallery[0]
  const message = `Olá! Tenho interesse no imóvel "${property.title}" em ${formatLocation(property.location)} (${formatPropertyPrice(property)}).`

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

  return (
    <>
      <div className="bg-sand">
        <div className="container-page py-6 sm:py-8">
          <nav aria-label="Trilha" className="flex items-center gap-1.5 text-[12.5px] text-slate">
            <Link to="/" className="hover:text-navy-950">
              Início
            </Link>
            <ChevronRight className="size-3.5" />
            <Link to={`/imoveis?finalidade=${property.purpose}`} className="hover:text-navy-950">
              Imóveis
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="truncate text-navy-950">{property.title}</span>
          </nav>

          {/* Galeria */}
          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_280px]">
            <div className="relative overflow-hidden rounded-2xl">
              <SmartImage
                key={mainImage.src}
                src={mainImage.src}
                alt={mainImage.alt}
                fallback={mainImage.fallback}
                loading="eager"
                className="aspect-[16/10] animate-[fade-up_0.5s_both] sm:aspect-[16/8]"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {property.documentationVerified && (
                  <Badge tone="verified" icon={ShieldCheck}>
                    Documentação verificada
                  </Badge>
                )}
                {property.tourEnabled && (
                  <Badge tone="tour" icon={Box}>
                    Tour 3D
                  </Badge>
                )}
              </div>
            </div>
            <div className="no-scrollbar flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
              {gallery.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`Ver foto ${i + 1}: ${img.alt}`}
                  aria-pressed={i === activeImage}
                  className={cn(
                    'relative w-32 shrink-0 overflow-hidden rounded-xl ring-2 transition-all lg:w-full lg:flex-1',
                    i === activeImage ? 'ring-gold-500' : 'ring-transparent opacity-80 hover:opacity-100',
                  )}
                >
                  <SmartImage src={img.src} alt="" fallback={img.fallback} className="aspect-[4/3] h-full lg:aspect-auto lg:min-h-[80px]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_360px] lg:gap-14 lg:py-14">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[13px] text-slate">
            <MapPin className="size-4" />
            {formatLocation(property.location)} · {propertyTypeLabels[property.type]}
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <h1 className="font-display text-[32px] leading-tight font-extrabold tracking-[-0.04em] text-navy-950 sm:text-[40px]">
              {property.title} em {property.location.neighborhood}
            </h1>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={share}
                className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-[13px] font-medium text-navy-950 hover:bg-sand"
              >
                <Share2 className="size-4" />
                {copied ? 'Link copiado' : 'Compartilhar'}
              </button>
              <FavoriteButton propertyId={property.id} />
            </div>
          </div>
          <PropertySpecs property={property} size="md" className="mt-5 border-y border-navy-950/8 py-5" />

          <h2 className="mt-8 font-display text-xl font-bold tracking-[-0.02em] text-navy-950">Sobre o imóvel</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-navy-950/80">{property.description}</p>

          <h2 className="mt-8 font-display text-xl font-bold tracking-[-0.02em] text-navy-950">Diferenciais</h2>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {property.amenities.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[14px] text-navy-950/85">
                <span className="flex size-6 items-center justify-center rounded-full bg-sand text-gold-600">
                  <Check className="size-3.5" strokeWidth={2.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          {property.tour && (
            <div id="tour" className="mt-12">
              <p className="eyebrow text-[11px] text-gold-600">Legalize 3D Experience</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] text-navy-950">
                Visite antes de visitar
              </h2>
              <Tour3DPreview tour={property.tour} autoPan={false} className="mt-5 h-[460px] rounded-2xl sm:h-[540px]" />
            </div>
          )}

          <div className="mt-12 rounded-2xl bg-navy-950 p-6 text-white sm:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-7 text-gold-400" strokeWidth={1.5} />
              <h2 className="font-display text-xl font-bold tracking-[-0.02em]">
                {property.documentationVerified ? 'Documentação verificada pela Legalize' : 'Análise documental em andamento'}
              </h2>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {documentationChecklist.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[14px] text-white/85">
                  <span
                    className={cn(
                      'flex size-5 items-center justify-center rounded-full',
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

        {/* Card de contato */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-navy-950/8 bg-white p-6 shadow-[var(--shadow-float)]">
            <p className="text-[13px] text-slate">{property.purpose === 'aluguel' ? 'Aluguel' : 'Valor de venda'}</p>
            <p className="mt-1 font-display text-[32px] font-extrabold tracking-[-0.04em] text-navy-950">
              {formatPropertyPrice(property)}
            </p>
            <ButtonAnchor
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="mt-6 w-full"
              onClick={() => track('whatsapp_clicked', { placement: 'property_details', property_id: property.id })}
            >
              <WhatsAppIcon className="size-5" />
              Falar com um especialista
            </ButtonAnchor>
            <ButtonAnchor
              href={whatsappLink(`Olá! Gostaria de agendar uma visita ao imóvel "${property.title}" (${property.slug}).`)}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="lg"
              className="mt-3 w-full"
            >
              <CalendarCheck className="size-5" />
              Agendar visita
            </ButtonAnchor>
            <p className="mt-5 text-center text-[12px] text-slate">Atendimento em até 15 minutos em horário comercial.</p>
          </div>
          <Link to="/imoveis" className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-navy-800">
            <ArrowLeft className="size-4" />
            Voltar para os imóveis
          </Link>
        </aside>
      </div>

      {related && related.length > 0 && (
        <section className="bg-sand py-14">
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
    </>
  )
}
