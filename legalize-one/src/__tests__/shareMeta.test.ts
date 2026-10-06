import { describe, expect, it } from 'vitest'
import { brokerShareMeta, injectMeta, rasterImage } from '../../api/_lib/share-meta.js'

const origin = 'https://legalize-one.vercel.app'
const profile = {
  name: 'Lucas Andrade',
  creci: 'CRECI 00000-F (demonstração)',
  professionalTitle: 'Corretor de imóveis',
  tagline: 'Me chama e eu te ajudo a encontrar o imóvel ideal!',
  city: 'Florianópolis',
  state: 'SC',
  photoUrl: '/demo/corretor-demo.svg',
  coverUrl: 'https://images.unsplash.com/photo-1?w=1600',
}
const html = `<html><head><meta name="description" content="Legalize" /><title>Legalize One</title></head><body></body></html>`

describe('prévia ao compartilhar (corretor)', () => {
  it('ignora SVG e torna endereços absolutos', () => {
    expect(rasterImage('/demo/x.svg', origin)).toBeNull()
    expect(rasterImage('/fotos/a.jpg', origin)).toBe(`${origin}/fotos/a.jpg`)
    expect(rasterImage(null, origin)).toBeNull()
  })

  it('perfil: nome, título, cidade e capa quando a foto é SVG', () => {
    const m = brokerShareMeta({ profile, origin, path: '/corretor/demo' })
    expect(m.title).toBe('Lucas Andrade · Corretor de imóveis em Florianópolis - SC')
    expect(m.description).toContain('Me chama')
    expect(m.description).toContain('CRECI 00000-F')
    expect(m.image).toBe(profile.coverUrl)
    expect(m.url).toBe(`${origin}/corretor/demo`)
  })

  it('imóvel: título, fatos, preço e foto do imóvel', () => {
    const m = brokerShareMeta({
      profile,
      property: { title: 'Casa no Campeche', type: 'casa', bedrooms: 3, built_area: 180, neighborhood: 'Campeche', city: 'Florianópolis', price: 1250000, purpose: 'venda', cover_image_url: 'https://cdn.x/casa.jpg' },
      origin,
      path: '/corretor/demo/imovel/casa-campeche',
    })
    expect(m.title).toBe('Casa no Campeche · Lucas Andrade')
    expect(m.description).toMatch(/Casa · 3 quartos · 180 m² · Campeche, Florianópolis · R\$\s?1\.250\.000/)
    expect(m.image).toBe('https://cdn.x/casa.jpg')
  })

  it('aluguel mostra /mês e usa a foto da galeria sem capa', () => {
    const m = brokerShareMeta({
      profile,
      property: { title: 'Apto', type: 'apartamento', price: 3500, purpose: 'aluguel', cover_image_url: null },
      coverFromMedia: 'https://cdn.x/1.jpg',
      origin,
      path: '/corretor/demo/imovel/apto',
    })
    expect(m.description).toMatch(/\/mês/)
    expect(m.image).toBe('https://cdn.x/1.jpg')
  })

  it('escreve as metatags escapadas e troca título e descrição', () => {
    const m = brokerShareMeta({ profile: { ...profile, name: 'Ana "<b>"' }, origin, path: '/corretor/ana' })
    const out = injectMeta(html, m)
    expect(out).not.toContain('<b>')
    expect(out).toContain('<title>Ana &quot;&lt;b&gt;&quot; · Corretor')
    expect(out).toContain('property="og:image"')
    expect(out).toContain('name="twitter:card" content="summary_large_image"')
    expect(out).toContain(`<link rel="canonical" href="${origin}/corretor/ana" />`)
    expect(out.match(/name="description"/g)).toHaveLength(1)
    expect(out).not.toContain('Legalize One')
  })
})
