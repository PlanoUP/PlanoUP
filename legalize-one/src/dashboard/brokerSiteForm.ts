import type { BrokerAccent } from '@/broker/types'
import { formatPhoneBR } from '@/utils/format'

/**
 * "Meu site": regras do formulário do perfil público do corretor (sem acesso ao banco, testável).
 * As mesmas regras estão nas restrições da tabela `brokers`; aqui viram mensagens claras.
 */

export const SOCIAL_KEYS = ['facebook', 'linkedin', 'youtube', 'tiktok', 'site'] as const
export type SocialKey = (typeof SOCIAL_KEYS)[number]
export const SOCIAL_LABELS: Record<SocialKey, string> = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  site: 'Outro site',
}

/** Endereços que o sistema usa (espelha `private.is_reserved_slug`, migration 0009). */
export const RESERVED_SLUGS = new Set([
  'entrar', 'dashboard', 'imoveis', 'imovel', 'vender', 'privacidade', 'api', 'assets', 'models', 'corretor',
  'corretores', 'admin', 'painel', 'login', 'impulsigo', 'legalize', 'www', 'app', 'suporte',
])

export interface BrokerSite {
  id: string
  name: string
  professional_title: string | null
  tagline: string | null
  headline: string | null
  bio: string | null
  creci: string | null
  city: string | null
  state: string | null
  years_experience: number | null
  specialties: string[]
  regions: string[]
  languages: string[]
  highlights: string[]
  whatsapp: string | null
  phone: string | null
  email: string | null
  instagram_url: string | null
  photo_url: string | null
  cover_url: string | null
  accent_color: BrokerAccent | null
  profile_slug: string | null
  public_profile: boolean
  /** Só existem depois da migration 0014. */
  social_links?: Partial<Record<SocialKey, string>>
  seo_description?: string | null
}

export type SitePatch = Omit<BrokerSite, 'id'>

export interface SiteForm {
  name: string
  professional_title: string
  tagline: string
  headline: string
  bio: string
  creci: string
  city: string
  state: string
  years_experience: string
  specialties: string
  regions: string
  languages: string
  highlights: string
  whatsapp: string
  phone: string
  email: string
  instagram_url: string
  photo_url: string
  cover_url: string
  accent_color: BrokerAccent | ''
  profile_slug: string
  public_profile: boolean
  social: Record<SocialKey, string>
  seo_description: string
}

export type SiteErrors = Partial<Record<keyof SiteForm | `social.${SocialKey}`, string>>

const LIMITS = { specialties: 12, regions: 12, languages: 8, highlights: 8 } as const
const digits = (s: string) => s.replace(/\D/g, '')

/** "Natal, Parnamirim; Ponta Negra" → ["Natal", "Parnamirim", "Ponta Negra"] (sem repetidos). */
export function splitList(text: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of text.split(/[,;\n]/)) {
    const item = raw.trim().replace(/\s+/g, ' ').slice(0, 60)
    const key = item.toLocaleLowerCase('pt-BR')
    if (item && !seen.has(key)) {
      seen.add(key)
      out.push(item)
    }
  }
  return out
}

/** Nome → endereço da página ("Ana Lúcia Souza" → "ana-lucia-souza"). */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/g, '')
}

export function toSiteForm(s: BrokerSite): SiteForm {
  return {
    name: s.name,
    professional_title: s.professional_title ?? '',
    tagline: s.tagline ?? '',
    headline: s.headline ?? '',
    bio: s.bio ?? '',
    creci: s.creci ?? '',
    city: s.city ?? '',
    state: s.state ?? '',
    years_experience: s.years_experience == null ? '' : String(s.years_experience),
    specialties: s.specialties.join(', '),
    regions: s.regions.join(', '),
    languages: s.languages.join(', '),
    highlights: s.highlights.join('\n'),
    whatsapp: formatPhoneBR(s.whatsapp ?? ''),
    phone: formatPhoneBR(s.phone ?? ''),
    email: s.email ?? '',
    instagram_url: s.instagram_url ?? '',
    photo_url: s.photo_url ?? '',
    cover_url: s.cover_url ?? '',
    accent_color: s.accent_color ?? '',
    profile_slug: s.profile_slug ?? slugify(s.name),
    public_profile: s.public_profile,
    social: Object.fromEntries(SOCIAL_KEYS.map((k) => [k, s.social_links?.[k] ?? ''])) as Record<SocialKey, string>,
    seo_description: s.seo_description ?? '',
  }
}

