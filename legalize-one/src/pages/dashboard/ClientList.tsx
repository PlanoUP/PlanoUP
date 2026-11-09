import { Columns3, List, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ButtonLink } from '@/components/ui/Button'
import { ClientStageBadge, DocMeter } from '@/dashboard/ClientStageBadge'
import { STAGE_TONES } from '@/dashboard/clientStageTones'
import {
  STAGE_HINTS,
  STAGE_LABELS,
  STAGE_ORDER,
  daysSince,
  docProgress,
  listClients,
  listDocumentKinds,
  maskCpf,
  type Client,
  type ClientStage,
} from '@/dashboard/clientsApi'
import { listBrokers, listProperties } from '@/dashboard/propertiesApi'
import { useWorkspace } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/cn'
import { normalizeText } from '@/utils/format'

type Filter = ClientStage | 'all'

export default function ClientList() {
  usePageTitle('Clientes · Painel')
  const ws = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const filter = (params.get('etapa') as Filter | null) ?? 'all'
  const view = params.get('ver') === 'funil' ? 'board' : 'list'
  const manager = ws.can('leads.view_all')

  const { data, loading, error } = useAsyncData(async () => {
    const [clients, docs, brokers, properties] = await Promise.all([
      listClients(ws.tenantId),
      listDocumentKinds(ws.tenantId),
      manager ? listBrokers(ws.tenantId) : Promise.resolve([]),
      listProperties(ws.tenantId),
    ])
    const byClient = new Map<string, typeof docs>()
    for (const d of docs) byClient.set(d.client_id, [...(byClient.get(d.client_id) ?? []), d])
    return {
      clients,
      docsOf: (c: Client) => byClient.get(c.id) ?? [],
      brokers: new Map(brokers.map((b) => [b.id, b.name])),
      properties: new Map(properties.map((p) => [p.id, p])),
    }
  }, `${ws.tenantId}:${manager}`)

  const clients = data?.clients ?? []
  const matches = (c: Client) => {
    if (!query) return true
    const p = c.property_id ? data?.properties.get(c.property_id) : undefined
    const hay = normalizeText([c.full_name, c.email, p?.title, p?.code].filter(Boolean).join(' '))
    const digits = query.replace(/\D/g, '')
    return normalizeText(query)
      .split(/\s+/)
      .every((t) => hay.includes(t) || (digits.length >= 3 && (c.cpf.includes(digits) || c.phone.includes(digits))))
  }
  const searched = clients.filter(matches)
  const visible = searched.filter((c) => filter === 'all' || c.stage === filter)
  const count = (s: ClientStage) => clients.filter((c) => c.stage === s).length

  const set = (next: Record<string, string | null>) => {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    setParams(p, { replace: true })
  }

  return (
    <div className="pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">Clientes</h1>
          <p className="mt-1 text-[14.5px] text-slate">
            {manager ? 'Compradores em processo, de todos os corretores.' : 'Seus compradores: cadastro, documentos e cada etapa.'}
          </p>
        </div>
        <div className="hidden sm:block">
          <ButtonLink to="/dashboard/clientes/novo">
            <Plus className="size-4" aria-hidden="true" />
            Novo cliente
          </ButtonLink>
        </div>
      </div>

      {/* Resumo por etapa (clicável) */}
      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {STAGE_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => set({ etapa: filter === s ? null : s })}
            aria-pressed={filter === s}
            className={cn(
              'w-36 shrink-0 rounded-2xl bg-white px-4 py-3 text-left shadow-card transition-shadow hover:shadow-float sm:w-auto sm:py-4',
              filter === s && 'ring-2 ring-navy-950',
            )}
          >
            <span className="flex items-center gap-1.5 truncate text-[12.5px] font-semibold text-slate">
              <span className={cn('size-2 shrink-0 rounded-full', STAGE_TONES[s].dot)} aria-hidden="true" />
              <span className="truncate">{STAGE_LABELS[s]}</span>
            </span>
            <span className="mt-0.5 block font-display text-[24px] font-bold text-navy-950 tabular-nums sm:text-[26px]">{data ? count(s) : '–'}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="relative block w-full min-w-0 sm:w-auto sm:flex-1">
          <span className="sr-only">Buscar cliente</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, CPF, telefone ou imóvel"
            className="h-12 w-full rounded-full border border-navy-950/12 bg-white pr-4 pl-11 text-[16px] text-navy-950 outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-800/15"
          />
        </label>
        <div className="flex rounded-full bg-white p-1 shadow-card" role="tablist" aria-label="Modo de exibição">
          {(
            [
              ['list', 'Lista', List],
              ['board', 'Funil', Columns3],
            ] as const
          ).map(([v, label, Icon]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => set({ ver: v === 'board' ? 'funil' : null })}
              className={cn(
                'inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-semibold',
                view === v ? 'bg-navy-950 text-white' : 'text-navy-950 hover:bg-sand',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-6 rounded-2xl bg-red-50 p-4 text-[15px] text-red-800">
          {error.message}
        </p>
      ) : loading && !data ? (
        <ul className="mt-6 space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-24 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </ul>
      ) : clients.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-card">
          <p className="font-display text-[19px] font-bold text-navy-950">Nenhum cliente ainda</p>
          <p className="mx-auto mt-1 max-w-md text-[14.5px] text-slate">
            Cadastre o comprador, anexe os documentos e acompanhe cada etapa até a aprovação. O sistema mostra o que falta e monta a
            mensagem para o WhatsApp.
          </p>
          <ButtonLink to="/dashboard/clientes/novo" className="mt-5">
            <Plus className="size-4" aria-hidden="true" />
            Cadastrar o primeiro cliente
          </ButtonLink>
        </div>
      ) : view === 'board' ? (
        <div className="-mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
          {STAGE_ORDER.map((s) => {
            const col = searched.filter((c) => c.stage === s)
            return (
              <section key={s} aria-label={STAGE_LABELS[s]} className="w-[82%] max-w-[300px] shrink-0 snap-start rounded-3xl bg-navy-950/4 p-3 sm:w-[280px]">
                <header className="flex items-center justify-between px-1 pb-2">
                  <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-navy-950">
                    <span className={cn('size-2 rounded-full', STAGE_TONES[s].dot)} aria-hidden="true" />
                    {STAGE_LABELS[s]}
                  </span>
                  <span className="rounded-full bg-white px-2 text-[12px] font-semibold text-slate tabular-nums">{col.length}</span>
                </header>
                <p className="px-1 pb-2 text-[12px] text-slate">{STAGE_HINTS[s]}</p>
                <ul className="space-y-2">
                  {col.map((c) => (
                    <li key={c.id}>
                      <ClientCard c={c} data={data!} compact />
                    </li>
                  ))}
                  {col.length === 0 && <li className="rounded-2xl border border-dashed border-navy-950/15 p-4 text-center text-[12.5px] text-slate">Vazio</li>}
                </ul>
              </section>
            )
          })}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-card">
          <p className="text-[15px] text-slate">Nenhum cliente com esses filtros.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((c) => (
            <li key={c.id}>
              <ClientCard c={c} data={data!} />
            </li>
          ))}
        </ul>
      )}

      {/* Celular: botão fixo */}
      <Link
        to="/dashboard/clientes/novo"
        className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 inline-flex h-13 items-center gap-2 rounded-full bg-navy-950 px-5 text-[14.5px] font-semibold text-white shadow-float sm:hidden"
      >
        <Plus className="size-5" aria-hidden="true" />
        Novo cliente
      </Link>
    </div>
  )
}

