import { properties } from '@/data/properties'
import { DEFAULT_TOUR_ID, tours } from '@/data/tours'
import { isBackendEnabled } from '@/lib/backend'
import { isDefaultBrand } from '@/tenant/defaultTenant'
import { getTenant } from '@/tenant/store'
import type { PropertyFilters } from '@/types/filters'
import type { Property, PropertyWithTour } from '@/types/property'
import type { PropertyTour } from '@/types/tour'
import { filterProperties } from '@/utils/filterProperties'
import { catalogSnapshot } from './repositories/catalogSnapshot'

/** Repositório do Supabase só é baixado quando o backend está ligado. */
const remote = () => import('./repositories/supabaseProperties')

/**
 * Camada de acesso a dados do site público (mesma assinatura para todas as páginas).
 * - Sem backend: catálogo local (src/data) — comportamento da V1.
 * - Com backend: imóveis publicados da imobiliária ativa (Supabase).
 */
async function catalog(): Promise<Property[]> {
  return isBackendEnabled() ? (await remote()).loadCatalog() : properties
}

export async function listProperties(filters?: PropertyFilters): Promise<Property[]> {
  const all = await catalog()
  return filters ? filterProperties(all, filters) : [...all]
}

export async function listFeaturedProperties(limit = 8): Promise<Property[]> {
  return (await catalog()).filter((p) => p.featured && p.purpose === 'venda').slice(0, limit)
}

export async function getPropertyBySlug(slug: string): Promise<PropertyWithTour | null> {
  const property = (await catalog()).find((p) => p.slug === slug)
  if (!property) return null
  const tour = property.tourEnabled && property.tourId ? await getTourById(property.tourId) : null
  return { ...property, tour: tour ?? undefined }
}

export async function listRelatedProperties(property: Property, limit = 3): Promise<Property[]> {
  return (await catalog())
    .filter((p) => p.id !== property.id && p.purpose === property.purpose)
    .sort((a, b) => {
      const sameCity = (p: Property) => Number(p.location.city === property.location.city)
      return sameCity(b) - sameCity(a)
    })
    .slice(0, limit)
}

export async function getTourById(id: string = DEFAULT_TOUR_ID): Promise<PropertyTour | null> {
  if (isBackendEnabled()) {
    const repo = await remote()
    const fromProperty = (await repo.loadCatalog()).find((p) => p.tourId === id)
    if (fromProperty) return (await repo.findTour(fromProperty.id)) ?? null
    // Tours de demonstração só pertencem à imobiliária padrão.
    if (!isDefaultBrand(getTenant())) return null
  }
  return tours.find((t) => t.id === id) ?? null
}

/** Acesso síncrono ao catálogo (sugestões de busca). */
export function getLocalCatalog(): Property[] {
  return isBackendEnabled() ? catalogSnapshot() : properties
}

/** Com backend: busca o catálogo logo após identificar a imobiliária (busca/sugestões prontas mais cedo). */
export function preloadCatalog(): void {
  if (isBackendEnabled()) void remote().then((repo) => repo.loadCatalog()).catch(() => undefined)
}
