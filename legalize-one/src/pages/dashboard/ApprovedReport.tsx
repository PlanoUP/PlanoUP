import { ArrowLeft, Download } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { STAGE_LABELS, formatCpf, listClients, type Client } from '@/dashboard/clientsApi'
import { downloadCsv, toCsv, today } from '@/dashboard/exportCsv'
import { listBrokers, listProperties } from '@/dashboard/propertiesApi'
import { useWorkspace } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/format'

const PERIODS = [
  { key: '30', label: '30 dias', days: 30 },
  { key: '90', label: '90 dias', days: 90 },
  { key: '365', label: '12 meses', days: 365 },
  { key: 'all', label: 'Tudo', days: null },
] as const
type PeriodKey = (typeof PERIODS)[number]['key']

const date = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')

/** Relatório de clientes aprovados: do mais recente ao mais antigo, com totais e por corretor. */
export default function ApprovedReport() {
  usePageTitle('Clientes aprovados · Painel')
  const ws = useWorkspace()
  const manager = ws.can('leads.view_all')
  const [period, setPeriod] = useState<PeriodKey>('90')
  const [now] = useState(() => Date.now())
  const { data, error, loading } = useAsyncData(async () => {
    const [clients, brokers, properties] = await Promise.all([
      listClients(ws.tenantId),
      manager ? listBrokers(ws.tenantId) : Promise.resolve([]),
      listProperties(ws.tenantId),
    ])
    return { clients, brokers: new Map(brokers.map((b) => [b.id, b.name])), properties: new Map(properties.map((p) => [p.id, p])) }
  }, `${ws.tenantId}:${manager}`)

  const days = PERIODS.find((p) => p.key === period)?.days ?? null
  const since = days === null ? 0 : now - days * 86_400_000
  const inPeriod = (c: Client) => new Date(c.stage_changed_at).getTime() >= since
  const all = data?.clients ?? []
  const approved = all.filter((c) => c.stage === 'approved' && inPeriod(c)).sort((a, b) => b.stage_changed_at.localeCompare(a.stage_changed_at))
  const decided = all.filter((c) => (c.stage === 'approved' || c.stage === 'rejected') && inPeriod(c)).length
  const rate = decided ? Math.round((approved.length / decided) * 100) : null
  const financed = approved.reduce((n, c) => n + (c.financing_value ?? 0), 0)
  const inProcess = all.filter((c) => c.stage === 'docs_pending' || c.stage === 'in_review').length
  const brokerName = (c: Client) => (c.broker_id ? (data?.brokers.get(c.broker_id) ?? 'Corretor') : 'Sem corretor')
  const propertyOf = (c: Client) => (c.property_id ? data?.properties.get(c.property_id) : undefined)

  const byBroker = [...approved.reduce((m, c) => m.set(brokerName(c), (m.get(brokerName(c)) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1])

  function exportCsv() {
    const csv = toCsv(approved, [
      { header: 'Aprovado em', value: (c) => date(c.stage_changed_at) },
      { header: 'Cliente', value: (c) => c.full_name },
      { header: 'CPF', value: (c) => formatCpf(c.cpf) },
      { header: 'Corretor', value: (c) => brokerName(c) },
      { header: 'Imóvel', value: (c) => { const p = propertyOf(c); return p ? `${p.code ? `${p.code} — ` : ''}${p.title}` : '' } },
      { header: 'Avaliação (R$)', value: (c) => c.appraisal_value },
      { header: 'Financiado (R$)', value: (c) => c.financing_value },
      { header: 'Renda (R$)', value: (c) => c.monthly_income },
    ])
    downloadCsv(`clientes-aprovados-${ws.tenantSlug}-${today()}.csv`, csv)
  }

  const stats = [
    { label: 'Aprovados no período', value: String(approved.length) },
    { label: 'Taxa de aprovação', value: rate === null ? '—' : `${rate}%`, hint: 'aprovados ÷ (aprovados + recusados)' },
    { label: 'Valor financiado', value: financed ? formatPrice(financed) : '—' },
    { label: 'Em processo agora', value: String(inProcess) },
  ]

  return (
    <div className="pb-24">
      <Link to="/dashboard/clientes" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-navy-800">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Clientes
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">Clientes aprovados</h1>
          <p className="mt-1 text-[14.5px] text-slate">{manager ? 'Toda a equipe, do mais recente ao mais antigo.' : 'Seus clientes aprovados, do mais recente ao mais antigo.'}</p>
        </div>
        <Button type="button" variant="outline" disabled={!approved.length} onClick={exportCsv}>
          <Download className="size-4" aria-hidden="true" />
          Exportar planilha
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Período">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={period === p.key}
            onClick={() => setPeriod(p.key)}
            className={cn('h-9 rounded-full px-4 text-[13.5px] font-semibold', period === p.key ? 'bg-navy-950 text-white' : 'bg-white text-navy-950 hover:bg-sand-200')}
          >
            {p.label}
          </button>
        ))}
      </div>

      {error ? (
        <p role="alert" className="mt-6 rounded-2xl bg-red-50 p-4 text-[15px] text-red-800">
          {error.message}
        </p>
      ) : loading && !data ? (
        <div className="mt-6 h-64 animate-pulse rounded-3xl bg-white/70" aria-busy="true" />
      ) : (
        <>
          <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white p-4 shadow-card">
                <dt className="text-[12.5px] font-semibold text-slate">{s.label}</dt>
                <dd className="mt-1 font-display text-[24px] font-bold text-navy-950 tabular-nums">{s.value}</dd>
                {s.hint && <dd className="text-[11.5px] text-slate">{s.hint}</dd>}
              </div>
            ))}
          </dl>

          {manager && byBroker.length > 0 && (
            <section className="mt-5 rounded-3xl bg-white p-5 shadow-card" aria-labelledby="por-corretor">
              <h2 id="por-corretor" className="font-display text-[17px] font-bold text-navy-950">
                Aprovados por corretor
              </h2>
              <ul className="mt-3 space-y-2">
                {byBroker.map(([name, n]) => (
                  <li key={name} className="flex items-center gap-3 text-[14px]">
                    <span className="w-40 shrink-0 truncate text-navy-950">{name}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-navy-950/6" aria-hidden="true">
                      <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${(n / byBroker[0][1]) * 100}%` }} />
                    </span>
                    <span className="w-8 text-right font-semibold text-navy-950 tabular-nums">{n}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {approved.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-navy-950/15 bg-white/60 p-8 text-center">
              <p className="text-[15px] text-slate">Nenhum cliente aprovado neste período.</p>
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {approved.map((c) => {
                const p = propertyOf(c)
                return (
                  <li key={c.id}>
                    <Link to={`/dashboard/clientes/${c.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-white p-4 shadow-card hover:shadow-float">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15.5px] font-semibold text-navy-950">{c.full_name}</span>
                        <span className="block truncate text-[13px] text-slate">
                          {[manager ? brokerName(c) : null, p ? `${p.code ? `${p.code} · ` : ''}${p.title}` : null].filter(Boolean).join(' · ') || STAGE_LABELS.approved}
                        </span>
                      </span>
                      <span className="text-right text-[13px]">
                        {c.financing_value !== null && <span className="block font-semibold text-navy-950 tabular-nums">{formatPrice(c.financing_value)}</span>}
                        <span className="text-slate">Aprovado em {date(c.stage_changed_at)}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
