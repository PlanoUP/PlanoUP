import { requireSupabase } from '@/lib/supabase'
import { getTenant } from '@/tenant/store'
import type { Property } from '@/types/property'
import type { PropertyTour } from '@/types/tour'
import { setCatalogSnapshot } from './catalogSnapshot'
import { mapPublicProperty, type PublicMediaRow, type PublicPropertyRow } from './mapProperty'

/**
 * Imóveis da imobiliária ativa, lidos pelas funções públicas do banco (que garantem
 * que só aparecem imóveis publicados de tenants ativos).
 * O catálogo é pequeno por imobiliária (dezenas/centenas): carregamos uma vez e filtramos
 * em memória com a mesma lógica da V1 — mesmos resultados, menos round-trips.
 */
const CACHE_MS = 60_000
const tourCache = new Map<string, PropertyTour | null>()
let cache: { tenantId: string; at: number; data: Promise<Property[]> } | null = null

function tenantId(): string {
  const id = getTenant().id
  if (!id) throw new Error('tenant_not_resolved')
  return id
}

async function fetchCatalog(id: string): Promise<Property[]> {
  tourCache.clear()
  const supabase = await requireSupabase()
  const { data: rows, error } = await supabase
    .rpc('get_published_properties', { p_tenant_id: id })
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })
  if (error) throw error
  const list = (rows ?? []) as PublicPropertyRow[]
  if (!list.length) return []
  const { data: media, error: mediaError } = await supabase
    .rpc('get_published_media', { p_tenant_id: id })
    .select('property_id, kind, url, storage_path, alt, position, is_cover, metadata')
    .eq('kind', 'photo')
    .order('position')
  if (mediaError) throw mediaError
  for (const row of list) tourCache.set(row.id, row.virtual_tour)
  return list.map((row) => mapPublicProperty(row, (media ?? []) as PublicMediaRow[]))
}

export function loadCatalog(): Promise<Property[]> {
  const id = tenantId()
  if (!cache || cache.tenantId !== id || Date.now() - cache.at > CACHE_MS) {
    const data = fetchCatalog(id)
    cache = { tenantId: id, at: Date.now(), data }
    data.then(setCatalogSnapshot).catch(() => (cache = null))
  }
  return cache.data
}


/** Tour virtual (fotos 360°) do imóvel, guardado em `properties.virtual_tour`. */
export async function findTour(propertyId: string): Promise<PropertyTour | null> {
  await loadCatalog()
  return tourCache.get(propertyId) ?? null
}
