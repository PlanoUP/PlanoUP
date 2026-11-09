import { requireSupabase } from '@/lib/supabase'
import { PanelError, friendlyDbError } from './propertiesApi'

/**
 * Clientes em processo de compra/financiamento. Quem vê o quê: políticas do banco (RLS) —
 * gerente vê todos; corretor só os dele. Documentos ficam num bucket privado (link temporário).
 */

export type ClientStage = 'docs_pending' | 'in_review' | 'approved' | 'rejected' | 'withdrawn'
export type IncomeType = 'formal' | 'informal' | 'mixed'
export type MaritalStatus = 'single' | 'married' | 'stable_union' | 'divorced' | 'widowed'
export type DocStatus = 'received' | 'accepted' | 'rejected'

export const STAGE_ORDER: ClientStage[] = ['docs_pending', 'in_review', 'approved', 'rejected', 'withdrawn']

export const STAGE_LABELS: Record<ClientStage, string> = {
  docs_pending: 'Pendência de documentos',
  in_review: 'Em análise',
  approved: 'Aprovado',
  rejected: 'Recusado',
  withdrawn: 'Desistiu',
}

export const STAGE_HINTS: Record<ClientStage, string> = {
  docs_pending: 'Aguardando o cliente enviar documentos',
  in_review: 'Documentação completa, em análise',
  approved: 'Crédito aprovado',
  rejected: 'Não aprovado na análise',
  withdrawn: 'Cliente desistiu do processo',
}

export const INCOME_LABELS: Record<IncomeType, string> = { formal: 'Formal (carteira assinada)', informal: 'Informal (autônomo)', mixed: 'Formal + informal' }

export const MARITAL_LABELS: Record<MaritalStatus, string> = {
  single: 'Solteiro(a)',
  married: 'Casado(a)',
  stable_union: 'União estável',
  divorced: 'Divorciado(a)',
  widowed: 'Viúvo(a)',
}

// ---------------------------------------------------------------------------
// Documentos: lista exigida conforme renda e família (o corretor vê o que falta, sem decorar).
// ---------------------------------------------------------------------------
export interface DocKind {
  key: string
  label: string
  hint: string
}

export const DOC_KINDS: Record<string, DocKind> = {
  identidade: { key: 'identidade', label: 'RG ou CNH', hint: 'Frente e verso, legível.' },
  residencia: { key: 'residencia', label: 'Comprovante de residência', hint: 'Conta de água, luz ou telefone dos últimos 90 dias.' },
  estado_civil: { key: 'estado_civil', label: 'Certidão de nascimento ou casamento', hint: 'Conforme o estado civil atual.' },
  contracheque: { key: 'contracheque', label: 'Contracheques', hint: 'Os 3 últimos.' },
  carteira_trabalho: { key: 'carteira_trabalho', label: 'Carteira de trabalho', hint: 'Digital ou páginas de identificação e contrato.' },
  fgts: { key: 'fgts', label: 'Extrato do FGTS', hint: 'Pode ser baixado no app FGTS.' },
  extrato_bancario: { key: 'extrato_bancario', label: 'Extratos bancários', hint: 'Últimos 6 meses, mostrando a movimentação da renda.' },
  declaracao_renda: { key: 'declaracao_renda', label: 'Declaração de renda informal', hint: 'Atividade exercida e valor médio mensal.' },
  imposto_renda: { key: 'imposto_renda', label: 'Declaração do Imposto de Renda', hint: 'Se declarar, com recibo de entrega.' },
  conjuge: { key: 'conjuge', label: 'Documentos do cônjuge', hint: 'RG/CNH, CPF e comprovante de renda do cônjuge.' },
  dependentes: { key: 'dependentes', label: 'Documentos dos dependentes', hint: 'Certidão de nascimento ou RG de cada dependente.' },
  outro: { key: 'outro', label: 'Outro documento', hint: 'Qualquer arquivo complementar.' },
}

export function requiredDocs(c: Pick<ClientInput, 'income_type' | 'marital_status' | 'dependents'>): DocKind[] {
  const keys = ['identidade', 'residencia', 'estado_civil']
  if (c.income_type === 'formal' || c.income_type === 'mixed') keys.push('contracheque', 'carteira_trabalho', 'fgts')
  if (c.income_type === 'informal' || c.income_type === 'mixed') keys.push('extrato_bancario', 'declaracao_renda')
  if (c.marital_status === 'married' || c.marital_status === 'stable_union') keys.push('conjuge')
  if (c.dependents > 0) keys.push('dependentes')
  return keys.map((k) => DOC_KINDS[k])
}

