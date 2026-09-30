import { properties } from '@/data/properties'
import { DEFAULT_TOUR_ID, tours } from '@/data/tours'
import type { PropertyFilters } from '@/types/filters'
import type { Property, PropertyWithTour } from '@/types/property'
import type { PropertyTour } from '@/types/tour'
import { filterProperties } from '@/utils/filterProperties'

/**
 * Camada de acesso a dados.
 * Hoje lê o MOCK DATA; ao integrar o Supabase, apenas o corpo destas
 * funções muda (ex.: `supabase.from('properties').select()`), mantendo
 * a mesma assinatura assíncrona para páginas e componentes.
 */

export async function listProperties(filters?: PropertyFilters): Promise<Property[]> {
  return filters ? filterProperties(properties, filters) : [...properties]
}

export async function listFeaturedProperties(limit = 8): Promise<Property[]> {
  return properties.filter((p) => p.featured && p.purpose === 'venda').slice(0, limit)
}

export async function getPropertyBySlug(slug: string): Promise<PropertyWithTour | null> {
  const property = properties.find((p) => p.slug === slug)
  if (!property) return null
  const tour = property.tourEnabled && property.tourId ? await getTourById(property.tourId) : null
  return { ...property, tour: tour ?? undefined }
}

export async function listRelatedProperties(property: Property, limit = 3): Promise<Property[]> {
  return properties
    .filter((p) => p.id !== property.id && p.purpose === property.purpose)
    .sort((a, b) => {
      const sameCity = (p: Property) => Number(p.location.city === property.location.city)
      return sameCity(b) - sameCity(a)
    })
    .slice(0, limit)
}

export async function getTourById(id: string = DEFAULT_TOUR_ID): Promise<PropertyTour | null> {
  return tours.find((t) => t.id === id) ?? null
}

/** Acesso síncrono ao catálogo local (usado para sugestões de busca). */
export function getLocalCatalog(): Property[] {
  return properties
}
