/**
 * Gera supabase/seed_catalog.sql a partir do catálogo local (src/data) — imóveis, fotos,
 * tour 360 e configuração do 3D — para a imobiliária padrão (Legalize).
 *
 *   npm run catalog:export
 *
 * Idempotente: IDs determinísticos (hash do slug) e upsert por (tenant_id, slug).
 * Os dados viajam como JSON (dollar-quoted), sem montar strings SQL à mão.
 */
import { createHash } from 'node:crypto'
import { properties } from '@/data/properties'
import { tours } from '@/data/tours'

const TENANT_ID = '00000000-0000-4000-8000-000000000001'

/** UUID determinístico (formato v5) a partir de um texto. */
function uuidFrom(text: string): string {
  const h = createHash('sha1').update(`legalize-one:${text}`).digest('hex')
  const variant = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16)
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${variant}${h.slice(17, 20)}-${h.slice(20, 32)}`
}

const propertyRows = properties.map((p) => {
  const tour = p.tourEnabled && p.tourId ? (tours.find((t) => t.id === p.tourId) ?? null) : null
  return {
    id: uuidFrom(p.slug),
    code: p.id.toUpperCase(),
    slug: p.slug,
    title: p.title,
    type: p.type,
    purpose: p.purpose,
    price: p.price,
    description: p.description,
    neighborhood: p.location.neighborhood,
    city: p.location.city,
    state: p.location.state,
    bedrooms: p.bedrooms,
    suites: p.suites,
    bathrooms: p.bathrooms,
    parking: p.parking,
    built_area: p.area,
    amenities: p.amenities,
    featured: p.featured,
    documentation_verified: p.documentationVerified,
    cover_image_url: p.image.src,
    model3d:
      p.has3DModel && p.model3DUrl
        ? { enabled: true, url: p.model3DUrl, poster: p.model3DPoster, config: p.model3DConfig }
        : null,
    virtual_tour: tour,
  }
})

const mediaRows = properties.flatMap((p) =>
  p.gallery.map((img, position) => ({
    id: uuidFrom(`${p.slug}#${position}`),
    property_id: uuidFrom(p.slug),
    url: img.src,
    alt: img.alt,
    position,
    is_cover: position === 0,
    metadata: { fallback: img.fallback },
  })),
)

const json = (value: unknown) => `$json$${JSON.stringify(value)}$json$::jsonb`

const sql = `-- GERADO por scripts/export-catalog.ts — não editar à mão.
-- Catálogo inicial da Legalize (${propertyRows.length} imóveis, ${mediaRows.length} fotos). Idempotente.
begin;

insert into public.properties (id, tenant_id, code, slug, title, type, purpose, status, price, description,
  neighborhood, city, state, bedrooms, suites, bathrooms, parking, built_area, amenities, featured,
  documentation_verified, cover_image_url, model3d, virtual_tour, hide_exact_address)
select x.id, '${TENANT_ID}', x.code, x.slug, x.title, x.type, x.purpose::public.property_purpose, 'published',
  x.price, x.description, x.neighborhood, x.city, x.state, x.bedrooms, x.suites, x.bathrooms, x.parking,
  x.built_area, x.amenities, x.featured, x.documentation_verified, x.cover_image_url, x.model3d, x.virtual_tour, true
from jsonb_to_recordset(${json(propertyRows)}) as x(
  id uuid, code text, slug text, title text, type text, purpose text, price numeric, description text,
  neighborhood text, city text, state text, bedrooms smallint, suites smallint, bathrooms smallint, parking smallint,
  built_area numeric, amenities text[], featured boolean, documentation_verified boolean, cover_image_url text,
  model3d jsonb, virtual_tour jsonb)
on conflict (tenant_id, slug) do update set
  code = excluded.code, title = excluded.title, type = excluded.type, purpose = excluded.purpose,
  price = excluded.price, description = excluded.description, neighborhood = excluded.neighborhood,
  city = excluded.city, state = excluded.state, bedrooms = excluded.bedrooms, suites = excluded.suites,
  bathrooms = excluded.bathrooms, parking = excluded.parking, built_area = excluded.built_area,
  amenities = excluded.amenities, featured = excluded.featured,
  documentation_verified = excluded.documentation_verified, cover_image_url = excluded.cover_image_url,
  model3d = excluded.model3d, virtual_tour = excluded.virtual_tour;

delete from public.property_media m
where m.tenant_id = '${TENANT_ID}'
  and m.property_id in (${propertyRows.map((r) => `'${r.id}'`).join(', ')});

insert into public.property_media (id, tenant_id, property_id, kind, url, alt, position, is_cover, metadata)
select x.id, '${TENANT_ID}', x.property_id, 'photo', x.url, x.alt, x.position, x.is_cover, x.metadata
from jsonb_to_recordset(${json(mediaRows)}) as x(
  id uuid, property_id uuid, url text, alt text, position int, is_cover boolean, metadata jsonb);

commit;
`

process.stdout.write(sql)
