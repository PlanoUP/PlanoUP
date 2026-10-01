import { ArrowLeft, Box, ExternalLink, Info, Loader2, Plus, Save, Trash2, X } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { PhotoManager } from '@/dashboard/PhotoManager'
import { StatusBadge } from '@/dashboard/StatusBadge'
import { listPhotos } from '@/dashboard/mediaApi'
import {
  createProperty,
  deleteProperty,
  EMPTY_PROPERTY,
  getProperty,
  listBrokers,
  PURPOSE_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
  updateProperty,
  type PropertyKind,
  type PropertyPurposeDb,
  type PropertyRecord,
  type PropertyStatus,
} from '@/dashboard/propertiesApi'
import { fromFormValues, toFormValues, type PropertyFormValues } from '@/dashboard/propertyForm'
import { useWorkspace } from '@/dashboard/workspace'
import { useAuth } from '@/auth/context'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/cn'

const input =
  'mt-1.5 h-12 w-full rounded-xl border border-navy-950/15 bg-white px-4 text-[16px] text-navy-950 outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-800/15 disabled:bg-sand disabled:text-slate'

type Errors = Partial<Record<keyof PropertyFormValues, string>>

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-card sm:p-6">
      <h2 className="font-display text-[19px] font-bold text-navy-950">{title}</h2>
      {description && <p className="mt-1 text-[14px] text-slate">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label className="block text-[14px] font-semibold text-navy-950">
        {label}
        {children}
      </label>
      {hint && !error && <p className="mt-1 text-[12.5px] text-slate">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
  disabled?: boolean
}) {
  return (
    <label className={cn('flex items-start gap-3 py-2', disabled && 'opacity-60')}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-navy-800"
      />
      <span>
        <span className="block text-[15px] font-semibold text-navy-950">{label}</span>
        {hint && <span className="block text-[13px] text-slate">{hint}</span>}
      </span>
    </label>
  )
}

