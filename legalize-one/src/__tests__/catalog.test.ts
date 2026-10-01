import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { properties } from '@/data/properties'
import { tours } from '@/data/tours'
import { mapPublicProperty, type PublicMediaRow, type PublicPropertyRow } from '@/services/repositories/mapProperty'
import shim from '../../supabase/tests/supabase-shim.sql?raw'
import seed from '../../supabase/seed.sql?raw'
import seedCatalog from '../../supabase/seed_catalog.sql?raw'

/**
 * Importação do catálogo: banco (migrations + seed + seed_catalog) → funções públicas (como
 * visitante anônimo) → conversor do site. O resultado tem de ser o catálogo da V1.
 */

const migrations = import.meta.glob<string>('../../supabase/migrations/*.sql', { query: '?raw', import: 'default', eager: true })
const TENANT = '00000000-0000-4000-8000-000000000001'

let db: PGlite
let mapped: ReturnType<typeof mapPublicProperty>[]
let rows: PublicPropertyRow[]

beforeAll(async () => {
  db = new PGlite()
  await db.exec(shim)
  for (const file of Object.keys(migrations).sort()) await db.exec(migrations[file])
  await db.exec(seed)
  await db.exec(seedCatalog)
  await db.exec(seedCatalog) // idempotente
  await db.exec(`select set_config('request.jwt.claim.sub', '', false); set role anon;`)
  rows = (await db.query<PublicPropertyRow>(`select * from public.get_published_properties($1)`, [TENANT])).rows
  const media = (await db.query<PublicMediaRow>(`select * from public.get_published_media($1) where kind = 'photo'`, [TENANT])).rows
  mapped = rows.map((r) => mapPublicProperty(r, media))
}, 60_000)

afterAll(async () => {
  await db?.close()
})

describe('catálogo importado = catálogo da V1', () => {
  it('mesmos imóveis, sem duplicar ao reimportar', () => {
    expect(rows).toHaveLength(properties.length)
    expect(mapped.map((p) => p.slug).sort()).toEqual(properties.map((p) => p.slug).sort())
  })

  it.each(properties.map((p) => [p.slug, p] as const))('%s: campos exibidos no site', (slug, original) => {
    const p = mapped.find((m) => m.slug === slug)!
    expect({
      title: p.title,
      type: p.type,
      purpose: p.purpose,
      location: p.location,
      price: p.price,
      area: p.area,
      bedrooms: p.bedrooms,
      suites: p.suites,
      bathrooms: p.bathrooms,
      parking: p.parking,
      description: p.description,
      amenities: p.amenities,
      featured: p.featured,
      documentationVerified: p.documentationVerified,
      tourEnabled: p.tourEnabled,
      tourId: p.tourId,
      imageSrc: p.image.src,
      imageFallback: p.image.fallback,
      gallery: p.gallery,
      has3DModel: Boolean(p.has3DModel),
      model3DUrl: p.model3DUrl,
      model3DPoster: p.model3DPoster,
      model3DConfig: p.model3DConfig,
    }).toEqual({
      title: original.title,
      type: original.type,
      purpose: original.purpose,
      location: original.location,
      price: original.price,
      area: original.area,
      bedrooms: original.bedrooms,
      suites: original.suites,
      bathrooms: original.bathrooms,
      parking: original.parking,
      description: original.description,
      amenities: original.amenities,
      featured: original.featured,
      documentationVerified: original.documentationVerified,
      tourEnabled: original.tourEnabled,
      tourId: original.tourEnabled ? original.tourId : undefined,
      imageSrc: original.image.src,
      imageFallback: original.image.fallback,
      gallery: original.gallery,
      has3DModel: Boolean(original.has3DModel),
      model3DUrl: original.model3DUrl,
      model3DPoster: original.model3DPoster,
      model3DConfig: original.model3DConfig,
    })
  })

  it('tour 360 completo preservado (cenas, hotspots, planta)', () => {
    const withTour = rows.filter((r) => r.virtual_tour)
    expect(withTour.length).toBe(properties.filter((p) => p.tourEnabled).length)
    for (const r of withTour) expect(r.virtual_tour).toEqual(tours.find((t) => t.id === r.virtual_tour!.id))
  })

  it('endereço exato oculto por padrão', async () => {
    const r = await db.query<{ street: string | null }>(`select street from public.get_published_properties($1)`, [TENANT])
    expect(r.rows.every((x) => x.street === null)).toBe(true)
  })
})
