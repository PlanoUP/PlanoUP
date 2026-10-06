// Prévia ao compartilhar (WhatsApp, Instagram, Facebook, LinkedIn…): esses apps não executam JavaScript,
// então as metatags do perfil do corretor e do imóvel são escritas no HTML pelo servidor.
// Funções puras — testadas em src/__tests__/shareMeta.test.ts.

const SITE_NAME = 'Impulsigo'

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function clip(text, max) {
  const s = String(text ?? '').replace(/\s+/g, ' ').trim()
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`
}

/** Só imagens que os apps de mensagem exibem (SVG não aparece na prévia), sempre com endereço absoluto. */
export function rasterImage(url, origin) {
  if (!url || typeof url !== 'string') return null
  if (/\.svg(\?|#|$)/i.test(url) || url.startsWith('data:')) return null
  try {
    return new URL(url, origin).toString()
  } catch {
    return null
  }
}

function money(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

const TYPE = { casa: 'Casa', 'casa-condominio': 'Casa em condomínio', apartamento: 'Apartamento', cobertura: 'Cobertura', terreno: 'Terreno' }

/** Título, descrição e imagem do perfil do corretor ou de um imóvel dele. */
export function brokerShareMeta({ profile, property, coverFromMedia, origin, path }) {
  const place = [profile.city, profile.state].filter(Boolean).join(' - ')
  const title0 = profile.professionalTitle || 'Corretor de imóveis'
  const url = new URL(path, origin).toString()

  if (property) {
    const where = [property.neighborhood, property.city].filter(Boolean).join(', ')
    const price = money(property.price)
    const facts = [
      TYPE[property.type],
      property.bedrooms ? `${property.bedrooms} quarto${property.bedrooms > 1 ? 's' : ''}` : null,
      property.built_area ? `${Number(property.built_area)} m²` : null,
      where || null,
      price ? (property.purpose !== 'venda' ? `${price}/mês` : price) : null,
    ].filter(Boolean)
    return {
      title: clip(`${property.title} · ${profile.name}`, 90),
      description: clip(`${facts.join(' · ')}. Fale direto com ${profile.name.split(' ')[0]}, ${title0.toLowerCase()}.`, 200),
      image:
        rasterImage(property.cover_image_url, origin) ??
        rasterImage(coverFromMedia, origin) ??
        rasterImage(profile.coverUrl, origin) ??
        rasterImage(profile.photoUrl, origin),
      url,
      type: 'website',
    }
  }

  const lead = profile.tagline || profile.headline || `Imóveis selecionados${place ? ` em ${place}` : ''}.`
  return {
    title: clip(`${profile.name} · ${title0}${place ? ` em ${place}` : ''}`, 90),
    description: clip(`${lead}${profile.creci ? ` ${profile.creci}.` : ''} Veja os imóveis e fale direto pelo WhatsApp.`, 200),
    image: rasterImage(profile.photoUrl, origin) ?? rasterImage(profile.coverUrl, origin),
    url,
    type: 'profile',
  }
}

/** Troca o <title>/description do index.html e acrescenta Open Graph, Twitter card e canonical. */
export function injectMeta(html, meta) {
  const e = escapeHtml
  const tags = [
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${e(meta.type)}" />`,
    `<meta property="og:title" content="${e(meta.title)}" />`,
    `<meta property="og:description" content="${e(meta.description)}" />`,
    `<meta property="og:url" content="${e(meta.url)}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    meta.image ? `<meta property="og:image" content="${e(meta.image)}" />` : '',
    meta.image ? `<meta property="og:image:alt" content="${e(meta.title)}" />` : '',
    `<meta name="twitter:card" content="${meta.image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${e(meta.title)}" />`,
    `<meta name="twitter:description" content="${e(meta.description)}" />`,
    meta.image ? `<meta name="twitter:image" content="${e(meta.image)}" />` : '',
    `<link rel="canonical" href="${e(meta.url)}" />`,
  ].filter(Boolean)

  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${e(meta.title)}</title>`)
  out = out.replace(/<meta\s+name="description"[\s\S]*?\/>/i, `<meta name="description" content="${e(meta.description)}" />`)
  return out.replace(/<\/head>/i, `    ${tags.join('\n    ')}\n  </head>`)
}
