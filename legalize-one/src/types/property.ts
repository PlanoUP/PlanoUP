import type { SceneArtVariant } from './media'
import type { PropertyTour } from './tour'

export type PropertyPurpose = 'venda' | 'aluguel'

export type PropertyType = 'casa' | 'casa-condominio' | 'apartamento' | 'cobertura' | 'terreno'

export interface PropertyLocation {
  neighborhood: string
  city: string
  state: string
}

export interface PropertyImage {
  src: string
  alt: string
  /** Ilustração exibida caso a foto não carregue. */
  fallback: SceneArtVariant
}

export interface Property {
  id: string
  slug: string
  title: string
  type: PropertyType
  purpose: PropertyPurpose
  location: PropertyLocation
  /** Valor em reais. Para aluguel, valor mensal. */
  price: number
  /** Área privativa em m². */
  area: number
  bedrooms: number
  suites: number
  bathrooms: number
  parking: number
  image: PropertyImage
  gallery: PropertyImage[]
  description: string
  amenities: string[]
  featured: boolean
  tourEnabled: boolean
  documentationVerified: boolean
  /** Tour 3D vinculado ao imóvel (id em data/tours.ts). */
  tourId?: string
}

export interface PropertyWithTour extends Property {
  tour?: PropertyTour
}
