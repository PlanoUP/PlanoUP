import { storagePublicUrl } from '@/lib/images'
import type { SceneArtVariant } from '@/types/media'
import type { Model3DConfig } from '@/types/model3d'
import type { Property, PropertyImage, PropertyType } from '@/types/property'
import type { PropertyTour } from '@/types/tour'

/** Linha retornada por `get_published_properties` (somente campos públicos). */
export interface PublicPropertyRow {
  id: string
  tenant_id: string
  slug: string
  code: string | null
  title: string
  type: string
  purpose: 'venda' | 'aluguel' | 'temporada'
  price: number | string | null
  condo_fee: number | string | null
  iptu: number | string | null
  description: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  bedrooms: number
  suites: number
  bathrooms: number
  parking: number
  built_area: number | string | null
  total_area: number | string | null
  amenities: string[] | null
  characteristics: Record<string, unknown> | null
  featured: boolean
  documentation_verified: boolean
  cover_image_url: string | null
  model3d: { enabled?: boolean; url?: string; poster?: string; config?: Model3DConfig } | null
  virtual_tour: PropertyTour | null
  published_at: string | null
}

/** Linha retornada por `get_published_media`. */
export interface PublicMediaRow {
  property_id: string
  kind: 'photo' | 'video' | 'floor_plan' | 'virtual_tour' | 'model_3d'
  url: string | null
  storage_path: string | null
  alt: string | null
  position: number
  is_cover: boolean
  /** Ex.: { fallback: 'living' } — ilustração exibida se a foto não carregar. */
  metadata?: { fallback?: string } | null
}

const KNOWN_TYPES: PropertyType[] = ['casa', 'casa-condominio', 'apartamento', 'cobertura', 'terreno']

/** Ilustração exibida enquanto a foto carrega (ou se falhar), coerente com o tipo do imóvel. */
const FALLBACK_BY_TYPE: Record<string, SceneArtVariant> = {
  casa: 'facade-day',
  'casa-condominio': 'townhouse',
  apartamento: 'apartment-tower',
  cobertura: 'coast',
  terreno: 'facade-day',
}

const SCENE_VARIANTS: SceneArtVariant[] = [
  'facade-night', 'facade-day', 'townhouse', 'apartment-tower', 'living', 'kitchen', 'suite', 'gourmet', 'pool', 'coast',
]
const variantOf = (v: unknown): SceneArtVariant | null =>
  typeof v === 'string' && (SCENE_VARIANTS as string[]).includes(v) ? (v as SceneArtVariant) : null

const num = (v: number | string | null | undefined) => (v === null || v === undefined || v === '' ? 0 : Number(v))

function mediaUrl(m: Pick<PublicMediaRow, 'url' | 'storage_path'>): string {
  return m.url || (m.storage_path ? storagePublicUrl(m.storage_path) : '')
}

/**
 * Converte o imóvel do banco no tipo `Property` que as páginas já usam — o site público
 * não precisa saber de onde vieram os dados.
 * Limitações conhecidas (etapa 2+): finalidade "temporada" é exibida como aluguel; tipos
 * novos (sala comercial, galpão…) caem em "casa" até os filtros ganharem essas opções.
 */
export function mapPublicProperty(row: PublicPropertyRow, media: PublicMediaRow[] = []): Property {
  const type = (KNOWN_TYPES as string[]).includes(row.type) ? (row.type as PropertyType) : 'casa'
  const fallback = FALLBACK_BY_TYPE[type] ?? 'facade-day'
  const photos = media
    .filter((m) => m.property_id === row.id && m.kind === 'photo')
    .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.position - b.position)
  const gallery: PropertyImage[] = photos
    .map((m, i) => ({
      src: mediaUrl(m),
      alt: m.alt || `${row.title} — foto ${i + 1}`,
      fallback: variantOf(m.metadata?.fallback) ?? fallback,
    }))
    .filter((img) => img.src)
  const cover: PropertyImage = row.cover_image_url
    ? { src: row.cover_image_url, alt: gallery[0]?.alt ?? row.title, fallback: gallery[0]?.fallback ?? fallback }
    : (gallery[0] ?? { src: '', alt: row.title, fallback })
  const model = row.model3d?.enabled && row.model3d.url ? row.model3d : null

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type,
    purpose: row.purpose === 'venda' ? 'venda' : 'aluguel',
    location: { neighborhood: row.neighborhood ?? '', city: row.city ?? '', state: row.state ?? '' },
    price: num(row.price),
    area: num(row.built_area) || num(row.total_area),
    bedrooms: row.bedrooms,
    suites: row.suites,
    bathrooms: row.bathrooms,
    parking: row.parking,
    image: cover,
    gallery: gallery.length ? gallery : [cover],
    description: row.description ?? '',
    amenities: row.amenities ?? [],
    featured: row.featured,
    tourEnabled: Boolean(row.virtual_tour),
    documentationVerified: row.documentation_verified,
    tourId: row.virtual_tour?.id,
    has3DModel: Boolean(model),
    model3DUrl: model?.url,
    model3DPoster: model?.poster,
    model3DConfig: model?.config,
  }
}
