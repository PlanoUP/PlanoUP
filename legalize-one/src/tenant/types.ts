/**
 * Configuração pública de uma imobiliária (tenant), usada pelo site.
 * Vem do Supabase (função `get_tenant_profile`) ou, sem backend, da marca padrão.
 */
export interface TenantConfig {
  /** UUID no banco; `null` no modo sem backend. */
  id: string | null
  slug: string
  /** Nome comercial exibido (ex.: "Legalize"). */
  name: string
  /** Razão social (rodapé). */
  legalName: string
  tagline: string
  creci: string
  contact: {
    /** Somente dígitos, com DDI (ex.: 5584999999999). */
    whatsapp: string
    whatsappMessage: string
    phoneDisplay: string
    email: string
    address: string
    businessHours: string
  }
  social: {
    instagram: string
    facebook: string
  }
  branding: {
    logoUrl: string
    faviconUrl: string
    /** Cor principal (fundos escuros, botões principais). Hex #rrggbb. */
    primaryColor: string
    /** Cor de destaque (dourado na Legalize). Hex #rrggbb. */
    secondaryColor: string
  }
  source: 'default' | 'backend'
  /** Aberto por `?previa=` (imobiliária sem domínio próprio ainda). */
  preview?: boolean
}

/** Linha retornada por `get_tenant_profile` (view privada `public_tenant_profiles`). */
export interface PublicTenantProfileRow {
  tenant_id: string
  slug: string
  display_name: string
  tagline: string | null
  creci: string | null
  phone: string | null
  whatsapp: string | null
  whatsapp_message: string | null
  email: string | null
  address_line: string | null
  city: string | null
  state: string | null
  logo_url: string | null
  favicon_url: string | null
  primary_color: string | null
  secondary_color: string | null
  instagram_url: string | null
  facebook_url: string | null
  business_hours: string | null
  legal_name?: string | null
}
