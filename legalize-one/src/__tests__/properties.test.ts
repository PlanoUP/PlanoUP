import { describe, expect, it } from 'vitest'
import { properties } from '@/data/properties'
import { isBackendEnabled } from '@/lib/backend'
import { mapPublicProperty, type PublicMediaRow, type PublicPropertyRow } from '@/services/repositories/mapProperty'
import { getLocalCatalog, getPropertyBySlug, listFeaturedProperties, listProperties } from '@/services/propertyService'

const base: PublicPropertyRow = {
  id: '0b8f6d2a-1111-4222-8333-444455556666',
  tenant_id: '7f1c2d3e-0000-4000-8000-000000000abc',
  slug: 'casa-condominio-capim-macio-natal',
  code: 'LG-006',
  title: 'Casa em condomínio',
  type: 'casa-condominio',
  purpose: 'venda',
  price: '1180000.00',
  condo_fee: null,
  iptu: null,
  description: 'Casa de alto padrão.',
  neighborhood: 'Capim Macio',
  city: 'Natal',
  state: 'RN',
  bedrooms: 4,
  suites: 4,
  bathrooms: 5,
  parking: 4,
  built_area: '280.00',
  total_area: null,
  amenities: ['Piscina'],
  characteristics: { pool: true },
  featured: true,
  documentation_verified: true,
  cover_image_url: null,
  model3d: { enabled: true, url: '/models/casa-mobiliada/casa-mobiliada.glb', poster: '/models/casa-mobiliada/poster.webp', config: { sizeBytes: 1 } },
  virtual_tour: null,
  published_at: '2026-10-01T00:00:00Z',
}

describe('imóveis', () => {
  it('modo sem backend: serviços devolvem o catálogo da V1', async () => {
    expect(isBackendEnabled()).toBe(false)
    expect(await listProperties()).toHaveLength(properties.length)
    expect(getLocalCatalog()).toBe(properties)
    const p = await getPropertyBySlug('casa-condominio-capim-macio-natal')
    expect(p?.has3DModel).toBe(true)
    expect((await listFeaturedProperties()).every((x) => x.featured && x.purpose === 'venda')).toBe(true)
  })

  it('linha do banco vira Property (3D preservado, números convertidos)', () => {
    const media: PublicMediaRow[] = [
      { property_id: base.id, kind: 'photo', url: 'https://cdn/x2.jpg', storage_path: null, alt: null, position: 2, is_cover: false },
      { property_id: base.id, kind: 'photo', url: 'https://cdn/x1.jpg', storage_path: null, alt: 'Fachada', position: 5, is_cover: true },
      { property_id: 'outro', kind: 'photo', url: 'https://cdn/y.jpg', storage_path: null, alt: null, position: 0, is_cover: true },
    ]
    const p = mapPublicProperty(base, media)
    expect(p.price).toBe(1180000)
    expect(p.area).toBe(280)
    expect(p.image.src).toBe('https://cdn/x1.jpg') // capa primeiro
    expect(p.gallery.map((g) => g.src)).toEqual(['https://cdn/x1.jpg', 'https://cdn/x2.jpg'])
    expect(p.has3DModel).toBe(true)
    expect(p.model3DUrl).toBe('/models/casa-mobiliada/casa-mobiliada.glb')
    expect(p.model3DConfig?.sizeBytes).toBe(1)
    expect(p.location).toEqual({ neighborhood: 'Capim Macio', city: 'Natal', state: 'RN' })
  })

  it('sem fotos usa ilustração; 3D desativado não aparece; temporada vira aluguel', () => {
    const p = mapPublicProperty({ ...base, model3d: { enabled: false, url: '/x.glb' }, purpose: 'temporada', type: 'galpao' })
    expect(p.image.src).toBe('')
    expect(p.image.fallback).toBe('facade-day')
    expect(p.has3DModel).toBe(false)
    expect(p.purpose).toBe('aluguel')
    expect(p.type).toBe('casa')
  })
})
