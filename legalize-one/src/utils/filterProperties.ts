import { priceRanges } from '@/data/filters'
import type { PropertyFilters, SortOption } from '@/types/filters'
import type { Property, PropertyPurpose, PropertyType } from '@/types/property'
import { normalizeText } from './format'

export const defaultFilters: PropertyFilters = {
  purpose: 'venda',
  region: '',
  type: '',
  priceRange: '',
  bedrooms: 0,
  sort: 'relevancia',
}

const PURPOSES: PropertyPurpose[] = ['venda', 'aluguel']
const TYPES: PropertyType[] = ['casa', 'casa-condominio', 'apartamento', 'cobertura', 'terreno']
const SORTS: SortOption[] = ['relevancia', 'menor-preco', 'maior-preco', 'maior-area']

/** Nomes dos parâmetros na URL (em português, amigáveis para compartilhamento/SEO). */
const PARAM = {
  purpose: 'finalidade',
  region: 'regiao',
  type: 'tipo',
  priceRange: 'preco',
  bedrooms: 'quartos',
  sort: 'ordem',
} as const

export function filtersFromSearchParams(params: URLSearchParams): PropertyFilters {
  const purpose = params.get(PARAM.purpose) as PropertyPurpose | null
  const type = params.get(PARAM.type) as PropertyType | null
  const sort = params.get(PARAM.sort) as SortOption | null
  const bedrooms = Number(params.get(PARAM.bedrooms) ?? 0)
  const resolvedPurpose = purpose && PURPOSES.includes(purpose) ? purpose : defaultFilters.purpose
  const priceRange = params.get(PARAM.priceRange) ?? ''

  return {
    purpose: resolvedPurpose,
    region: params.get(PARAM.region) ?? '',
    type: type && TYPES.includes(type) ? type : '',
    priceRange: priceRanges[resolvedPurpose].some((r) => r.id === priceRange) ? priceRange : '',
    bedrooms: Number.isFinite(bedrooms) && bedrooms > 0 ? Math.floor(bedrooms) : 0,
    sort: sort && SORTS.includes(sort) ? sort : defaultFilters.sort,
  }
}

export function filtersToSearchParams(filters: Partial<PropertyFilters>): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.purpose) params.set(PARAM.purpose, filters.purpose)
  if (filters.region?.trim()) params.set(PARAM.region, filters.region.trim())
  if (filters.type) params.set(PARAM.type, filters.type)
  if (filters.priceRange) params.set(PARAM.priceRange, filters.priceRange)
  if (filters.bedrooms) params.set(PARAM.bedrooms, String(filters.bedrooms))
  if (filters.sort && filters.sort !== defaultFilters.sort) params.set(PARAM.sort, filters.sort)
  return params
}

function matchesRegion(property: Property, region: string): boolean {
  const query = normalizeText(region)
  if (!query) return true
  const { neighborhood, city, state } = property.location
  const haystack = normalizeText(`${neighborhood} ${city} ${state} ${neighborhood}, ${city}`)
  // Aceita múltiplos termos separados por vírgula ("Parnamirim, Natal").
  return query
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean)
    .some((term) => haystack.includes(term))
}

function matchesPrice(property: Property, purpose: PropertyPurpose, rangeId: string): boolean {
  if (!rangeId) return true
  const range = priceRanges[purpose].find((r) => r.id === rangeId)
  if (!range) return true
  if (range.min !== undefined && property.price < range.min) return false
  if (range.max !== undefined && property.price > range.max) return false
  return true
}

function sortProperties(list: Property[], sort: SortOption): Property[] {
  const sorted = [...list]
  switch (sort) {
    case 'menor-preco':
      return sorted.sort((a, b) => a.price - b.price)
    case 'maior-preco':
      return sorted.sort((a, b) => b.price - a.price)
    case 'maior-area':
      return sorted.sort((a, b) => b.area - a.area)
    default:
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured))
  }
}

export function filterProperties(list: Property[], filters: PropertyFilters): Property[] {
  const result = list.filter(
    (property) =>
      property.purpose === filters.purpose &&
      matchesRegion(property, filters.region) &&
      (!filters.type || property.type === filters.type) &&
      matchesPrice(property, filters.purpose, filters.priceRange) &&
      property.bedrooms >= filters.bedrooms,
  )
  return sortProperties(result, filters.sort)
}

/** Sugestões de região derivadas dos imóveis disponíveis. */
export function getRegionSuggestions(list: Property[]): string[] {
  const set = new Set<string>()
  list.forEach(({ location }) => {
    set.add(location.city)
    set.add(`${location.neighborhood}, ${location.city}`)
  })
  return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
