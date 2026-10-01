import { integrations, site } from '@/config/site'
import type { TenantConfig } from './types'

/** Cores da marca definidas em index.css (@theme). O tema só é sobrescrito quando o tenant usa outras. */
export const DEFAULT_PRIMARY = '#071b2e'
export const DEFAULT_SECONDARY = '#d9b47a'

/**
 * Imobiliária padrão = a Legalize, com os valores atuais do site.
 * É o que o site exibe sem backend (comportamento da V1) e o fallback de campos vazios.
 */
export const defaultTenant: TenantConfig = {
  id: null,
  slug: integrations.defaultTenantSlug,
  name: 'Legalize',
  legalName: site.company,
  tagline: site.tagline,
  creci: site.creci,
  contact: {
    whatsapp: site.whatsappNumber.replace(/\D/g, ''),
    whatsappMessage: site.whatsappDefaultMessage,
    phoneDisplay: site.phoneDisplay,
    email: site.email,
    address: site.address,
    businessHours: 'Seg. a sáb., 8h às 18h',
  },
  social: { instagram: '', facebook: '' },
  branding: { logoUrl: '', faviconUrl: '', primaryColor: DEFAULT_PRIMARY, secondaryColor: DEFAULT_SECONDARY },
  source: 'default',
}

/** A marca padrão (Legalize) mantém logo SVG e textos institucionais próprios. */
export function isDefaultBrand(tenant: { slug: string }): boolean {
  return tenant.slug === defaultTenant.slug
}
