import { Download, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button, ButtonLink } from '@/components/ui/Button'
import { downloadCsv, toCsv, today } from '@/dashboard/exportCsv'
import { LeadStatusBadge } from '@/dashboard/LeadStatusBadge'
import {
  LEAD_CHANNEL_LABELS,
  LEAD_STATUS_LABELS,
  formatWhen,
  listLeads,
  sourceLabel,
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
const FILTERS: Filter[] = ['open', 'new', 'contacted', 'visit_scheduled', 'negotiation', 'converted', 'lost', 'all']
const FILTER_LABELS: Record<Filter, string> = { ...LEAD_STATUS_LABELS, open: 'Em aberto', all: 'Todos' }
const isOpen = (s: LeadStatus) => s !== 'converted' && s !== 'lost'

export default function LeadList() {
  usePageTitle('Contatos · Painel')
  const ws = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const filter = (params.get('status') as Filter | null) ?? 'open'
  const { data, loading, error } = useAsyncData(
    async () => {
      const [leads, properties] = await Promise.all([listLeads(ws.tenantId), listProperties(ws.tenantId)])
      return { leads, properties: new Map(properties.map((p) => [p.id, p])) }
    },
    ws.tenantId,
  )

  const leads = data?.leads ?? []
  const propertyOf = (l: Lead) => (l.property_id ? data?.properties.get(l.property_id) : undefined)
  const matches = (l: Lead) => {
    if (!query) return true
    const p = propertyOf(l)
    const hay = normalizeText([l.name, l.phone, l.email, l.message, p?.title, p?.code].filter(Boolean).join(' '))
    return normalizeText(query)
      .split(/\s+/)
      .every((t) => hay.includes(t) || (/^\d+$/.test(t) && (l.phone ?? '').includes(t)))
  }
  const inFilter = (l: Lead, f: Filter) => (f === 'all' ? true : f === 'open' ? isOpen(l.status) : l.status === f)
  const visible = leads.filter((l) => inFilter(l, filter) && matches(l))

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
        <label className="relative block">
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
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Situação">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setParams(f === 'open' ? {} : { status: f }, { replace: true })}
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
      </div>

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
