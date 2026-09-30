/**
 * Configuração central da marca e das integrações.
 * Valores sensíveis/variáveis vêm de variáveis de ambiente (ver .env.example).
 */
export const site = {
  name: 'Legalize One',
  company: 'Legalize Soluções Imobiliárias',
  tagline: 'Do documento à chave.',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '5584999999999',
  whatsappDefaultMessage: 'Olá! Vim pelo site da Legalize e gostaria de falar com um especialista.',
  email: 'contato@legalizeimoveis.com.br',
  phoneDisplay: '(84) 99999-9999',
  address: 'Parnamirim · Natal — RN',
  creci: 'CRECI-RN 0000-J',
} as const

export const integrations = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL ?? '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
    /** Bucket público das fotos dos imóveis (ver lib/images.ts). */
    storageBucket: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'imoveis',
  },
  metaPixelId: import.meta.env.VITE_META_PIXEL_ID ?? '',
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID ?? '',
} as const

export interface NavItem {
  label: string
  to: string
}

export const mainNav: NavItem[] = [
  { label: 'Início', to: '/' },
  { label: 'Imóveis', to: '/imoveis' },
  { label: 'Comprar', to: '/imoveis?finalidade=venda' },
  { label: 'Vender', to: '/vender' },
  { label: 'Sobre', to: '/#sobre' },
  { label: 'Contato', to: '/#contato' },
]
