import { DEFAULT_SECONDARY } from '@/tenant/defaultTenant'
import type { TenantConfig } from '@/tenant/types'
import { formatPhoneBR } from '@/utils/format'
import type { BrokerAccent, BrokerProfile } from './types'

/** `/corretor/joao-silva/...` → "joao-silva". */
export function brokerSlugFromPath(pathname: string = window.location.pathname): string | null {
  const match = pathname.match(/^\/corretor\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/|$)/i)
  return match ? match[1].toLowerCase() : null
}

/** Paleta curada: tons escuros e sóbrios, sempre legíveis com texto branco. */
export const ACCENT_COLORS: Record<BrokerAccent, { label: string; hex: string }> = {
  navy: { label: 'Azul-marinho', hex: '#071b2e' },
  blue: { label: 'Azul', hex: '#1e3a8a' },
  emerald: { label: 'Verde', hex: '#064e3b' },
  wine: { label: 'Vinho', hex: '#5b1323' },
  graphite: { label: 'Grafite', hex: '#1f2937' },
  gold: { label: 'Bronze', hex: '#5c3d12' },
}

const HEX = /^#[0-9a-f]{6}$/i
const firstName = (name: string) => name.trim().split(/\s+/)[0]

/**
 * A página do corretor reaproveita todo o site público (imóveis, página do imóvel, contato, estatísticas)
 * trocando apenas "quem o site representa": a conta do corretor, com o contato dele.
 */
export function brokerTenant(profile: BrokerProfile): TenantConfig {
  const accent = profile.accentColor ? ACCENT_COLORS[profile.accentColor].hex : null
  const agencyColor = profile.account.kind === 'agency' && HEX.test(profile.account.primaryColor ?? '') ? profile.account.primaryColor : null
  const whatsapp = (profile.whatsapp ?? '').replace(/\D/g, '')
  return {
    id: profile.tenantId,
    slug: profile.account.slug,
    name: profile.name,
    legalName: profile.account.kind === 'solo' ? profile.name : profile.account.name,
    tagline: profile.headline ?? '',
    creci: profile.creci ?? '',
    contact: {
      whatsapp,
      whatsappMessage: `Olá, ${firstName(profile.name)}! Vi seu perfil e gostaria de conversar sobre imóveis.`,
      phoneDisplay: formatPhoneBR(profile.phone || whatsapp),
      email: profile.email ?? '',
      address: [profile.city, profile.state].filter(Boolean).join(' — '),
      businessHours: '',
    },
    social: { instagram: profile.instagramUrl ?? '', facebook: '' },
    branding: {
      logoUrl: profile.logoUrl ?? '',
      faviconUrl: '',
      primaryColor: (accent ?? agencyColor ?? ACCENT_COLORS.navy.hex).toLowerCase(),
      secondaryColor: DEFAULT_SECONDARY,
    },
    source: 'backend',
    broker: profile,
  }
}
