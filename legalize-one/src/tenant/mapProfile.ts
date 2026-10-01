import { formatPhoneBR } from '@/utils/format'
import { DEFAULT_PRIMARY, DEFAULT_SECONDARY } from './defaultTenant'
import type { PublicTenantProfileRow, TenantConfig } from './types'

const HEX = /^#[0-9a-f]{6}$/i
const clean = (v: string | null | undefined) => (v ?? '').trim()

/**
 * Converte o perfil público do banco na configuração usada pelo site.
 * Campos vazios ficam vazios (não herdam o contato da Legalize); só as cores
 * caem no padrão, para o layout nunca ficar sem tema.
 */
export function mapTenantProfile(row: PublicTenantProfileRow): TenantConfig {
  const whatsapp = clean(row.whatsapp).replace(/\D/g, '')
  const address = clean(row.address_line) || [clean(row.city), clean(row.state)].filter(Boolean).join(' — ')
  return {
    id: row.tenant_id,
    slug: row.slug,
    name: clean(row.display_name),
    legalName: clean(row.legal_name) || clean(row.display_name),
    tagline: clean(row.tagline),
    creci: clean(row.creci),
    contact: {
      whatsapp,
      whatsappMessage:
        clean(row.whatsapp_message) || `Olá! Vim pelo site da ${clean(row.display_name)} e gostaria de mais informações.`,
      phoneDisplay: formatPhoneBR(row.phone || whatsapp),
      email: clean(row.email),
      address,
      businessHours: clean(row.business_hours),
    },
    social: { instagram: clean(row.instagram_url), facebook: clean(row.facebook_url) },
    branding: {
      logoUrl: clean(row.logo_url),
      faviconUrl: clean(row.favicon_url),
      primaryColor: HEX.test(clean(row.primary_color)) ? clean(row.primary_color).toLowerCase() : DEFAULT_PRIMARY,
      secondaryColor: HEX.test(clean(row.secondary_color)) ? clean(row.secondary_color).toLowerCase() : DEFAULT_SECONDARY,
    },
    source: 'backend',
  }
}