function AmenitiesInput({ value, onChange, disabled }: { value: string[]; onChange: (v: string[]) => void; disabled: boolean }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const items = draft
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter((s) => s && !value.includes(s))
    if (items.length) onChange([...value, ...items].slice(0, 60))
    setDraft('')
  }
  return (
    <div>
      {!disabled && (
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                add()
              }
            }}
            placeholder="Ex.: Piscina, Área gourmet, Portaria 24h"
            aria-label="Nova comodidade"
            className={cn(input, 'mt-0')}
          />
          <Button type="button" variant="outline" onClick={add} className="h-12" aria-label="Adicionar comodidade">
            <Plus className="size-4" aria-hidden="true" />
          </Button>
        </div>
      )}
      {value.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {value.map((a) => (
            <li key={a} className="inline-flex h-9 items-center gap-1 rounded-full bg-sand pr-1 pl-3.5 text-[14px] font-medium text-navy-950">
              {a}
              {!disabled && (
                <button
                  type="button"
                  aria-label={`Remover ${a}`}
                  onClick={() => onChange(value.filter((x) => x !== a))}
                  className="flex size-7 items-center justify-center rounded-full hover:bg-sand-300"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Editor({ record }: { record: PropertyRecord | null }) {
  const ws = useWorkspace()
  const auth = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isNew = record === null
  const isManager = ws.can('properties.edit')
  const isOwnerBroker = !isManager && ws.brokerId !== null && record?.broker_id === ws.brokerId
  const editable = isNew ? ws.can('properties.create') && (isManager || ws.brokerId !== null) : isManager || isOwnerBroker

  const [values, setValues] = useState<PropertyFormValues>(() => toFormValues(record ?? EMPTY_PROPERTY))
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [savedStatus, setSavedStatus] = useState<PropertyStatus>(record?.status ?? 'draft')
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(
    params.get('novo') ? { tone: 'ok', text: 'Imóvel criado. Agora adicione as fotos abaixo.' } : null,
  )

  const { data: brokers } = useAsyncData(() => (isManager ? listBrokers(ws.tenantId) : Promise.resolve([])), `${ws.tenantId}:${isManager}`)

  const set = <K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }
  const text = (key: keyof PropertyFormValues) => ({
    value: (values[key] as string | null) ?? '',
    onChange: (e: { target: { value: string } }) => set(key, e.target.value as never),
    disabled: !editable,
  })

  async function save(nextStatus?: PropertyStatus) {
    const result = fromFormValues(nextStatus ? { ...values, status: nextStatus } : values)
    if (!result.input) {
      setErrors(result.errors)
      setMessage({ tone: 'error', text: 'Revise os campos destacados.' })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      if (isNew) {
        const id = await createProperty(ws.tenantId, result.input, {
          asBroker: isManager ? null : ws.brokerId,
          userId: auth.userId,
        })
        navigate(`/dashboard/imoveis/${id}?novo=1`, { replace: true })
        return
      }
      await updateProperty(ws.tenantId, record.id, result.input, { asBroker: !isManager })
      if (nextStatus) setValues((v) => ({ ...v, status: nextStatus }))
      setSavedStatus(result.input.status)
      setMessage({
        tone: 'ok',
        text: nextStatus === 'published' ? 'Imóvel publicado — já aparece no site.' : 'Alterações salvas.',
      })
    } catch (e) {
      setMessage({ tone: 'error', text: e instanceof Error ? e.message : 'Não foi possível salvar.' })
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!record) return
    if (!window.confirm(`Excluir "${record.title}" e todas as fotos? Esta ação não pode ser desfeita.\n\nPara apenas tirar do site, use o status "Arquivado".`))
      return
    setSaving(true)
    try {
      const photos = await listPhotos(record.id)
      await deleteProperty(ws.tenantId, record.id, photos.flatMap((p) => (p.storagePath ? [p.storagePath] : [])))
      navigate('/dashboard/imoveis', { replace: true })
    } catch (e) {
      setSaving(false)
      setMessage({ tone: 'error', text: e instanceof Error ? e.message : 'Não foi possível excluir.' })
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    void save()
  }

  const status = values.status
  const brokerName = brokers?.find((b) => b.id === values.broker_id)?.name

  return (
    <form onSubmit={submit} noValidate className="pb-28">
      <Link to="/dashboard/imoveis" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy-800">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Imóveis
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 font-display text-[26px] font-bold tracking-[-0.02em] text-navy-950 sm:text-[28px]">
          {isNew ? 'Cadastrar imóvel' : record.title}
        </h1>
        {!isNew && <StatusBadge status={savedStatus} />}
      </div>
      {!isNew && savedStatus === 'published' && (
        <a
          href={`/imovel/${record.slug}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy-800"
        >
          Ver no site <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      )}

      {!editable && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-white p-4 text-[14.5px] text-navy-950 shadow-card">
          <Info className="mt-0.5 size-4 shrink-0 text-slate" aria-hidden="true" />
          {isNew
            ? 'Seu cadastro de corretor ainda não está ativo. Peça ao gerente para ativá-lo.'
            : 'Somente leitura: este imóvel está sob responsabilidade de outro corretor.'}
        </p>
      )}
      {editable && !isManager && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-gold-500/15 p-4 text-[14.5px] text-navy-950">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {isNew
            ? 'O imóvel será salvo como rascunho. O gerente revisa e publica no site.'
            : 'Você pode editar dados e fotos. Publicação, destaque e verificação de documentos ficam com o gerente.'}
        </p>
      )}

      <div className="mt-6 space-y-5">
        <Section title="Dados principais">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título do anúncio" error={errors.title} className="sm:col-span-2">
              <input {...text('title')} maxLength={140} placeholder="Ex.: Casa em condomínio com piscina" className={input} />
            </Field>
            <Field label="Tipo">
              <select value={values.type} onChange={(e) => set('type', e.target.value as PropertyKind)} disabled={!editable} className={input}>
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Finalidade">
              <select
                value={values.purpose}
                onChange={(e) => set('purpose', e.target.value as PropertyPurposeDb)}
                disabled={!editable}
                className={input}
              >
                {Object.entries(PURPOSE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={values.purpose === 'venda' ? 'Preço (R$)' : 'Valor mensal (R$)'} error={errors.price}>
              <input {...text('price')} inputMode="decimal" placeholder="Ex.: 890.000" className={input} />
            </Field>
            <Field label="Código interno" error={errors.code} hint="Opcional. Ex.: LG-011">
              <input {...text('code')} maxLength={40} className={input} />
            </Field>
            <Field label="Condomínio (R$/mês)" error={errors.condo_fee}>
              <input {...text('condo_fee')} inputMode="decimal" className={input} />
            </Field>
            <Field label="IPTU (R$/ano)" error={errors.iptu}>
              <input {...text('iptu')} inputMode="decimal" className={input} />
            </Field>
          </div>
        </Section>

        <Section title="Localização" description="O endereço exato fica oculto no site, a menos que você libere.">
          <div className="grid gap-4 sm:grid-cols-6">
            <Field label="Bairro" className="sm:col-span-3">
              <input {...text('neighborhood')} maxLength={80} className={input} />
            </Field>
            <Field label="Cidade" className="sm:col-span-2">
              <input {...text('city')} maxLength={80} className={input} />
            </Field>
            <Field label="UF" error={errors.state}>
              <input {...text('state')} maxLength={2} autoCapitalize="characters" className={cn(input, 'uppercase')} />
            </Field>
            <Field label="Rua" className="sm:col-span-3">
              <input {...text('street')} maxLength={160} className={input} />
            </Field>
            <Field label="Número">
              <input {...text('street_number')} maxLength={20} className={input} />
            </Field>
            <Field label="CEP" error={errors.zip_code} className="sm:col-span-2">
              <input {...text('zip_code')} inputMode="numeric" maxLength={9} className={input} />
            </Field>
            <Field label="Complemento" className="sm:col-span-6">
              <input {...text('complement')} maxLength={80} className={input} />
            </Field>
          </div>
          <div className="mt-3">
            <Toggle
              checked={!values.hide_exact_address}
              onChange={(v) => set('hide_exact_address', !v)}
              disabled={!editable}
              label="Mostrar endereço completo no site"
              hint="Desligado: o site mostra só bairro e cidade."
            />
          </div>
        </Section>

        <Section title="Características">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Quartos" error={errors.bedrooms}>
              <input {...text('bedrooms')} inputMode="numeric" className={input} />
            </Field>
            <Field label="Suítes" error={errors.suites}>
              <input {...text('suites')} inputMode="numeric" className={input} />
            </Field>
            <Field label="Banheiros" error={errors.bathrooms}>
              <input {...text('bathrooms')} inputMode="numeric" className={input} />
            </Field>
            <Field label="Vagas" error={errors.parking}>
              <input {...text('parking')} inputMode="numeric" className={input} />
            </Field>
            <Field label="Área construída (m²)" error={errors.built_area}>
              <input {...text('built_area')} inputMode="decimal" className={input} />
            </Field>
            <Field label="Área total (m²)" error={errors.total_area}>
              <input {...text('total_area')} inputMode="decimal" className={input} />
            </Field>
            <Field label="Andar" error={errors.floor}>
              <input {...text('floor')} inputMode="numeric" className={input} />
            </Field>
          </div>
          <div className="mt-3">
            <Toggle checked={values.furnished} onChange={(v) => set('furnished', v)} disabled={!editable} label="Mobiliado" />
          </div>
        </Section>

        <Section title="Descrição e comodidades">
          <Field label="Descrição" error={errors.description}>
            <textarea
              {...text('description')}
              rows={6}
              maxLength={8000}
              className={cn(input, 'h-auto py-3 leading-relaxed')}
              placeholder="Conte o que torna este imóvel especial: ambientes, acabamentos, localização, documentação."
            />
          </Field>
          <div className="mt-5">
            <p className="text-[14px] font-semibold text-navy-950">Comodidades</p>
            <div className="mt-1.5">
              <AmenitiesInput value={values.amenities} onChange={(v) => set('amenities', v)} disabled={!editable} />
            </div>
          </div>
        </Section>

        <Section
          title="Publicação"
          description={isManager ? 'Só imóveis "Publicado" aparecem no site.' : 'Definida pelo gerente da imobiliária.'}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status">
              <select
                value={status}
                onChange={(e) => set('status', e.target.value as PropertyStatus)}
                disabled={!editable || !isManager}
                className={input}
              >
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Corretor responsável">
              {isManager ? (
                <select
                  value={values.broker_id ?? ''}
                  onChange={(e) => set('broker_id', e.target.value || null)}
                  disabled={!editable}
                  className={input}
                >
                  <option value="">Imobiliária (sem corretor)</option>
                  {(brokers ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input value={isOwnerBroker || isNew ? 'Você' : brokerName ?? '—'} disabled className={input} />
              )}
            </Field>
          </div>
          <div className="mt-3 divide-y divide-navy-950/6">
            <Toggle
              checked={values.featured}
              onChange={(v) => set('featured', v)}
              disabled={!editable || !isManager}
              label="Destaque na página inicial"
            />
            <Toggle
              checked={values.documentation_verified}
              onChange={(v) => set('documentation_verified', v)}
              disabled={!editable || !isManager}
              label="Documentação verificada"
              hint="Exibe o selo no anúncio. Marque só após a conferência jurídica."
            />
          </div>
        </Section>

        {!isNew && (
          <Section title="Fotos" description="A capa aparece nos cards do site; a ordem é a da galeria do anúncio.">
            <PhotoManager tenantId={ws.tenantId} propertyId={record.id} title={values.title || record.title} editable={editable} />
          </Section>
        )}

        {!isNew && (record.has3d || record.hasTour) && (
          <Section title="Experiências imersivas">
            <ul className="space-y-2 text-[15px] text-navy-950">
              {record.has3d && (
                <li className="flex items-center gap-2">
                  <Box className="size-4 text-gold-600" aria-hidden="true" /> Modelo 3D ativo
                </li>
              )}
              {record.hasTour && (
                <li className="flex items-center gap-2">
                  <Box className="size-4 text-tour" aria-hidden="true" /> Tour 360° ativo
                </li>
              )}
            </ul>
            <p className="mt-2 text-[13px] text-slate">A gestão do 3D e do tour pelo painel chega na próxima etapa.</p>
          </Section>
        )}

        {!isNew && ws.can('properties.delete') && (
          <div className="flex justify-end">
            <Button type="button" variant="ghost" onClick={() => void remove()} disabled={saving} className="text-red-700 hover:bg-red-50">
              <Trash2 className="size-4" aria-hidden="true" />
              Excluir imóvel
            </Button>
          </div>
        )}
      </div>

      {editable && (
        <div className="fixed inset-x-0 bottom-16 z-20 border-t border-navy-950/10 bg-white/95 backdrop-blur lg:bottom-0">
          <div className="mx-auto flex max-w-[1280px] items-center justify-end gap-3 px-4 py-3 sm:px-6">
            {message && (
              <p
                role={message.tone === 'error' ? 'alert' : 'status'}
                className={cn('mr-auto text-[14px] font-medium', message.tone === 'error' ? 'text-red-700' : 'text-tour')}
              >
                {message.text}
              </p>
            )}
            {isManager && !isNew && savedStatus === 'draft' && status === 'draft' && (
              <Button type="button" variant="outline" disabled={saving} onClick={() => void save('published')}>
                Publicar
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
              {isNew ? 'Salvar imóvel' : 'Salvar'}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}

export default function PropertyEditor() {
  const { id } = useParams()
  const ws = useWorkspace()
  usePageTitle(id ? 'Editar imóvel · Painel' : 'Cadastrar imóvel · Painel')
  const { data, loading, error } = useAsyncData(
    () => (id ? getProperty(ws.tenantId, id) : Promise.resolve(null)),
    `${ws.tenantId}:${id ?? 'new'}`,
  )

  if (id && loading) return <div className="h-96 animate-pulse rounded-3xl bg-white/70" aria-busy="true" />
  if (error) {
    return (
      <p role="alert" className="rounded-2xl bg-red-50 p-4 text-[15px] text-red-800">
        {error.message}
      </p>
    )
  }
  if (id && !data) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card">
        <p className="text-[15px] text-slate">Imóvel não encontrado nesta imobiliária.</p>
        <Link to="/dashboard/imoveis" className="mt-3 inline-block font-semibold text-navy-800">
          Voltar para Imóveis
        </Link>
      </div>
    )
  }
  // `key` reinicia o formulário ao trocar de imóvel/imobiliária.
  return <Editor key={`${ws.tenantId}:${data?.id ?? 'new'}:${data?.updated_at ?? ''}`} record={data ?? null} />
}