/** Situação da documentação: o que já chegou e o que falta (recusados contam como faltando). */
export function docProgress(client: Pick<ClientInput, 'income_type' | 'marital_status' | 'dependents'>, docs: Pick<ClientDocument, 'kind' | 'status'>[]) {
  const required = requiredDocs(client)
  const ok = new Set(docs.filter((d) => d.status !== 'rejected').map((d) => d.kind))
  const missing = required.filter((k) => !ok.has(k.key))
  return { required, missing, done: required.length - missing.length, total: required.length }
}

/** Mensagem pronta para o WhatsApp do cliente com a lista do que falta. */
export function missingDocsMessage(firstName: string, missing: DocKind[], brokerName?: string | null): string {
  if (!missing.length) return `Olá, ${firstName}! Recebemos todos os seus documentos. Agora seguimos com a análise e te aviso de cada passo.`
  const items = missing.map((d) => `• ${d.label}${d.hint ? ` (${d.hint})` : ''}`).join('\n')
  return `Olá, ${firstName}!${brokerName ? ` Aqui é ${brokerName}.` : ''} Para seguirmos com o seu processo, ainda faltam:\n\n${items}\n\nPode me enviar por aqui mesmo (foto legível ou PDF). Qualquer dúvida, estou à disposição!`
}

// ---------------------------------------------------------------------------
// CPF
// ---------------------------------------------------------------------------
export function isValidCpf(value: string): boolean {
  const p = value.replace(/\D/g, '')
  if (!/^\d{11}$/.test(p) || /^(\d)\1{10}$/.test(p)) return false
  for (const k of [9, 10]) {
    let s = 0
    for (let i = 0; i < k; i++) s += Number(p[i]) * (k + 1 - i)
    const d = ((s * 10) % 11) % 10
    if (d !== Number(p[k])) return false
  }
  return true
}

export function formatCpf(value: string | null | undefined): string {
  const d = (value ?? '').replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

/** CPF parcialmente oculto para listas: "529.***.***-25". */
export function maskCpf(value: string): string {
  const f = formatCpf(value)
  return f.length === 14 ? `${f.slice(0, 3)}.***.***-${f.slice(12)}` : f
}

// ---------------------------------------------------------------------------
// Dados
// ---------------------------------------------------------------------------
export interface ClientInput {
  full_name: string
  cpf: string
  phone: string
  email: string | null
  instagram: string | null
  birth_date: string | null
  monthly_income: number | null
  income_type: IncomeType
  marital_status: MaritalStatus | null
  dependents: number
  property_id: string | null
  broker_id: string | null
  appraisal_value: number | null
  financing_value: number | null
  notes: string | null
}

export interface Client extends ClientInput {
  id: string
  tenant_id: string
  stage: ClientStage
  stage_changed_at: string
  created_at: string
  updated_at: string
}

export interface ClientDocument {
  id: string
  client_id: string
  kind: string
  storage_path: string
  file_name: string
  content_type: string | null
  size_bytes: number | null
  status: DocStatus
  created_at: string
}

export interface ClientEvent {
  id: number
  kind: 'created' | 'stage' | 'document_added' | 'document_removed' | 'document_status' | 'note'
  detail: Record<string, string>
  actor_id: string | null
  created_at: string
}

const COLUMNS =
  'id, tenant_id, broker_id, property_id, full_name, cpf, phone, email, instagram, birth_date, monthly_income, income_type, marital_status, dependents, appraisal_value, financing_value, stage, stage_changed_at, notes, created_at, updated_at'
const DOC_COLUMNS = 'id, client_id, kind, storage_path, file_name, content_type, size_bytes, status, created_at'
const BUCKET = 'client-documents'

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v))
const toClient = (r: Record<string, unknown>) =>
  ({ ...r, monthly_income: num(r.monthly_income), appraisal_value: num(r.appraisal_value), financing_value: num(r.financing_value) }) as Client

function fail(error: { code?: string; message?: string }): never {
  const m = error.message ?? ''
  if (error.code === '23505' && /cpf/.test(m)) throw new PanelError('Já existe um cliente com este CPF na imobiliária.')
  if (/reassign/.test(m)) throw new PanelError('Só o gerente pode passar o cliente para outro corretor.')
  if (/cpf_check|valid_cpf/.test(m)) throw new PanelError('CPF inválido. Confira os números.')
  throw new PanelError(friendlyDbError(error))
}

export async function listClients(tenantId: string): Promise<Client[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('clients').select(COLUMNS).eq('tenant_id', tenantId).order('updated_at', { ascending: false }).limit(2000)
  if (error) fail(error)
  return (data ?? []).map(toClient)
}

export async function getClient(tenantId: string, id: string): Promise<Client | null> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('clients').select(COLUMNS).eq('tenant_id', tenantId).eq('id', id).maybeSingle()
  if (error) fail(error)
  return data ? toClient(data) : null
}

