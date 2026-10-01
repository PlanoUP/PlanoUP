import type { PropertyInput } from './propertiesApi'

/**
 * Formulário de imóvel: valores como texto (como o usuário digita) ⇄ dados do banco.
 * Números aceitam o formato brasileiro ("1.450.000,50") e o simples ("1450000").
 */

const NUMBER_FIELDS = ['price', 'condo_fee', 'iptu', 'built_area', 'total_area', 'floor', 'bedrooms', 'suites', 'bathrooms', 'parking'] as const
type NumberField = (typeof NUMBER_FIELDS)[number]

export type PropertyFormValues = Omit<PropertyInput, NumberField> & Record<NumberField, string>

export function parseNumberBR(text: string): number | null {
  const t = text.replace(/[R$\s]/g, '').trim()
  if (!t) return null
  let normalized: string
  if (t.includes(',')) normalized = t.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) normalized = t.replace(/\./g, '')
  else normalized = t
  const n = Number(normalized)
  return Number.isFinite(n) ? n : Number.NaN
}

export function formatNumberBR(value: number | null, decimals = 2): string {
  if (value === null || value === undefined) return ''
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: decimals })
}

export function toFormValues(input: PropertyInput): PropertyFormValues {
  const values = { ...input } as unknown as PropertyFormValues
  for (const key of NUMBER_FIELDS) {
    const v = input[key]
    values[key] = v === null ? '' : ['bedrooms', 'suites', 'bathrooms', 'parking', 'floor'].includes(key) ? String(v) : formatNumberBR(v)
  }
  if (input.zip_code?.length === 8) values.zip_code = `${input.zip_code.slice(0, 5)}-${input.zip_code.slice(5)}`
  return values
}

const blank = (s: string | null) => {
  const t = (s ?? '').trim()
  return t ? t : null
}

export interface FormResult {
  input?: PropertyInput
  errors: Partial<Record<keyof PropertyFormValues, string>>
}

/** Valida e converte. As mesmas regras existem no banco; aqui viram mensagens claras. */
export function fromFormValues(values: PropertyFormValues): FormResult {
  const errors: FormResult['errors'] = {}
  const nums = {} as Record<NumberField, number | null>
  for (const key of NUMBER_FIELDS) {
    const n = parseNumberBR(values[key])
    if (Number.isNaN(n) || (n !== null && n < 0 && key !== 'floor')) errors[key] = 'Número inválido.'
    nums[key] = Number.isNaN(n) ? null : n
  }
  for (const key of ['bedrooms', 'suites', 'bathrooms', 'parking'] as const) {
    const n = nums[key]
    if (n !== null && (!Number.isInteger(n) || n > 99)) errors[key] = 'Use um número inteiro de 0 a 99.'
  }
  if (nums.floor !== null && (!Number.isInteger(nums.floor) || nums.floor < -5 || nums.floor > 200)) errors.floor = 'Andar inválido.'

  const title = values.title.trim()
  if (title.length < 3) errors.title = 'Informe um título com pelo menos 3 letras.'
  if (title.length > 140) errors.title = 'Título muito longo (máx. 140).'
  const zip = (values.zip_code ?? '').replace(/\D/g, '')
  if (zip && zip.length !== 8) errors.zip_code = 'CEP deve ter 8 números.'
  const state = (values.state ?? '').trim().toUpperCase()
  if (state && !/^[A-Z]{2}$/.test(state)) errors.state = 'Use a sigla (ex.: RN).'
  if ((values.description ?? '').length > 8000) errors.description = 'Descrição muito longa (máx. 8.000 caracteres).'

  if (Object.keys(errors).length) return { errors }
  return {
    errors,
    input: {
      ...values,
      ...nums,
      bedrooms: nums.bedrooms ?? 0,
      suites: nums.suites ?? 0,
      bathrooms: nums.bathrooms ?? 0,
      parking: nums.parking ?? 0,
      title,
      code: blank(values.code),
      description: blank(values.description),
      zip_code: zip || null,
      street: blank(values.street),
      street_number: blank(values.street_number),
      complement: blank(values.complement),
      neighborhood: blank(values.neighborhood),
      city: blank(values.city),
      state: state || null,
      amenities: values.amenities.map((a) => a.trim()).filter(Boolean),
    },
  }
}
