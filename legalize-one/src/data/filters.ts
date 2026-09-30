import type { PriceRange, SelectOption, SortOption } from '@/types/filters'
import type { PropertyPurpose, PropertyType } from '@/types/property'

export const propertyTypeOptions: SelectOption<PropertyType | ''>[] = [
  { value: '', label: 'Todos' },
  { value: 'casa', label: 'Casa' },
  { value: 'casa-condominio', label: 'Casa em condomínio' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'cobertura', label: 'Cobertura' },
]

export const propertyTypeLabels: Record<PropertyType, string> = {
  casa: 'Casa',
  'casa-condominio': 'Casa em condomínio',
  apartamento: 'Apartamento',
  cobertura: 'Cobertura',
  terreno: 'Terreno',
}

export const priceRanges: Record<PropertyPurpose, PriceRange[]> = {
  venda: [
    { id: '', label: 'Todos' },
    { id: 'ate-500k', label: 'Até R$ 500 mil', max: 500_000 },
    { id: '500k-800k', label: 'R$ 500 mil a R$ 800 mil', min: 500_000, max: 800_000 },
    { id: '800k-1200k', label: 'R$ 800 mil a R$ 1,2 mi', min: 800_000, max: 1_200_000 },
    { id: 'acima-1200k', label: 'Acima de R$ 1,2 mi', min: 1_200_000 },
  ],
  aluguel: [
    { id: '', label: 'Todos' },
    { id: 'ate-2500', label: 'Até R$ 2.500', max: 2_500 },
    { id: '2500-5000', label: 'R$ 2.500 a R$ 5.000', min: 2_500, max: 5_000 },
    { id: 'acima-5000', label: 'Acima de R$ 5.000', min: 5_000 },
  ],
}

export const bedroomOptions: SelectOption[] = [
  { value: '0', label: 'Todos' },
  { value: '1', label: '1+ quarto' },
  { value: '2', label: '2+ quartos' },
  { value: '3', label: '3+ quartos' },
  { value: '4', label: '4+ quartos' },
]

export const sortOptions: SelectOption<SortOption>[] = [
  { value: 'relevancia', label: 'Mais relevantes' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
  { value: 'maior-area', label: 'Maior área' },
]