export async function createClient(tenantId: string, input: ClientInput): Promise<string> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('clients').insert({ ...input, tenant_id: tenantId }).select('id').single()
  if (error) fail(error)
  return data.id as string
}

export async function updateClient(tenantId: string, id: string, patch: Partial<ClientInput> & { stage?: ClientStage }): Promise<Client> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('clients').update(patch).eq('tenant_id', tenantId).eq('id', id).select(COLUMNS)
  if (error) fail(error)
  if (!data?.length) throw new PanelError('Você não tem permissão para alterar este cliente.')
  return toClient(data[0])
}

export async function deleteClient(tenantId: string, id: string, paths: string[]): Promise<void> {
  const supabase = await requireSupabase()
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths)
  const { data, error } = await supabase.from('clients').delete().eq('tenant_id', tenantId).eq('id', id).select('id')
  if (error) fail(error)
  if (!data?.length) throw new PanelError('Só o gerente pode excluir clientes.')
}

export async function listDocuments(clientId: string): Promise<ClientDocument[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('client_documents').select(DOC_COLUMNS).eq('client_id', clientId).order('created_at')
  if (error) fail(error)
  return (data ?? []) as ClientDocument[]
}

/** Documentos de vários clientes de uma vez (para o progresso na lista). */
export async function listDocumentKinds(tenantId: string): Promise<Pick<ClientDocument, 'client_id' | 'kind' | 'status'>[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('client_documents').select('client_id, kind, status').eq('tenant_id', tenantId).limit(10000)
  if (error) fail(error)
  return (data ?? []) as Pick<ClientDocument, 'client_id' | 'kind' | 'status'>[]
}

const ACCEPTED: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
}
export const DOC_ACCEPT = Object.keys(ACCEPTED).join(',')
export const MAX_DOC_BYTES = 25 * 1024 * 1024

export async function uploadDocument(tenantId: string, clientId: string, kind: string, file: File): Promise<ClientDocument> {
  const ext = ACCEPTED[file.type]
  if (!ext) throw new PanelError('Envie em PDF ou foto (JPG, PNG, WebP ou HEIC).')
  if (file.size > MAX_DOC_BYTES) throw new PanelError('Arquivo muito grande: o limite é 25 MB.')
  const supabase = await requireSupabase()
  const path = `${tenantId}/${clientId}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type })
  if (up.error) throw new PanelError('Não foi possível enviar o arquivo. Tente novamente.')
  const { data, error } = await supabase
    .from('client_documents')
    .insert({ tenant_id: tenantId, client_id: clientId, kind, storage_path: path, file_name: file.name.slice(0, 200), content_type: file.type, size_bytes: file.size })
    .select(DOC_COLUMNS)
    .single()
  if (error) {
    await supabase.storage.from(BUCKET).remove([path])
    fail(error)
  }
  return data as ClientDocument
}

export async function setDocumentStatus(id: string, status: DocStatus): Promise<void> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('client_documents').update({ status }).eq('id', id).select('id')
  if (error) fail(error)
  if (!data?.length) throw new PanelError('Só o gerente aprova ou recusa documentos.')
}

export async function removeDocument(doc: ClientDocument): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.from('client_documents').delete().eq('id', doc.id)
  if (error) fail(error)
  await supabase.storage.from(BUCKET).remove([doc.storage_path])
}

/** Link temporário (5 minutos) para abrir o arquivo privado. */
export async function documentUrl(doc: ClientDocument): Promise<string> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.storage_path, 300)
  if (error || !data) throw new PanelError('Não foi possível abrir o arquivo.')
  return data.signedUrl
}

export async function listEvents(clientId: string): Promise<ClientEvent[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('client_events').select('id, kind, detail, actor_id, created_at').eq('client_id', clientId).order('id', { ascending: false }).limit(100)
  if (error) fail(error)
  return (data ?? []) as ClientEvent[]
}

export function eventLabel(e: ClientEvent): string {
  const doc = (k?: string) => (k && DOC_KINDS[k]?.label) || 'Documento'
  switch (e.kind) {
    case 'created':
      return 'Cliente cadastrado'
    case 'stage':
      return `Etapa: ${STAGE_LABELS[e.detail.from as ClientStage] ?? e.detail.from} → ${STAGE_LABELS[e.detail.to as ClientStage] ?? e.detail.to}`
    case 'document_added':
      return `${doc(e.detail.kind)} enviado`
    case 'document_removed':
      return `${doc(e.detail.kind)} removido`
    case 'document_status':
      return `${doc(e.detail.kind)} ${e.detail.status === 'accepted' ? 'aprovado' : e.detail.status === 'rejected' ? 'recusado' : 'reaberto'}`
    default:
      return 'Anotação'
  }
}

export function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
}