/**
 * Valida e converte para o banco. `extended` = o banco já tem as colunas da migration 0014
 * (outras redes e descrição para buscadores); sem elas, esses campos não são enviados.
 */
export function fromSiteForm(f: SiteForm, extended: boolean): { patch?: SitePatch; errors: SiteErrors } {
  const e: SiteErrors = {}
  const t = (v: string) => v.trim() || null
  const https = (v: string) => !v.trim() || /^https:\/\/\S+\.\S+/.test(v.trim())

  if (f.name.trim().length < 2) e.name = 'Informe seu nome.'
  const title = f.professional_title.trim()
  if (title && (title.length < 3 || title.length > 40)) e.professional_title = 'Entre 3 e 40 caracteres (ex.: Corretora de imóveis).'
  if (f.tagline.trim().length > 120) e.tagline = 'No máximo 120 caracteres.'
  if (f.headline.trim().length > 140) e.headline = 'No máximo 140 caracteres.'
  if (f.bio.trim().length > 1500) e.bio = 'No máximo 1.500 caracteres.'
  const state = f.state.trim().toUpperCase()
  if (state && !/^[A-Z]{2}$/.test(state)) e.state = 'Sigla com 2 letras (ex.: RN).'
  const years = f.years_experience.trim()
  const yearsNum = years ? Number(years) : null
  if (yearsNum !== null && (!Number.isInteger(yearsNum) || yearsNum < 0 || yearsNum > 70)) e.years_experience = 'Número de anos entre 0 e 70.'

  const lists = {
    specialties: splitList(f.specialties),
    regions: splitList(f.regions),
    languages: splitList(f.languages),
    highlights: splitList(f.highlights),
  }
  for (const k of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
    if (lists[k].length > LIMITS[k]) e[k] = `No máximo ${LIMITS[k]} itens.`
  }

  let wa = digits(f.whatsapp)
  if (wa && (wa.length === 10 || wa.length === 11)) wa = `55${wa}`
  if (wa && (wa.length < 12 || wa.length > 13)) e.whatsapp = 'WhatsApp com DDD (ex.: (84) 99999-9999).'
  const phone = digits(f.phone)
  if (phone && (phone.length < 10 || phone.length > 13)) e.phone = 'Telefone com DDD.'
  const email = f.email.trim().toLowerCase()
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'E-mail inválido.'
  if (!https(f.instagram_url)) e.instagram_url = 'Cole o endereço completo (https://…).'

  const slug = f.profile_slug.trim().toLowerCase()
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length < 3 || slug.length > 48)
    e.profile_slug = 'Use de 3 a 48 letras minúsculas, números e hífens (ex.: ana-souza).'
  else if (RESERVED_SLUGS.has(slug)) e.profile_slug = 'Este endereço é reservado pelo sistema. Escolha outro.'
  if (f.public_profile && !wa) e.whatsapp = 'Para publicar a página, informe o WhatsApp de atendimento.'

  const social: Partial<Record<SocialKey, string>> = {}
  if (extended) {
    for (const k of SOCIAL_KEYS) {
      const v = f.social[k].trim()
      if (!https(v)) e[`social.${k}`] = 'Cole o endereço completo (https://…).'
      else if (v) social[k] = v
    }
    if (f.seo_description.trim().length > 160) e.seo_description = 'No máximo 160 caracteres (o Google corta o resto).'
  }

  if (Object.keys(e).length) return { errors: e }
  const patch: SitePatch = {
    name: f.name.trim(),
    professional_title: title || null,
    tagline: t(f.tagline),
    headline: t(f.headline),
    bio: t(f.bio),
    creci: t(f.creci),
    city: t(f.city),
    state: state || null,
    years_experience: yearsNum,
    ...lists,
    whatsapp: wa || null,
    phone: phone || null,
    email: email || null,
    instagram_url: t(f.instagram_url),
    photo_url: t(f.photo_url),
    cover_url: t(f.cover_url),
    accent_color: f.accent_color || null,
    profile_slug: slug,
    public_profile: f.public_profile,
  }
  if (extended) {
    patch.social_links = social
    patch.seo_description = t(f.seo_description)
  }
  return { errors: e, patch }
}
