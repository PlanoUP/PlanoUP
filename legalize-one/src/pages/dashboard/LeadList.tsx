import { Columns3, Download, List, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button, ButtonLink } from '@/components/ui/Button'
import { downloadCsv, toCsv, today } from '@/dashboard/exportCsv'
import { LeadStatusBadge } from '@/dashboard/LeadStatusBadge'
import { LEAD_STATUS_DOTS } from '@/dashboard/leadStatusTones'
import {
  LEAD_CHANNEL_LABELS,
  LEAD_STATUS_HINTS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_LEGACY,
  availableLeadStages,
  formatWhen,
  isOpenLead,
  listLeads,
  sourceLabel,
  updateLead,
  type Lead,
  type LeadStatus,
} from '@/dashboard/leadsApi'
import { listProperties } from '@/dashboard/propertiesApi'
import { useWorkspace } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/cn'
import { formatPhoneBR, normalizeText } from '@/utils/format'

type Filter = LeadStatus | 'open' | 'all'
const FILTER_LABELS: Record<Filter, string> = { ...LEAD_STATUS_LABELS, open: 'Em aberto', all: 'Todos' }

export default function LeadList() {
  usePageTitle('Contatos · Painel')
  const ws = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const filter = (params.get('status') as Filter | null) ?? 'open'
  const view = params.get('ver') === 'funil' ? 'board' : 'list'
  const { data, loading, error } = useAsyncData(
    async () => {
      const [leads, properties, stages] = await Promise.all([
        listLeads(ws.tenantId),
        listProperties(ws.tenantId),
        availableLeadStages(),
      ])
      return { leads, stages, properties: new Map(properties.map((p) => [p.id, p])) }
    },
    ws.tenantId,
  )
  // Mudanças de etapa feitas no funil (aplicadas na hora; desfeitas se o banco recusar).
  const [moved, setMoved] = useState<Record<string, LeadStatus>>({})
  const [moveError, setMoveError] = useState<string | null>(null)
  const stages = data?.stages ?? LEAD_STATUS_LEGACY
  const filters: Filter[] = ['open', ...stages, 'all']

  const leads = (data?.leads ?? []).map((l) => (moved[l.id] ? { ...l, status: moved[l.id] } : l))

  function set(next: Record<string, string | null>) {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v === null) p.delete(k)
      else p.set(k, v)
    }
    setParams(p, { replace: true })
  }

  async function move(lead: Lead, status: LeadStatus) {
    if (lead.status === status) return
    const before = lead.status
    setMoveError(null)
    setMoved((m) => ({ ...m, [lead.id]: status }))
    try {
      await updateLead(ws.tenantId, lead.id, { status })
    } catch (e) {
      setMoved((m) => ({ ...m, [lead.id]: before }))
      setMoveError(e instanceof Error ? e.message : 'Não foi possível mudar a etapa.')
    }
  }
  const propertyOf = (l: Lead) => (l.property_id ? data?.properties.get(l.property_id) : undefined)
  const matches = (l: Lead) => {
    if (!query) return true
    const p = propertyOf(l)
    const hay = normalizeText([l.name, l.phone, l.email, l.message, p?.title, p?.code].filter(Boolean).join(' '))
    return normalizeText(query)
      .split(/\s+/)
      .every((t) => hay.includes(t) || (/^\d+$/.test(t) && (l.phone ?? '').includes(t)))
  }
  const inFilter = (l: Lead, f: Filter) => (f === 'all' ? true : f === 'open' ? isOpenLead(l.status) : l.status === f)
  const visible = leads.filter((l) => inFilter(l, filter) && matches(l))
  const searched = leads.filter(matches)

  function exportLeads() {
    const csv = toCsv(leads, [
      { header: 'Recebido em', value: (l) => new Date(l.created_at).toLocaleString('pt-BR') },
      { header: 'Nome', value: (l) => l.name },
      { header: 'Telefone', value: (l) => l.phone },
      { header: 'E-mail', value: (l) => l.email },
      { header: 'Situação', value: (l) => LEAD_STATUS_LABELS[l.status] },
      { header: 'Canal', value: (l) => LEAD_CHANNEL_LABELS[l.channel] },
      { header: 'Origem', value: (l) => sourceLabel(l.source) },
      { header: 'Imóvel', value: (l) => { const p = propertyOf(l); return p ? `${p.code ? `${p.code} — ` : ''}${p.title}` : '' } },
      { header: 'Mensagem', value: (l) => l.message },
      { header: 'Campanha', value: (l) => [l.utm_source, l.utm_medium, l.utm_campaign].filter(Boolean).join(' / ') },
    ])
    downloadCsv(`contatos-${ws.tenantSlug}-${today()}.csv`, csv)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">Contatos</h1>
          <p className="mt-1 text-[14.5px] text-slate">
            {ws.can('leads.view_all') ? 'Todos os contatos da imobiliária.' : 'Contatos sob sua responsabilidade.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={!leads.length} onClick={exportLeads}>
            <Download className="size-4" aria-hidden="true" />
            Exportar planilha
          </Button>
          <ButtonLink to="/dashboard/contatos/novo">
            <Plus className="size-4" aria-hidden="true" />
            Registrar contato
          </ButtonLink>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block flex-1">
            <span className="sr-only">Buscar contato</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, telefone, e-mail ou imóvel"
              className="h-12 w-full rounded-full border border-navy-950/12 bg-white pr-4 pl-11 text-[16px] text-navy-950 outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-800/15"
            />
          </label>
          <div className="flex self-start rounded-full bg-white p-1 shadow-card sm:self-auto" role="tablist" aria-label="Modo de exibição">
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
        {view === 'list' && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Situação">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                onClick={() => set({ status: f === 'open' ? null : f })}
                className={cn(
                  'h-9 shrink-0 rounded-full px-4 text-[13.5px] font-semibold transition-colors',
                  filter === f ? 'bg-navy-950 text-white' : 'bg-white text-navy-950 hover:bg-sand-200',
                )}
              >
                {FILTER_LABELS[f]}
                {data && <span className="ml-1.5 opacity-60 tabular-nums">{leads.filter((l) => inFilter(l, f)).length}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {moveError && (
        <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-[14.5px] text-red-800">
          {moveError}
        </p>
      )}

      {error ? (
        <p role="alert" className="mt-6 rounded-2xl bg-red-50 p-4 text-[15px] text-red-800">
          {error.message}
        </p>
      ) : loading && !data ? (
        <ul className="mt-6 space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-20 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </ul>
      ) : view === 'board' && leads.length > 0 ? (
        <LeadBoard
          stages={stages}
          leads={searched}
          propertyOf={propertyOf}
          onMove={(lead, status) => void move(lead, status)}
        />
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-card">
          <p className="text-[15px] text-slate">
            {leads.length === 0
              ? 'Nenhum contato ainda. Os pedidos feitos pelo site aparecem aqui automaticamente.'
              : 'Nenhum contato com esses filtros.'}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((l) => {
            const p = propertyOf(l)
            return (
              <li key={l.id}>
                <Link
                  to={`/dashboard/contatos/${l.id}`}
                  className={cn(
                    'flex items-start gap-4 rounded-2xl bg-white p-4 shadow-card transition-shadow hover:shadow-float',
                    l.status === 'new' && 'ring-2 ring-gold-500/60',
                  )}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-950 font-display text-[16px] font-bold text-gold-400">
                    {(l.name ?? '?').trim().charAt(0).toUpperCase() || '?'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[16px] font-semibold text-navy-950">{l.name || 'Sem nome'}</span>
                      <LeadStatusBadge status={l.status} />
                    </span>
                    <span className="mt-0.5 block truncate text-[14px] text-navy-950/80">
                      {[l.phone && formatPhoneBR(l.phone), l.email].filter(Boolean).join(' · ') || 'Sem telefone ou e-mail'}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-slate">
                      {LEAD_CHANNEL_LABELS[l.channel]}
                      {p ? ` · ${p.code ? `${p.code} — ` : ''}${p.title}` : ''}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-[12.5px] text-slate">{formatWhen(l.created_at)}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

interface BoardProps {
  stages: LeadStatus[]
  leads: Lead[]
  propertyOf: (l: Lead) => { title: string; code: string | null } | undefined
  onMove: (lead: Lead, status: LeadStatus) => void
}

/**
 * Funil (Kanban): uma coluna por etapa. No computador, arraste o cartão; no celular (e por teclado),
 * use "Mover para" no próprio cartão.
 */
function LeadBoard({ stages, leads, propertyOf, onMove }: BoardProps) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<LeadStatus | null>(null)
  const byId = new Map(leads.map((l) => [l.id, l]))

  return (
    <div className="-mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
      {stages.map((s) => {
        const col = leads.filter((l) => l.status === s)
        return (
          <section
            key={s}
            aria-label={LEAD_STATUS_LABELS[s]}
            onDragOver={(e) => {
              if (!dragging) return
              e.preventDefault()
              setOver(s)
            }}
            onDragLeave={() => setOver((o) => (o === s ? null : o))}
            onDrop={(e) => {
              e.preventDefault()
              const lead = dragging ? byId.get(dragging) : undefined
              setDragging(null)
              setOver(null)
              if (lead) onMove(lead, s)
            }}
            className={cn(
              'w-[82%] max-w-[300px] shrink-0 snap-start rounded-3xl bg-navy-950/4 p-3 transition-colors sm:w-[264px]',
              over === s && 'bg-navy-950/10 ring-2 ring-navy-800/30',
            )}
          >
            <header className="flex items-center justify-between px-1 pb-1">
              <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-navy-950">
                <span className={cn('size-2 rounded-full', LEAD_STATUS_DOTS[s])} aria-hidden="true" />
                {LEAD_STATUS_LABELS[s]}
              </span>
              <span className="rounded-full bg-white px-2 text-[12px] font-semibold text-slate tabular-nums">{col.length}</span>
            </header>
            <p className="px-1 pb-2 text-[12px] text-slate">{LEAD_STATUS_HINTS[s]}</p>
            <ul className="space-y-2">
              {col.map((l) => {
                const p = propertyOf(l)
                return (
                  <li
                    key={l.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setData('text/plain', l.id)
                      setDragging(l.id)
                    }}
                    onDragEnd={() => {
                      setDragging(null)
                      setOver(null)
                    }}
                    className={cn(
                      'rounded-2xl bg-white p-3 shadow-card transition-shadow hover:shadow-float sm:cursor-grab',
                      l.status === 'new' && 'ring-2 ring-gold-500/60',
                      dragging === l.id && 'opacity-50',
                    )}
                  >
                    <Link to={`/dashboard/contatos/${l.id}`} className="block rounded-lg outline-offset-2">
                      <span className="flex items-start justify-between gap-2">
                        <span className="truncate text-[14.5px] font-semibold text-navy-950">{l.name || 'Sem nome'}</span>
                        <span className="shrink-0 text-[11.5px] text-slate">{formatWhen(l.created_at)}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-slate">
                        {p ? `${p.code ? `${p.code} · ` : ''}${p.title}` : LEAD_CHANNEL_LABELS[l.channel]}
                      </span>
                    </Link>
                    <label className="mt-2 flex items-center gap-2 text-[12px] text-slate">
                      <span className="shrink-0">Etapa</span>
                      <select
                        value={l.status}
                        onChange={(e) => onMove(l, e.target.value as LeadStatus)}
                        aria-label={`Mover ${l.name || 'contato'} para outra etapa`}
                        className="h-9 min-w-0 flex-1 rounded-full border border-navy-950/12 bg-white px-3 text-[13px] font-medium text-navy-950 outline-none focus:border-navy-800"
                      >
                        {stages.map((o) => (
                          <option key={o} value={o}>
                            {LEAD_STATUS_LABELS[o]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </li>
                )
              })}
              {col.length === 0 && (
                <li className="rounded-2xl border border-dashed border-navy-950/15 p-4 text-center text-[12.5px] text-slate">Vazio</li>
              )}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
