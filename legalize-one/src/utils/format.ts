import type { Property } from '@/types/property'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

export function formatPrice(value: number): string {
  // Intl insere um espaço não separável após "R$"; normalizamos para espaço comum.
  return currency.format(value).replace(/ /g, ' ')
}

export function formatPropertyPrice(property: Pick<Property, 'price' | 'purpose'>): string {
  const base = formatPrice(property.price)
  return property.purpose === 'aluguel' ? `${base}/mês` : base
}

export function formatLocation(location: Property['location']): string {
  return `${location.neighborhood} – ${location.city}/${location.state}`
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/** Remove acentos e normaliza para comparação de texto. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function bedroomLabel({ bedrooms, suites }: Pick<Property, 'bedrooms' | 'suites'>): string {
  return suites > 0 && suites === bedrooms ? pluralize(suites, 'suíte', 'suítes') : pluralize(bedrooms, 'quarto', 'quartos')
}

/** Telefone brasileiro para exibição: "84999999999" ou "5584999999999" → "(84) 99999-9999". */
export function formatPhoneBR(digits: string | null | undefined): string {
  const d = (digits ?? '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return d
}
