import { Download, ImageOff, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button, ButtonLink } from '@/components/ui/Button'
import { downloadCsv, toCsv, today } from '@/dashboard/exportCsv'
import { StatusBadge } from '@/dashboard/StatusBadge'
import {
  listProperties,
  PURPOSE_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
  type PropertyStatus,
  type PropertySummary,
} from '@/dashboard/propertiesApi'
import { useWorkspace } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/cn'
import { formatPrice, normalizeText } from '@/utils/format'

const FILTERS: (PropertyStatus | 'all')[] = ['all', 'published', 'draft', 'sold', 'rented', 'archived']

function matches(p: PropertySummary, query: string) {
  if (!query) return true
  const haystack = normalizeText([p.title, p.code, p.neighborhood, p.city, TYPE_LABELS[p.type]].filter(Boolean).join(' '))
  return normalizeText(query)
    .split(/\s+/)
    .every((term) => haystack.includes(term))
}

export default function PropertyList() {
  usePageTitle('Imóveis · Painel')
  const ws = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const status = (params.get('status') as PropertyStatus | null) ?? 'all'
  const { data, loading, error } = useAsyncData(() => listProperties(ws.tenantId), ws.tenantId)

  const all = data ?? []
  const visible = all.filter((p) => (status === 'all' || p.status === status) && matches(p, query))
  function exportProperties() {
    const csv = toCsv(all, [
      { header: 'Código', value: (p) => p.code },
      { header: 'Título', value: (p) => p.title },
      { header: 'Tipo', value: (p) => TYPE_LABELS[p.type] },
      { header: 'Finalidade', value: (p) => PURPOSE_LABELS[p.purpose] },
      { header: 'Status', value: (p) => STATUS_LABELS[p.status] },
      { header: 'Preço (R$)', value: (p) => p.price },
      { header: 'Bairro', value: (p) => p.neighborhood },
      { header: 'Cidade', value: (p) => p.city },
      { header: 'Link no site', value: (p) => (p.status === 'published' ? `${window.location.origin}/imovel/${p.slug}` : '') },
      { header: 'Atualizado em', value: (p) => new Date(p.updated_at).toLocaleString('pt-BR') },
    ])
    downloadCsv(`imoveis-${ws.tenantSlug}-${today()}.csv`, csv)
  }
  const countOf = (s: PropertyStatus | 'all') => (s === 'all' ? all.length : all.filter((p) => p.status === s).length)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">Imóveis</h1>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={!all.length} onClick={exportProperties}>
            <Download className="size-4" aria-hidden="true" />
            Exportar planilha
          </Button>
          {ws.can('properties.create') && (
            <ButtonLink to="/dashboard/imoveis/novo">
              <Plus className="size-4" aria-hidden="true" />
              Cadastrar imóvel
            </ButtonLink>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <label className="relative block">
          <span className="sr-only">Buscar imóvel</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, código, bairro ou cidade"
            className="h-12 w-full rounded-full border border-navy-950/12 bg-white pr-4 pl-11 text-[16px] text-navy-950 outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-800/15"
          />
        </label>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Status">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={status === f}
              onClick={() => setParams(f === 'all' ? {} : { status: f }, { replace: true })}
              className={cn(
                'h-9 shrink-0 rounded-full px-4 text-[13.5px] font-semibold transition-colors',
                status === f ? 'bg-navy-950 text-white' : 'bg-white text-navy-950 hover:bg-sand-200',
              )}
            >
              {f === 'all' ? 'Todos' : STATUS_LABELS[f]}
              {data && <span className="ml-1.5 opacity-60 tabular-nums">{countOf(f)}</span>}
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
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-card">
          <p className="text-[15px] text-slate">
            {all.length === 0 ? 'Nenhum imóvel cadastrado ainda.' : 'Nenhum imóvel encontrado com esses filtros.'}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((p) => {
            const mine = ws.brokerId !== null && p.broker_id === ws.brokerId
            return (
              <li key={p.id}>
                <Link
                  to={`/dashboard/imoveis/${p.id}`}
                  className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-card transition-shadow hover:shadow-float sm:p-4"
                >
                  <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sand-200 sm:h-20 sm:w-28">
                    {p.cover_image_url ? (
                      <img src={p.cover_image_url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                    ) : (
                      <ImageOff className="size-5 text-slate" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={p.status} />
                      {p.code && <span className="text-[12.5px] font-semibold text-slate">{p.code}</span>}
                      {mine && <span className="text-[12.5px] font-semibold text-gold-600">Seu imóvel</span>}
                    </span>
                    <span className="mt-1 block truncate text-[16px] font-semibold text-navy-950">{p.title}</span>
                    <span className="block truncate text-[13.5px] text-slate">
                      {TYPE_LABELS[p.type]} · {PURPOSE_LABELS[p.purpose]}
                      {p.neighborhood || p.city ? ` · ${[p.neighborhood, p.city].filter(Boolean).join(', ')}` : ''}
                    </span>
                    {p.price !== null && (
                      <span className="mt-0.5 block text-[14px] font-semibold text-navy-950 tabular-nums sm:hidden">
                        {formatPrice(p.price)}
                        {p.purpose === 'aluguel' && <span className="text-[12px] font-normal text-slate">/mês</span>}
                      </span>
                    )}
                  </span>
                  <span className="hidden shrink-0 text-right text-[15px] font-semibold text-navy-950 tabular-nums sm:block">
                    {p.price !== null ? formatPrice(p.price) : '—'}
                    {p.purpose === 'aluguel' && p.price !== null && <span className="text-[12px] text-slate">/mês</span>}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
