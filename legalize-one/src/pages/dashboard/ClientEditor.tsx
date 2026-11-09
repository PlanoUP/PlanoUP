import { ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import {
  INCOME_LABELS,
  MARITAL_LABELS,
  createClient,
  formatCpf,
  getClient,
  isValidCpf,
  updateClient,
  type ClientInput,
  type IncomeType,
  type MaritalStatus,
} from '@/dashboard/clientsApi'
import { Field, inputClass, Section } from '@/dashboard/FormParts'
import { listBrokers, listProperties, type BrokerOption, type PropertySummary } from '@/dashboard/propertiesApi'
import { useWorkspace } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/cn'
import { formatPhoneBR } from '@/utils/format'

type Form = Record<
  | 'full_name'
  | 'cpf'
  | 'phone'
  | 'email'
  | 'instagram'
  | 'birth_date'
  | 'monthly_income'
  | 'marital_status'
  | 'dependents'
  | 'property_id'
  | 'broker_id'
  | 'appraisal_value'
  | 'financing_value'
  | 'notes',
  string
> & { income_type: IncomeType }
type Errors = Partial<Record<keyof Form, string>>

const digits = (s: string) => s.replace(/\D/g, '')
const money = (n: number | null) => (n === null ? '' : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
/** "R$ 2.500,50" → 2500.5 */
function parseMoney(s: string): number | null | 'invalid' {
  const t = s.replace(/[R$\s.]/g, '').replace(',', '.')
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) && n >= 0 ? n : 'invalid'
}

function toForm(c: ClientInput | null, brokerId: string | null): Form {
  return {
    full_name: c?.full_name ?? '',
    cpf: formatCpf(c?.cpf),
    phone: formatPhoneBR(c?.phone),
    email: c?.email ?? '',
    instagram: c?.instagram ?? '',
    birth_date: c?.birth_date ?? '',
    monthly_income: money(c?.monthly_income ?? null),
    income_type: c?.income_type ?? 'formal',
    marital_status: c?.marital_status ?? '',
    dependents: String(c?.dependents ?? 0),
    property_id: c?.property_id ?? '',
    broker_id: c?.broker_id ?? brokerId ?? '',
    appraisal_value: money(c?.appraisal_value ?? null),
    financing_value: money(c?.financing_value ?? null),
    notes: c?.notes ?? '',
  }
}

function fromForm(f: Form): { input?: ClientInput; errors: Errors } {
  const e: Errors = {}
  const name = f.full_name.trim().replace(/\s+/g, ' ')
  if (name.length < 3 || !name.includes(' ')) e.full_name = 'Informe o nome completo.'
  if (!isValidCpf(f.cpf)) e.cpf = 'CPF inválido. Confira os números.'
  const phone = digits(f.phone)
  if (phone.length < 10 || phone.length > 11) e.phone = 'Telefone com DDD (ex.: (84) 99999-9999).'
  const email = f.email.trim().toLowerCase()
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'E-mail inválido.'
  const income = parseMoney(f.monthly_income)
  if (income === 'invalid') e.monthly_income = 'Valor inválido.'
  const appraisal = parseMoney(f.appraisal_value)
  if (appraisal === 'invalid') e.appraisal_value = 'Valor inválido.'
  const financing = parseMoney(f.financing_value)
  if (financing === 'invalid') e.financing_value = 'Valor inválido.'
  const deps = Number(f.dependents || 0)
  if (!Number.isInteger(deps) || deps < 0 || deps > 20) e.dependents = 'De 0 a 20.'
  if (f.birth_date && (f.birth_date < '1900-01-01' || f.birth_date > new Date().toISOString().slice(0, 10))) e.birth_date = 'Data inválida.'
  if (Object.keys(e).length) return { errors: e }
  return {
    errors: e,
    input: {
      full_name: name,
      cpf: digits(f.cpf),
      phone,
      email: email || null,
      instagram: f.instagram.trim().replace(/^@/, '') || null,
      birth_date: f.birth_date || null,
      monthly_income: income as number | null,
      income_type: f.income_type,
      marital_status: (f.marital_status || null) as MaritalStatus | null,
      dependents: deps,
      property_id: f.property_id || null,
      broker_id: f.broker_id || null,
      appraisal_value: appraisal as number | null,
      financing_value: financing as number | null,
      notes: f.notes.trim() || null,
    },
  }
}

function Editor({
  id,
  initial,
  brokers,
  properties,
}: {
  id: string | null
  initial: ClientInput | null
  brokers: BrokerOption[]
  properties: PropertySummary[]
}) {
  const ws = useWorkspace()
  const navigate = useNavigate()
  const manager = ws.can('leads.view_all')
  const [form, setForm] = useState<Form>(() => toForm(initial, ws.brokerId))
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const set = (k: keyof Form, format?: (v: string) => string) => (e: { target: { value: string } }) => {
    const v = format ? format(e.target.value) : e.target.value
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }
  const input = (k: keyof Form, extra: Record<string, unknown> = {}, format?: (v: string) => string) => ({
    value: form[k],
    onChange: set(k, format),
    className: cn(inputClass, errors[k] && 'border-red-400'),
    'aria-invalid': Boolean(errors[k]),
    ...extra,
  })

  async function submit(e: FormEvent) {
    e.preventDefault()
    const r = fromForm(form)
    if (!r.input) {
      setErrors(r.errors)
      setMsg('Revise os campos destacados.')
      return
    }
    if (!manager && !r.input.broker_id) {
      setMsg('Seu acesso ainda não está ligado a um cadastro de corretor. Fale com o gerente.')
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      if (id) {
        await updateClient(ws.tenantId, id, r.input)
        navigate(`/dashboard/clientes/${id}`)
      } else {
        const newId = await createClient(ws.tenantId, r.input)
        navigate(`/dashboard/clientes/${newId}?novo=1`)
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Não foi possível salvar.')
      setBusy(false)
    }
  }

  const available = properties.filter((p) => p.status === 'published' || p.status === 'draft' || p.id === form.property_id)

  return (
    <form onSubmit={(e) => void submit(e)} noValidate className="space-y-5 pb-32">
      <div>
        <Link to={id ? `/dashboard/clientes/${id}` : '/dashboard/clientes'} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy-800">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {id ? 'Voltar ao cliente' : 'Clientes'}
        </Link>
        <h1 className="mt-2 font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">{id ? 'Editar cliente' : 'Novo cliente'}</h1>
        {!id && (
          <ol className="mt-3 flex items-center gap-3 text-[13px] font-semibold" aria-label="Etapas do cadastro">
            <li className="flex items-center gap-2 text-navy-950">
              <span className="flex size-6 items-center justify-center rounded-full bg-navy-950 text-[12px] text-white">1</span>
              Dados do cliente
            </li>
            <li aria-hidden="true" className="h-px w-8 bg-navy-950/20" />
            <li className="flex items-center gap-2 text-slate">
              <span className="flex size-6 items-center justify-center rounded-full border border-navy-950/20 text-[12px]">2</span>
              Documentos
            </li>
          </ol>
        )}
      </div>

      <Section title="Identificação">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo *" error={errors.full_name} className="sm:col-span-2">
            <input {...input('full_name', { maxLength: 120, autoComplete: 'off', placeholder: 'Como está no documento' })} />
          </Field>
          <Field label="CPF *" error={errors.cpf}>
            <input {...input('cpf', { inputMode: 'numeric', placeholder: '000.000.000-00' }, formatCpf)} />
          </Field>
          <Field label="Telefone / WhatsApp *" error={errors.phone}>
            <input {...input('phone', { inputMode: 'tel', placeholder: '(84) 99999-9999' }, (v) => formatPhoneBR(digits(v).slice(0, 11)) || digits(v))} />
          </Field>
          <Field label="E-mail" error={errors.email}>
            <input {...input('email', { type: 'email', inputMode: 'email', placeholder: 'cliente@email.com' })} />
          </Field>
          <Field label="Data de nascimento" error={errors.birth_date}>
            <input {...input('birth_date', { type: 'date' })} />
          </Field>
          <Field label="Instagram" hint="Opcional.">
            <input {...input('instagram', { maxLength: 60, placeholder: '@usuario' })} />
          </Field>
        </div>
      </Section>

      <Section title="Renda" description="Define quais documentos o sistema vai pedir.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Renda mensal (família)" error={errors.monthly_income}>
            <input {...input('monthly_income', { inputMode: 'decimal', placeholder: 'R$ 0,00' })} />
          </Field>
          <div>
            <p className="text-[14px] font-semibold text-navy-950">Tipo de renda *</p>
            <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-xl bg-sand p-1" role="radiogroup" aria-label="Tipo de renda">
              {(Object.keys(INCOME_LABELS) as IncomeType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={form.income_type === t}
                  onClick={() => setForm((f) => ({ ...f, income_type: t }))}
                  className={cn(
                    'h-10 rounded-lg text-[13.5px] font-semibold',
                    form.income_type === t ? 'bg-white text-navy-950 shadow-card' : 'text-slate hover:text-navy-950',
                  )}
                >
                  {t === 'formal' ? 'Formal' : t === 'informal' ? 'Informal' : 'Misto'}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[12.5px] text-slate">{INCOME_LABELS[form.income_type]}</p>
          </div>
        </div>
      </Section>

      <Section title="Família">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Estado civil">
            <select {...input('marital_status')}>
              <option value="">Selecione</option>
              {(Object.keys(MARITAL_LABELS) as MaritalStatus[]).map((m) => (
                <option key={m} value={m}>
                  {MARITAL_LABELS[m]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Dependentes" error={errors.dependents} hint="Filhos ou outros dependentes no processo.">
            <input {...input('dependents', { type: 'number', min: 0, max: 20, inputMode: 'numeric' })} />
          </Field>
        </div>
      </Section>

      <Section title="Negociação" description="Opcional: preencha conforme o processo avança.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Imóvel de interesse" className="sm:col-span-2">
            <select {...input('property_id')}>
              <option value="">Ainda não definido</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code ? `${p.code} — ` : ''}
                  {p.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Valor de avaliação (laudo)" error={errors.appraisal_value}>
            <input {...input('appraisal_value', { inputMode: 'decimal', placeholder: 'R$ 0,00' })} />
          </Field>
          <Field label="Valor financiado" error={errors.financing_value}>
            <input {...input('financing_value', { inputMode: 'decimal', placeholder: 'R$ 0,00' })} />
          </Field>
          {manager && (
            <Field label="Corretor responsável" hint="O corretor vê só os clientes dele." className="sm:col-span-2">
              <select {...input('broker_id')}>
                <option value="">Sem corretor (só gerentes veem)</option>
                {brokers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Observações" className="sm:col-span-2">
            <textarea {...input('notes', { rows: 3, maxLength: 4000, className: cn(inputClass, 'h-auto py-3') })} />
          </Field>
        </div>
      </Section>

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-navy-950/10 bg-white/95 backdrop-blur lg:bottom-0">
        <div className="mx-auto flex max-w-[1280px] items-center justify-end gap-3 px-4 py-3 sm:px-6">
          {msg && (
            <p role="alert" className="mr-auto text-[14px] font-medium text-red-700">
              {msg}
            </p>
          )}
          <Button type="button" variant="outline" onClick={() => navigate(id ? `/dashboard/clientes/${id}` : '/dashboard/clientes')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : id ? <Save className="size-4" aria-hidden="true" /> : null}
            {id ? 'Salvar' : 'Continuar'}
            {!id && !busy && <ArrowRight className="size-4" aria-hidden="true" />}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default function ClientEditor() {
  const { id = null } = useParams()
  usePageTitle(id ? 'Editar cliente · Painel' : 'Novo cliente · Painel')
  const ws = useWorkspace()
  const manager = ws.can('leads.view_all')
  const { data, error, loading } = useAsyncData(async () => {
    const [client, brokers, properties] = await Promise.all([
      id ? getClient(ws.tenantId, id) : Promise.resolve(null),
      manager ? listBrokers(ws.tenantId) : Promise.resolve([]),
      listProperties(ws.tenantId),
    ])
    return { client, brokers, properties }
  }, `${ws.tenantId}:${id}:${manager}`)

  if (error)
    return (
      <p role="alert" className="rounded-2xl bg-red-50 p-4 text-[15px] text-red-800">
        {error.message}
      </p>
    )
  if (loading || !data) return <div className="h-96 animate-pulse rounded-3xl bg-white/70" aria-busy="true" />
  if (id && !data.client)
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card">
        <p className="text-[15px] text-slate">Cliente não encontrado ou sem permissão.</p>
      </div>
    )
  if (!manager && !ws.brokerId)
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card">
        <p className="text-[15px] text-slate">Seu acesso ainda não está ligado a um cadastro de corretor. Peça ao gerente para vincular.</p>
      </div>
    )
  return <Editor key={id ?? 'new'} id={id} initial={data.client} brokers={data.brokers} properties={data.properties} />
}