interface ListData {
  docsOf: (c: Client) => { kind: string; status: 'received' | 'accepted' | 'rejected' }[]
  brokers: Map<string, string>
  properties: Map<string, { title: string; code: string | null }>
}

function ClientCard({ c, data, compact }: { c: Client; data: ListData; compact?: boolean }) {
  const progress = docProgress(c, data.docsOf(c))
  const property = c.property_id ? data.properties.get(c.property_id) : undefined
  const broker = c.broker_id ? data.brokers.get(c.broker_id) : undefined
  const idle = daysSince(c.stage_changed_at)
  return (
    <Link to={`/dashboard/clientes/${c.id}`} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-card transition-shadow hover:shadow-float">
      {!compact && (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-950 font-display text-[15px] font-bold text-gold-400">
          {c.full_name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase())
            .join('')}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[15.5px] font-semibold text-navy-950">{c.full_name}</span>
          {!compact && <ClientStageBadge stage={c.stage} />}
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-slate">
          {[maskCpf(c.cpf), property ? `${property.code ? `${property.code} · ` : ''}${property.title}` : null, broker].filter(Boolean).join(' · ')}
        </span>
        {(c.stage === 'docs_pending' || c.stage === 'in_review') && <DocMeter done={progress.done} total={progress.total} className="mt-2" />}
      </span>
      <span className={cn('shrink-0 text-right text-[12px]', idle >= 7 && c.stage === 'docs_pending' ? 'font-semibold text-amber-700' : 'text-slate')}>
        {idle === 0 ? 'hoje' : `há ${idle} ${idle === 1 ? 'dia' : 'dias'}`}
      </span>
    </Link>
  )
}
