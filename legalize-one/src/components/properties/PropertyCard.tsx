import { ArrowRight, Box, MapPin, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
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
  const href = `/imovel/${property.slug}`
  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-navy-950/6 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]',
        className,
      )}
    >
      <Link to={href} className="relative block" tabIndex={-1} aria-hidden="true">
        <SmartImage
          src={property.image.src}
          alt={property.image.alt}
          fallback={property.image.fallback}
          className="aspect-[16/10]"
          imgClassName="transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/35 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {showFeaturedBadge && property.featured && <Badge tone="gold">Destaque</Badge>}
          {property.documentationVerified && (
            <Badge tone="verified" icon={ShieldCheck}>
              Documentação verificada
            </Badge>
          )}
        </div>
        {property.tourEnabled && (
          <Badge tone="tour" icon={Box} className="absolute right-3 bottom-3">
            Tour 3D
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-4 pt-4 pb-3.5 sm:px-5">
        <p className="flex items-center gap-1.5 text-[12px] text-slate">
          <MapPin className="size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          <span className="truncate">{formatLocation(property.location)}</span>
        </p>
        <h3 className="mt-1.5 font-display text-[16px] font-semibold tracking-[-0.02em] text-navy-950">
          <Link to={href} className="outline-none focus-visible:underline">
            {property.title}
          </Link>
        </h3>
        <PropertySpecs property={property} className="mt-3" />
        <p className="mt-4 font-display text-[22px] font-bold tracking-[-0.03em] text-navy-950">
          {formatPropertyPrice(property)}
        </p>
        <div className="mt-4 flex items-center gap-2 border-t border-navy-950/6 pt-3.5">
          <Link
            to={href}
            className="inline-flex h-10 flex-1 items-center gap-2 rounded-full border border-navy-950/10 px-5 text-[13px] font-semibold text-navy-800 transition-colors hover:border-navy-800/40 hover:bg-sand"
          >
            Ver detalhes
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <FavoriteButton propertyId={property.id} />
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
