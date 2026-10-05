/** Paleta curada de cores do corretor (o banco aceita só estes nomes). */
export type BrokerAccent = 'navy' | 'blue' | 'emerald' | 'wine' | 'graphite' | 'gold'

/** Perfil público do corretor (RPC `get_broker_profile`). Campos opcionais vêm nulos/vazios. */
export interface BrokerProfile {
  brokerId: string
  tenantId: string
  slug: string
  isDemo: boolean
  name: string
  creci: string | null
  photoUrl: string | null
  coverUrl: string | null
  logoUrl: string | null
  headline: string | null
  bio: string | null
  city: string | null
  state: string | null
  yearsExperience: number | null
  specialties: string[]
  regions: string[]
  languages: string[]
  highlights: string[]
  whatsapp: string | null
  phone: string | null
  email: string | null
  instagramUrl: string | null
  accentColor: BrokerAccent | null
  /** Conta a que o corretor pertence: autônomo (marca Impulsigo) ou imobiliária (marca dela). */
  account: {
    kind: 'solo' | 'agency'
    slug: string
    name: string
    logoUrl: string | null
    primaryColor: string | null
    secondaryColor: string | null
  }
}

export interface BrokerTestimonial {
  id: string
  author_name: string
  rating: number
  comment: string
  author_photo_url: string | null
  testimonial_date: string | null
  source: 'manual' | 'verified' | 'demo'
}
