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
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
