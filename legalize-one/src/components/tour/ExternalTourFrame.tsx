import type { PropertyTour } from '@/types/tour'

/** Renderiza tours de provedores externos (Matterport, Kuula ou iframe genérico). */
export function ExternalTourFrame({ tour, className }: { tour: PropertyTour; className?: string }) {
  if (!tour.tourUrl) return null
  return (
    <iframe
      src={tour.tourUrl}
      title={`Tour 3D — ${tour.title}`}
      className={className}
      allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
      allowFullScreen
      loading="lazy"
    />
  )
}
