import type { PropertyPurpose, PropertyType } from './property'

export type SortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'maior-area'

export interface PropertyFilters {
  purpose: PropertyPurpose
  region: string
  type: PropertyType | ''
  /** Id de uma faixa definida em data/filters.ts. */
  priceRange: string
  /** Quantidade mínima de quartos (0 = todos). */
  bedrooms: number
  sort: SortOption
}

export interface PriceRange {
  id: string
  label: string
  min?: number
  max?: number
}

export interface SelectOption<T extends string = string> {
  value: T
  label: string
}
