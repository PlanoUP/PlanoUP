import { requireSupabase } from '@/lib/supabase'

/**
 * Imóveis no painel. Lê e grava direto nas tabelas: quem pode ver/alterar o quê é decidido
 * pelas políticas do banco (RLS) — esta camada só traduz dados e mensagens de erro.
 */

export type PropertyStatus = 'draft' | 'published' | 'sold' | 'rented' | 'archived'
export type PropertyKind =
  | 'casa'
  | 'casa-condominio'
  | 'apartamento'
  | 'cobertura'
  | 'terreno'
  | 'sala-comercial'
  | 'loja'
  | 'galpao'
  | 'rural'
export type PropertyPurposeDb = 'venda' | 'aluguel' | 'temporada'

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  sold: 'Vendido',
  rented: 'Alugado',
  archived: 'Arquivado',
}

export const TYPE_LABELS: Record<PropertyKind, string> = {
  casa: 'Casa',
  'casa-condominio': 'Casa em condomínio',
  apartamento: 'Apartamento',
  cobertura: 'Cobertura',
  terreno: 'Terreno',
  'sala-comercial': 'Sala comercial',
  loja: 'Loja',
  galpao: 'Galpão',
  rural: 'Rural',
}

export const PURPOSE_LABELS: Record<PropertyPurposeDb, string> = {
  venda: 'Venda',
  aluguel: 'Aluguel',
  temporada: 'Temporada',
}

/** Campos editáveis no formulário. */
export interface PropertyInput {
  code: string | null
  title: string
  type: PropertyKind
  purpose: PropertyPurposeDb
  status: PropertyStatus
  price: number | null
  condo_fee: number | null
  iptu: number | null
  description: string | null
  zip_code: string | null
  street: string | null
  street_number: string | null
  complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  hide_exact_address: boolean
  bedrooms: number
  suites: number
  bathrooms: number
  parking: number
  built_area: number | null
  total_area: number | null
  floor: number | null
  furnished: boolean
  amenities: string[]
  featured: boolean
  documentation_verified: boolean
  broker_id: string | null
}

export interface PropertyRecord extends PropertyInput {
  id: string
  tenant_id: string
  slug: string
  cover_image_url: string | null
  has3d: boolean
  hasTour: boolean
  published_at: string | null
  updated_at: string
}

export interface PropertySummary {
  id: string
  code: string | null
  title: string
  slug: string
  type: PropertyKind
  purpose: PropertyPurposeDb
  status: PropertyStatus
  price: number | null
  neighborhood: string | null
  city: string | null
  cover_image_url: string | null
  broker_id: string | null
  updated_at: string
}

export interface BrokerOption {
  id: string
  name: string
  userId: string | null
}

export const EMPTY_PROPERTY: PropertyInput = {
  code: null,
  title: '',
  type: 'casa',
  purpose: 'venda',
  status: 'draft',
  price: null,
  condo_fee: null,
  iptu: null,
  description: null,
  zip_code: null,
  street: null,
  street_number: null,
  complement: null,
  neighborhood: null,
  city: null,
  state: null,
  hide_exact_address: true,
  bedrooms: 0,
  suites: 0,
  bathrooms: 0,
  parking: 0,
  built_area: null,
  total_area: null,
  floor: null,
  furnished: false,
  amenities: [],
  featured: false,
  documentation_verified: false,
  broker_id: null,
}

const INPUT_COLUMNS = Object.keys(EMPTY_PROPERTY) as (keyof PropertyInput)[]
const SUMMARY_COLUMNS =
  'id, code, title, slug, type, purpose, status, price, neighborhood, city, cover_image_url, broker_id, updated_at'

const toNumber = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v))

/** Erros do banco em linguagem simples. */
export function friendlyDbError(error: { code?: string; message?: string } | null | undefined): string {
  const message = error?.message ?? ''
  if (/plan_limit_reached:max_properties/.test(message))
    return 'Seu plano atingiu o limite de imóveis ativos. Arquive um imóvel ou fale conosco para ampliar o plano.'
  if (/plan_feature_unavailable/.test(message)) return 'Este recurso não está incluído no seu plano.'
  if (/brokers cannot change/.test(message) || error?.code === '42501' || /row-level security/.test(message))
    return 'Você não tem permissão para esta alteração. Fale com o gerente da imobiliária.'
  if (error?.code === '23505' && /code/.test(message)) return 'Já existe um imóvel com este código.'
  if (error?.code === '23514') return 'Algum campo está fora do formato esperado. Revise os dados e tente de novo.'
  // Falha de rede de verdade não traz código do banco; com código, mostramos para o suporte identificar.
  if (!error?.code) return 'Não foi possível salvar agora. Verifique sua conexão e tente novamente.'
  return `Não foi possível salvar (código ${error.code}). Tente de novo; se continuar, avise o suporte.`
}

