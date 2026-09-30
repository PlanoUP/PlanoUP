import { lazy } from 'react'
import { isEmbeddedTour, type PropertyTour } from '@/types/tour'

export { EmbedRenderer } from './EmbedRenderer'
export { PanoramaRenderer } from './PanoramaRenderer'
export type { ScreenPoint, TourRendererProps } from './types'

/** Modelo 3D: chunk separado para a futura engine (Three.js/R3F) não pesar no restante. */
export const ModelRenderer = lazy(() => import('./ModelRenderer'))

export type RendererKind = 'panorama' | 'embed' | 'model'

/** Escolhe o renderizador a partir dos dados do tour. */
export function rendererKindOf(tour: PropertyTour): RendererKind {
  if (isEmbeddedTour(tour)) return 'embed'
  if (tour.tourType === 'model' && tour.model) return 'model'
  return 'panorama'
}
