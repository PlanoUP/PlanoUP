import type { SceneArtVariant } from './media'
import type { Model3DConfig } from './model3d'
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
  /** Modelo 3D navegável (GLB/GLTF) — experiência diferente do tour 360. */
  has3DModel?: boolean
  /** Caminho do arquivo (ex.: `/models/<slug>/<arquivo>.glb`) ou URL do Storage. */
  model3DUrl?: string
  /** Imagem de capa exibida antes do carregamento (nunca baixa o GLB). */
  model3DPoster?: string
  model3DConfig?: Model3DConfig
}

export interface PropertyWithTour extends Property {
  tour?: PropertyTour
}
