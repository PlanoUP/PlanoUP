import { ArrowRight, Box, MapPin, Rotate3d, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { propertyHref } from '@/lib/links'
import { SmartImage } from '@/components/ui/SmartImage'
import type { Property } from '@/types/property'
import { cn } from '@/utils/cn'
import { formatLocation, formatPropertyPrice } from '@/utils/format'
import { FavoriteButton } from './FavoriteButton'
import { PropertySpecs } from './PropertySpecs'

interface PropertyCardProps {
  property: Property
  className?: string
  showFeaturedBadge?: boolean
}

export function PropertyCard({ property, className, showFeaturedBadge = true }: PropertyCardProps) {
  const href = propertyHref(property.slug)
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-navy-950/6 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]',
        className,
      )}
    >
      <div className="relative">
        <SmartImage
          src={property.image.src}
          alt={property.image.alt}
          fallback={property.image.fallback}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 90vw"
          className="aspect-[16/10]"
          imgClassName="transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/45 via-transparent to-transparent" />
        {showFeaturedBadge && property.featured && (
          <Badge tone="gold" className="absolute top-3 left-3">
            Destaque
          </Badge>
        )}
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          {property.documentationVerified ? (
            <Badge tone="verified" icon={ShieldCheck}>
              Documentação verificada
            </Badge>
          ) : (
            <span />
          )}
          <div className="flex flex-col items-end gap-1.5">
            {property.has3DModel && (
              <Badge tone="model3d" icon={Box} className="px-3 py-1.5 text-[11.5px]">
                3D interativo
              </Badge>
            )}
            {property.tourEnabled && (
              <Badge tone="tour" icon={Rotate3d} className="px-3 py-1.5 text-[12px]">
                Tour 3D
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pt-4 pb-3.5 sm:px-5">
        <p className="flex items-center gap-1.5 text-[12px] text-slate">
          <MapPin className="size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          <span className="truncate">{formatLocation(property.location)}</span>
        </p>
        <h3 className="mt-1.5 font-display text-[16px] font-semibold tracking-[-0.02em] text-navy-950">
          {/* Link "esticado": o card inteiro é clicável. */}
          <Link to={href} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-gold-500">
            {property.title}
          </Link>
        </h3>
        <PropertySpecs property={property} className="mt-3" />
        <p className="mt-3.5 font-display text-[24px] font-bold tracking-[-0.03em] text-navy-950 sm:text-[22px]">
          {formatPropertyPrice(property)}
        </p>
        <div className="relative z-10 mt-4 flex items-center gap-2 border-t border-navy-950/6 pt-3.5">
          <Link
            to={href}
            tabIndex={-1}
            aria-hidden="true"
            className="inline-flex h-11 flex-1 items-center gap-2 rounded-full border border-navy-950/10 px-5 text-[13px] font-semibold text-navy-800 transition-colors hover:border-navy-800/40 hover:bg-sand"
          >
            Ver detalhes
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <FavoriteButton propertyId={property.id} className="size-11" />
        </div>
      </div>
    </article>
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy-950/6 bg-white" aria-hidden="true">
      <div className="aspect-[16/10] animate-pulse bg-sand-200" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-2/3 animate-pulse rounded bg-sand-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-sand-200" />
        <div className="h-3 w-full animate-pulse rounded bg-sand-200" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-sand-200" />
      </div>
    </div>
  )
}
