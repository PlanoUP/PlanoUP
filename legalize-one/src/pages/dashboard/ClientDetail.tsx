import { ArrowLeft, Check, CircleAlert, ExternalLink, FileText, Loader2, Pencil, Trash2, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { Button, ButtonLink } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { ClientStageBadge, DocMeter } from '@/dashboard/ClientStageBadge'
import { STAGE_TONES } from '@/dashboard/clientStageTones'
import {
  DOC_ACCEPT,
  DOC_KINDS,
  INCOME_LABELS,
  MARITAL_LABELS,
  STAGE_LABELS,
  STAGE_ORDER,
  deleteClient,
  docProgress,
  documentUrl,
  eventLabel,
  formatCpf,
  getClient,
  listDocuments,
  listEvents,
  missingDocsMessage,
  removeDocument,
  setDocumentStatus,
  updateClient,
  uploadDocument,
  type Client,
  type ClientDocument,
  type ClientStage,
  type DocKind,
} from '@/dashboard/clientsApi'
import { formatWhen, whatsappNumber } from '@/dashboard/leadsApi'
import { getProperty, listBrokers } from '@/dashboard/propertiesApi'
import { useWorkspace } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/cn'
import { formatPhoneBR, formatPrice } from '@/utils/format'

const brl = (n: number | null) => (n === null ? '—' : formatPrice(n))
const size = (b: number | null) => (b === null ? '' : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

export default function ClientDetail() {
  const { id = '' } = useParams()
  const ws = useWorkspace()
  const [params, setParams] = useSearchParams()
  const isNew = params.get('novo') === '1'
  const manager = ws.can('leads.view_all')
  const [version, setVersion] = useState(0)
  const { data, error, loading } = useAsyncData(async () => {
    const client = await getClient(ws.tenantId, id)
    if (!client) return null
    const [docs, events, property, brokers] = await Promise.all([
      listDocuments(id),
      listEvents(id),
      client.property_id ? getProperty(ws.tenantId, client.property_id) : Promise.resolve(null),
      listBrokers(ws.tenantId).catch(() => []),
    ])
    return { client, docs, events, property, brokerName: brokers.find((b) => b.id === client.broker_id)?.name ?? null }
  }, `${ws.tenantId}:${id}:${version}`)
  usePageTitle(data?.client ? `${data.client.full_name} · Clientes` : 'Cliente · Painel')

  if (error)
    return (
      <p role="alert" className="rounded-2xl bg-red-50 p-4 text-[15px] text-red-800">
        {error.message}
      </p>
    )
  if (loading && !data) return <div className="h-96 animate-pulse rounded-3xl bg-white/70" aria-busy="true" />
  if (!data)
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card">
        <p className="text-[15px] text-slate">Cliente não encontrado ou sem permissão.</p>
        <ButtonLink to="/dashboard/clientes" variant="outline" className="mt-4">
          Voltar aos clientes
        </ButtonLink>
      </div>
    )

  return (
    <Detail
      key={id}
      {...data}
      manager={manager}
      isNew={isNew}
      onDoneNew={() => setParams({}, { replace: true })}
      reload={() => setVersion((v) => v + 1)}
    />
  )
}

function Detail({
  client,
  docs,
  events,
  property,
  brokerName,
  manager,
  isNew,
  onDoneNew,
  reload,
}: {
  client: Client
  docs: ClientDocument[]
  events: Awaited<ReturnType<typeof listEvents>>
  property: { title: string; code: string | null; slug: string } | null
  brokerName: string | null
  manager: boolean
  isNew: boolean
  onDoneNew: () => void
  reload: () => void
}) {
  const ws = useWorkspace()
  const navigate = useNavigate()
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const progress = docProgress(client, docs)
  const first = client.full_name.split(' ')[0]
  const wa = whatsappNumber(client.phone)

  async function run(key: string, fn: () => Promise<unknown>, ok?: string) {
    setBusy(key)
    setMsg(null)
    try {
      await fn()
      if (ok) setMsg({ tone: 'ok', text: ok })
      reload()
    } catch (err) {
      setMsg({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível concluir.' })
    } finally {
      setBusy(null)
    }
  }

  const setStage = (stage: ClientStage) => run(`stage:${stage}`, () => updateClient(ws.tenantId, client.id, { stage }), `Etapa: ${STAGE_LABELS[stage]}.`)

  async function upload(kind: string, files: FileList | null) {
    if (!files?.length) return
    await run(`up:${kind}`, async () => {
      for (const f of Array.from(files)) await uploadDocument(ws.tenantId, client.id, kind, f)
    }, files.length > 1 ? `${files.length} arquivos enviados.` : 'Arquivo enviado.')
  }

  async function open(doc: ClientDocument) {
    const tab = window.open('', '_blank', 'noopener')
    try {
      const url = await documentUrl(doc)
      if (tab) tab.location.href = url
      else window.location.href = url
    } catch (err) {
      tab?.close()
      setMsg({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível abrir.' })
    }
  }

  async function remove() {
    if (!window.confirm(`Excluir ${client.full_name} e todos os documentos? Não dá para desfazer.`)) return
    setBusy('delete')
    try {
      await deleteClient(ws.tenantId, client.id, docs.map((d) => d.storage_path))
      navigate('/dashboard/clientes')
    } catch (err) {
      setMsg({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível excluir.' })
      setBusy(null)
    }
  }

  const askDocsHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(missingDocsMessage(first, progress.missing, brokerName))}` : null
  const extraDocs = docs.filter((d) => !progress.required.some((k) => k.key === d.kind))

  return (
    <div className="space-y-5 pb-24">
      <div>
        <Link to="/dashboard/clientes" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy-800">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Clientes
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">{client.full_name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[14px] text-slate">
              <ClientStageBadge stage={client.stage} />
              <span>CPF {formatCpf(client.cpf)}</span>
              {brokerName && <span>· {brokerName}</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1f8a5b] px-4 text-[14px] font-semibold text-white hover:bg-[#1a774e]"
              >
                <WhatsAppIcon className="size-4" />
                WhatsApp
              </a>
            )}
            <ButtonLink to={`/dashboard/clientes/${client.id}/editar`} variant="outline">
              <Pencil className="size-4" aria-hidden="true" />
              Editar
            </ButtonLink>
          </div>
        </div>
      </div>

      {isNew && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-navy-950 p-4 text-white">
          <span className="flex size-7 items-center justify-center rounded-full bg-gold-500 text-[13px] font-bold text-navy-950">2</span>
          <p className="min-w-0 flex-1 text-[14.5px]">
            <strong>Cliente cadastrado.</strong> Agora anexe os documentos — a lista abaixo já está ajustada à renda e à família dele.
          </p>
          <button type="button" onClick={onDoneNew} className="rounded-full px-3 py-1 text-[13px] font-semibold text-white/80 hover:bg-white/10" aria-label="Fechar aviso">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {msg && (
        <p role={msg.tone === 'error' ? 'alert' : 'status'} className={cn('rounded-2xl p-3 text-[14px] font-medium', msg.tone === 'error' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-900')}>
          {msg.text}
        </p>
      )}

      {/* Etapa */}
      <section className="rounded-3xl bg-white p-5 shadow-card sm:p-6" aria-labelledby="etapa-titulo">
        <h2 id="etapa-titulo" className="font-display text-[19px] font-bold text-navy-950">
          Etapa do processo
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {STAGE_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              disabled={busy !== null}
              aria-pressed={client.stage === s}
              onClick={() => client.stage !== s && void setStage(s)}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13.5px] font-semibold transition-colors',
                client.stage === s ? 'border-navy-950 bg-navy-950 text-white' : 'border-navy-950/12 bg-white text-navy-950 hover:bg-sand',
              )}
            >
              {busy === `stage:${s}` ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <span className={cn('size-2 rounded-full', STAGE_TONES[s].dot)} aria-hidden="true" />}
              {STAGE_LABELS[s]}
            </button>
          ))}
        </div>
        {client.stage === 'docs_pending' && progress.missing.length === 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-emerald-50 p-3 text-[14px] text-emerald-900">
            <Check className="size-4" aria-hidden="true" />
            <span className="flex-1">Documentação completa.</span>
            <Button type="button" size="sm" onClick={() => void setStage('in_review')} disabled={busy !== null}>
              Enviar para análise
            </Button>
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Documentos */}
        <section className="rounded-3xl bg-white p-5 shadow-card sm:p-6" aria-labelledby="docs-titulo">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="docs-titulo" className="font-display text-[19px] font-bold text-navy-950">
                Documentos
              </h2>
              <p className="mt-1 text-[13.5px] text-slate">Arquivos protegidos: só a equipe autorizada abre, por link temporário.</p>
            </div>
            <DocMeter done={progress.done} total={progress.total} className="w-40" />
          </div>

          {askDocsHref && progress.missing.length > 0 && (
            <a
              href={askDocsHref}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center gap-3 rounded-2xl border border-[#1f8a5b]/30 bg-[#1f8a5b]/6 p-3 text-[14px] font-semibold text-[#17633f] hover:bg-[#1f8a5b]/10"
            >
              <WhatsAppIcon className="size-5" />
              <span className="flex-1">Pedir os {progress.missing.length} documentos que faltam pelo WhatsApp</span>
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          )}

          <ul className="mt-4 divide-y divide-navy-950/8">
            {progress.required.map((k) => (
              <DocRow
                key={k.key}
                kind={k}
                files={docs.filter((d) => d.kind === k.key)}
                busy={busy}
                manager={manager}
                onUpload={(f) => void upload(k.key, f)}
                onOpen={(d) => void open(d)}
                onStatus={(d, s) => void run(`st:${d.id}`, () => setDocumentStatus(d.id, s))}
                onRemove={(d) => window.confirm(`Remover "${d.file_name}"?`) && void run(`rm:${d.id}`, () => removeDocument(d), 'Arquivo removido.')}
              />
            ))}
            <DocRow
              kind={DOC_KINDS.outro}
              files={extraDocs}
              busy={busy}
              manager={manager}
              optional
              onUpload={(f) => void upload('outro', f)}
              onOpen={(d) => void open(d)}
              onStatus={(d, s) => void run(`st:${d.id}`, () => setDocumentStatus(d.id, s))}
              onRemove={(d) => window.confirm(`Remover "${d.file_name}"?`) && void run(`rm:${d.id}`, () => removeDocument(d), 'Arquivo removido.')}
            />
          </ul>
        </section>

        <div className="space-y-5">
          <section className="rounded-3xl bg-white p-5 shadow-card sm:p-6" aria-labelledby="dados-titulo">
            <h2 id="dados-titulo" className="font-display text-[19px] font-bold text-navy-950">
              Dados
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
              <Info label="Telefone" value={formatPhoneBR(client.phone)} />
              <Info label="E-mail" value={client.email} />
              <Info label="Renda mensal" value={brl(client.monthly_income)} />
              <Info label="Tipo de renda" value={INCOME_LABELS[client.income_type]} />
              <Info label="Estado civil" value={client.marital_status ? MARITAL_LABELS[client.marital_status] : null} />
              <Info label="Dependentes" value={String(client.dependents)} />
              <Info label="Nascimento" value={client.birth_date ? new Date(`${client.birth_date}T12:00:00`).toLocaleDateString('pt-BR') : null} />
              <Info label="Instagram" value={client.instagram ? `@${client.instagram}` : null} />
              <Info
                label="Imóvel"
                className="col-span-2"
                value={property ? `${property.code ? `${property.code} — ` : ''}${property.title}` : 'Ainda não definido'}
              />
              <Info label="Avaliação (laudo)" value={brl(client.appraisal_value)} />
              <Info label="Financiado" value={brl(client.financing_value)} />
              {client.notes && <Info label="Observações" className="col-span-2 whitespace-pre-line" value={client.notes} />}
            </dl>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-card sm:p-6" aria-labelledby="hist-titulo">
            <h2 id="hist-titulo" className="font-display text-[19px] font-bold text-navy-950">
              Histórico
            </h2>
            <ol className="mt-3 space-y-3 border-l border-navy-950/10 pl-4">
              {events.map((e) => (
                <li key={e.id} className="relative text-[14px]">
                  <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-white bg-navy-800" aria-hidden="true" />
                  <span className="block text-navy-950">{eventLabel(e)}</span>
                  <span className="text-[12.5px] text-slate">{formatWhen(e.created_at)}</span>
                </li>
              ))}
            </ol>
          </section>

          {manager && (
            <Button type="button" variant="ghost" onClick={() => void remove()} disabled={busy !== null} className="text-red-700">
              <Trash2 className="size-4" aria-hidden="true" />
              Excluir cliente
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Info({ label, value, className }: { label: string; value: string | null; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-[12.5px] text-slate">{label}</dt>
      <dd className="font-medium break-words text-navy-950">{value || '—'}</dd>
    </div>
  )
}

function DocRow({
  kind,
  files,
  busy,
  manager,
  optional,
  onUpload,
  onOpen,
  onStatus,
  onRemove,
}: {
  kind: DocKind
  files: ClientDocument[]
  busy: string | null
  manager: boolean
  optional?: boolean
  onUpload: (files: FileList | null) => void
  onOpen: (d: ClientDocument) => void
  onStatus: (d: ClientDocument, s: ClientDocument['status']) => void
  onRemove: (d: ClientDocument) => void
}) {
  const ok = files.some((f) => f.status !== 'rejected')
  const accepted = files.some((f) => f.status === 'accepted')
  return (
    <li className="py-3">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full',
            accepted ? 'bg-emerald-500 text-white' : ok ? 'bg-sky-100 text-sky-800' : optional ? 'bg-sand text-slate' : 'bg-amber-100 text-amber-800',
          )}
          aria-hidden="true"
        >
          {accepted ? <Check className="size-4" /> : ok ? <FileText className="size-3.5" /> : optional ? <FileText className="size-3.5" /> : <CircleAlert className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-semibold text-navy-950">
            {kind.label}
            <span className="sr-only">{accepted ? ' (aprovado)' : ok ? ' (recebido)' : optional ? '' : ' (faltando)'}</span>
          </p>
          <p className="text-[12.5px] text-slate">{kind.hint}</p>
        </div>
        <label
          className={cn(
            'inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-navy-950/15 bg-white px-3 text-[13px] font-semibold text-navy-800 hover:bg-sand',
            busy && 'pointer-events-none opacity-60',
          )}
        >
          {busy === `up:${kind.key}` ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
          {files.length ? 'Mais' : 'Enviar'}
          <span className="sr-only"> arquivo: {kind.label}</span>
          <input type="file" multiple accept={DOC_ACCEPT} className="sr-only" onChange={(e) => {
              onUpload(e.target.files)
              e.target.value = ''
            }} />
        </label>
      </div>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5 pl-10">
          {files.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-sand/70 px-3 py-2 text-[13px]">
              <button type="button" onClick={() => onOpen(d)} className="min-w-0 flex-1 truncate text-left font-medium text-navy-800 underline-offset-2 hover:underline">
                {d.file_name}
              </button>
              <span className="text-slate">{size(d.size_bytes)}</span>
              {d.status !== 'received' && (
                <span className={cn('rounded-full px-2 py-0.5 text-[11.5px] font-semibold', d.status === 'accepted' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-800')}>
                  {d.status === 'accepted' ? 'Aprovado' : 'Recusado'}
                </span>
              )}
              {manager && d.status !== 'accepted' && (
                <button type="button" disabled={busy !== null} onClick={() => onStatus(d, 'accepted')} className="rounded-full px-2 py-0.5 text-[12px] font-semibold text-emerald-800 hover:bg-emerald-100" aria-label={`Aprovar ${d.file_name}`}>
                  Aprovar
                </button>
              )}
              {manager && d.status !== 'rejected' && (
                <button type="button" disabled={busy !== null} onClick={() => onStatus(d, 'rejected')} className="rounded-full px-2 py-0.5 text-[12px] font-semibold text-red-700 hover:bg-red-100" aria-label={`Recusar ${d.file_name}`}>
                  Recusar
                </button>
              )}
              <button type="button" disabled={busy !== null} onClick={() => onRemove(d)} className="rounded-full p-1 text-slate hover:bg-white hover:text-red-700" aria-label={`Remover ${d.file_name}`}>
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