export class PanelError extends Error {}

function fail(error: { code?: string; message?: string }): never {
  throw new PanelError(friendlyDbError(error))
}

function pickInput(row: Record<string, unknown>): PropertyInput {
  const input = { ...EMPTY_PROPERTY }
  for (const key of INPUT_COLUMNS) {
    if (row[key] !== undefined) (input as Record<string, unknown>)[key] = row[key]
  }
  for (const key of ['price', 'condo_fee', 'iptu', 'built_area', 'total_area'] as const) input[key] = toNumber(row[key])
  input.amenities = (row.amenities as string[] | null) ?? []
  return input
}

export async function listProperties(tenantId: string): Promise<PropertySummary[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from('properties')
    .select(SUMMARY_COLUMNS)
    .eq('tenant_id', tenantId)
    .order('updated_at', { ascending: false })
  if (error) fail(error)
  return (data ?? []).map((r) => ({ ...r, price: toNumber(r.price) }) as PropertySummary)
}

export async function getProperty(tenantId: string, id: string): Promise<PropertyRecord | null> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from('properties')
    .select(`id, tenant_id, slug, cover_image_url, published_at, updated_at, model3d, virtual_tour, ${INPUT_COLUMNS.join(', ')}`)
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .maybeSingle()
  if (error) fail(error)
  if (!data) return null
  const row = data as unknown as Record<string, unknown>
  const model3d = row.model3d as { enabled?: boolean } | null
  return {
    ...pickInput(row),
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    slug: row.slug as string,
    cover_image_url: (row.cover_image_url as string | null) ?? null,
    has3d: Boolean(model3d?.enabled),
    hasTour: Boolean(row.virtual_tour),
    published_at: (row.published_at as string | null) ?? null,
    updated_at: row.updated_at as string,
  }
}

/**
 * Envia ao banco só as colunas editáveis do formulário. O registro carregado traz campos de exibição
 * (has3d, hasTour, capa, datas…) que não podem ir no insert/update: o banco recusaria colunas
 * inexistentes, e a capa antiga desfaria a troca feita na seção de fotos.
 */
export function onlyInputColumns(input: PropertyInput): Record<string, unknown> {
  const source = input as unknown as Record<string, unknown>
  return Object.fromEntries(INPUT_COLUMNS.map((key) => [key, source[key]]))
}

/** Corretor: só os campos que ele pode alterar (o banco recusaria os demais). */
const MANAGER_ONLY: (keyof PropertyInput)[] = ['status', 'featured', 'documentation_verified', 'broker_id']

export async function createProperty(
  tenantId: string,
  input: PropertyInput,
  opts: { asBroker: string | null; userId: string | null },
): Promise<string> {
  const supabase = await requireSupabase()
  const payload: Record<string, unknown> = { ...onlyInputColumns(input), tenant_id: tenantId, created_by: opts.userId }
  if (opts.asBroker) {
    Object.assign(payload, { status: 'draft', featured: false, documentation_verified: false, broker_id: opts.asBroker })
  }
  const { data, error } = await supabase.from('properties').insert(payload).select('id').single()
  if (error) fail(error)
  return data.id as string
}

export async function updateProperty(
  tenantId: string,
  id: string,
  input: PropertyInput,
  opts: { asBroker: boolean },
): Promise<void> {
  const supabase = await requireSupabase()
  const payload: Record<string, unknown> = onlyInputColumns(input)
  if (opts.asBroker) for (const key of MANAGER_ONLY) delete payload[key]
  const { data, error } = await supabase.from('properties').update(payload).eq('tenant_id', tenantId).eq('id', id).select('id')
  if (error) fail(error)
  if (!data?.length) throw new PanelError('Você não tem permissão para editar este imóvel.')
}

export async function setPropertyStatus(tenantId: string, id: string, status: PropertyStatus): Promise<void> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('properties').update({ status }).eq('tenant_id', tenantId).eq('id', id).select('id')
  if (error) fail(error)
  if (!data?.length) throw new PanelError('Você não tem permissão para alterar este imóvel.')
}

export async function deleteProperty(tenantId: string, id: string, storagePaths: string[]): Promise<void> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('properties').delete().eq('tenant_id', tenantId).eq('id', id).select('id')
  if (error) fail(error)
  if (!data?.length) throw new PanelError('Você não tem permissão para excluir este imóvel.')
  if (storagePaths.length) await supabase.storage.from('property-media').remove(storagePaths)
}

export async function listBrokers(tenantId: string): Promise<BrokerOption[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from('brokers')
    .select('id, name, user_id')
    .eq('tenant_id', tenantId)
    .eq('active', true)
    .order('name')
  if (error) fail(error)
  return (data ?? []).map((b) => ({ id: b.id as string, name: b.name as string, userId: (b.user_id as string | null) ?? null }))
}
