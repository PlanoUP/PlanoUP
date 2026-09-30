import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import type { TourRendererProps } from './types'

/**
 * Tours de provedores externos (Matterport, Kuula ou iframe genérico).
 * Só é montado dentro do modo imersivo, então o iframe (pesado) nunca
 * carrega antes de o usuário entrar no tour.
 */
export function EmbedRenderer({ tour }: Pick<TourRendererProps, 'tour'>) {
  const [loaded, setLoaded] = useState(false)
  if (!tour.tourUrl) return null
  return (
    <div className="absolute inset-0 bg-navy-950">
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80" role="status">
          <LoaderCircle className="size-7 animate-spin text-gold-400" />
          <p className="text-[13px]">Carregando tour…</p>
        </div>
      )}
      <iframe
        src={tour.tourUrl}
        title={`Tour 3D — ${tour.title}`}
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 h-full w-full border-0"
        allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
        allowFullScreen
      />
    </div>
  )
}
