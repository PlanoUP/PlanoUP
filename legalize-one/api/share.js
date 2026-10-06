// Página do corretor com prévia ao compartilhar: entrega o mesmo index.html do site, com as metatags
// (título, descrição e foto) do corretor ou do imóvel. Se algo falhar, entrega o index.html sem mudanças.
// Rotas em vercel.json: /corretor/:slug e /corretor/:slug/imovel/:property.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { brokerShareMeta, injectMeta } from './_lib/share-meta.js'

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

async function loadIndex(origin) {
  try {
    return await readFile(join(process.cwd(), 'dist', 'index.html'), 'utf8')
  } catch {
    const r = await fetch(`${origin}/index.html`)
    if (!r.ok) throw new Error(`index ${r.status}`)
    return r.text()
  }
}

async function rpc(name, body) {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const r = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(3500),
  })
  return r.ok ? r.json() : null
}

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const origin = `${req.headers['x-forwarded-proto'] || 'https'}://${host}`
  const slug = String(req.query.slug || '').toLowerCase()
  const propertySlug = req.query.property ? String(req.query.property).toLowerCase() : null

  let html
  try {
    html = await loadIndex(origin)
  } catch {
    return res.status(502).send('Página indisponível no momento.')
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  try {
    if (!SLUG.test(slug) || (propertySlug && !SLUG.test(propertySlug))) throw new Error('slug')
    const profile = await rpc('get_broker_profile', { p_slug: slug })
    if (!profile || !profile.name) throw new Error('profile')

    let property = null
    let coverFromMedia = null
    if (propertySlug) {
      const list = (await rpc('get_broker_properties', { p_slug: slug })) ?? []
      property = list.find((p) => p.slug === propertySlug) ?? null
      if (property && !property.cover_image_url) {
        const media = (await rpc('get_broker_media', { p_slug: slug })) ?? []
        const photos = media.filter((m) => m.property_id === property.id && m.kind === 'photo')
        coverFromMedia = (photos.find((m) => m.is_cover) ?? photos.sort((a, b) => a.position - b.position)[0])?.url ?? null
      }
    }

    const path = `/corretor/${slug}${property ? `/imovel/${property.slug}` : ''}`
    const meta = brokerShareMeta({ profile, property, coverFromMedia, origin, path })
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400')
    return res.status(200).send(injectMeta(html, meta))
  } catch {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60')
    return res.status(200).send(html)
  }
}
