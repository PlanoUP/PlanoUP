import { ArrowDownRight, ArrowUpRight, Info, Minus } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Section } from '@/dashboard/FormParts'
import { DailyChart } from '@/dashboard/DailyChart'
import { CONVERSION_LABELS, CONVERSION_RULE, conversionPotential, type ConversionLevel } from '@/dashboard/conversion'
import { delta, getMetrics, PERIODS, sourceName, type MetricTotals, type PeriodDays, type TenantMetrics } from '@/dashboard/metricsApi'
import { useWorkspace } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/cn'

const fmt = (n: number) => n.toLocaleString('pt-BR')
const pct = (n: number) => `${Math.round(n * 100)}%`

function Delta({ current, previous, days }: { current: number; previous: number; days: number }) {
  const d = delta(current, previous)
  if (d === null) return <span className="text-[12.5px] text-slate">sem base anterior</span>
  const Icon = d > 0.005 ? ArrowUpRight : d < -0.005 ? ArrowDownRight : Minus
  return (
    <span className="block text-[12.5px]">
      <span className={cn('inline-flex items-center gap-1 font-semibold', d > 0.005 ? 'text-tour' : d < -0.005 ? 'text-red-700' : 'text-slate')}>
        <Icon className="size-3.5" aria-hidden="true" />
        {d > 0 ? '+' : ''}
        {pct(d)}
      </span>{' '}
      <span className="whitespace-nowrap text-slate">vs {days} dias antes</span>
    </span>
  )
}

function Tile({ label, value, previous, days }: { label: string; value: number; previous: number; days: number }) {
  return (
    <li className="rounded-2xl bg-white p-4 shadow-card">
      <p className="text-[13.5px] text-slate">{label}</p>
      <p className="mt-1 font-display text-[28px] font-bold text-navy-950 tabular-nums">{fmt(value)}</p>
      <Delta current={value} previous={previous} days={days} />
    </li>
  )
}

/** Barras horizontais de uma série (funil, origens): valor na ponta, rótulo em texto. */
function HBars({ rows, max }: { rows: { label: string; value: number; note?: string }[]; max: number }) {
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-[14px]">
            <span className="text-navy-950">{r.label}</span>
            <span className="shrink-0 font-semibold text-navy-950 tabular-nums">
              {fmt(r.value)}
              {r.note && <span className="ml-1.5 font-normal text-slate">{r.note}</span>}
            </span>
          </div>
          <div className="mt-1.5 h-2.5 rounded-full bg-sand-200">
            <div
              className="h-full rounded-full bg-navy-800"
              style={{ width: `${max ? Math.max(r.value ? 2 : 0, (r.value / max) * 100) : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

const LEVEL_TONES: Record<ConversionLevel, string> = {
  high: 'bg-tour text-white',
  medium: 'bg-gold-500 text-navy-950',
  low: 'bg-navy-950/10 text-navy-950',
  insufficient: 'bg-sand-300 text-slate',
}

function Funnel({ t }: { t: MetricTotals }) {
  const base = t.visitors
  const of = (n: number) => (base ? `${pct(n / base)}` : undefined)
  return (
    <HBars
      max={base}
      rows={[
        { label: 'Visitantes no site', value: base },
        { label: 'Abriram um imóvel', value: t.property_viewers, note: of(t.property_viewers) },
        { label: 'Usaram o 3D ou o tour', value: t.immersive_sessions, note: of(t.immersive_sessions) },
        { label: 'Chamaram (WhatsApp/visita)', value: t.intent_sessions, note: of(t.intent_sessions) },
        { label: 'Viraram contato no painel', value: t.leads },
      ]}
    />
  )
}

function Sources({ m }: { m: TenantMetrics }) {
  const merged = new Map<string, number>()
  for (const s of m.sources) merged.set(sourceName(s.source), (merged.get(sourceName(s.source)) ?? 0) + s.visitors)
  const rows = [...merged.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }))
  if (!rows.length) return <p className="text-[14px] text-slate">Sem visitas no período.</p>
  return <HBars rows={rows} max={rows[0].value} />
}

function PropertyRanking({ m }: { m: TenantMetrics }) {
  const rows = m.properties.map((p) => ({ p, c: conversionPotential(p) }))
  if (!rows.length) return <p className="text-[14px] text-slate">Nenhum imóvel ativo.</p>
  return (
    <ul className="divide-y divide-navy-950/6">
      {rows.map(({ p, c }) => (
        <li key={p.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1">
            <Link to={`/dashboard/imoveis/${p.id}`} className="block truncate text-[15.5px] font-semibold text-navy-950 hover:underline">
              {p.code ? `${p.code} — ` : ''}
              {p.title}
            </Link>
            <p className="mt-0.5 text-[13px] text-slate tabular-nums">
              {fmt(p.viewers)} visitantes · {fmt(p.model3d_opens + p.tour_opens)} aberturas de 3D/tour ·{' '}
              {fmt(p.whatsapp_clicks + p.visit_requests)} cliques p/ contato · {fmt(p.leads)} contatos
            </p>
            <p className="mt-1 text-[13px] text-navy-950/80">{c.tip}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
            <span className={cn('inline-flex h-7 items-center rounded-full px-3 text-[12.5px] font-semibold', LEVEL_TONES[c.level])}>
              {CONVERSION_LABELS[c.level]}
              {c.score !== null && <span className="ml-1.5 tabular-nums">{c.score}</span>}
            </span>
            {c.level !== 'insufficient' && (
              <span className="text-[12px] text-slate tabular-nums">
                contato {pct(c.contactRate)} · imersão {pct(c.immersiveRate)}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Results() {
  usePageTitle('Resultados · Painel')
  const ws = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [showRule, setShowRule] = useState(false)
  const requested = Number(params.get('dias'))
  const days: PeriodDays = (PERIODS as readonly number[]).includes(requested) ? (requested as PeriodDays) : 30
  const allowed = ws.can('analytics.view')
  const { data: m, loading, error } = useAsyncData(
    () => (allowed ? getMetrics(ws.tenantId, days) : Promise.resolve(null)),
    `${ws.tenantId}:${days}:${allowed}`,
  )

  if (!allowed) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card">
        <p className="text-[15px] text-slate">Os resultados da imobiliária ficam disponíveis para os gerentes.</p>
      </div>
    )
  }

  const t = m?.totals
  const p = m?.previous
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">Resultados</h1>
          <p className="mt-1 text-[14.5px] text-slate">Como o site está trazendo interesse para os seus imóveis.</p>
        </div>
        <div role="tablist" aria-label="Período" className="flex gap-2">
          {PERIODS.map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={days === d}
              onClick={() => setParams(d === 30 ? {} : { dias: String(d) }, { replace: true })}
              className={cn(
                'h-9 rounded-full px-4 text-[13.5px] font-semibold transition-colors',
                days === d ? 'bg-navy-950 text-white' : 'bg-white text-navy-950 hover:bg-sand-200',
              )}
            >
              {d} dias
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-2xl bg-red-50 p-4 text-[15px] text-red-800">
          {error.message}
        </p>
      ) : loading || !m || !t || !p ? (
        <div className="space-y-4" aria-busy="true">
          <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
          <div className="h-64 animate-pulse rounded-3xl bg-white/70" />
        </div>
      ) : (
        <>
          {t.visitors === 0 && (
            <p className="flex items-start gap-2 rounded-2xl bg-white p-4 text-[14.5px] text-navy-950 shadow-card">
              <Info className="mt-0.5 size-4 shrink-0 text-slate" aria-hidden="true" />
              Ainda não há visitas neste período. Os números aparecem conforme o site recebe acessos.
            </p>
          )}

          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Tile label="Visitantes" value={t.visitors} previous={p.visitors} days={days} />
            <Tile label="Imóveis vistos" value={t.property_views} previous={p.property_views} days={days} />
            <Tile label="Aberturas de 3D e tour" value={t.model3d_opens + t.tour_opens} previous={p.model3d_opens + p.tour_opens} days={days} />
            <Tile label="Cliques para contato" value={t.whatsapp_clicks + t.visit_requests} previous={p.whatsapp_clicks + p.visit_requests} days={days} />
            <Tile label="Contatos recebidos" value={t.leads} previous={p.leads} days={days} />
          </ul>

          <Section title="Visitantes por dia">
            <DailyChart data={m.daily} />
          </Section>

          <div className="grid gap-5 lg:grid-cols-2">
            <Section title="Do clique ao contato" description="Pessoas (sessões) em cada etapa, no período.">
              <Funnel t={t} />
            </Section>
            <Section title="De onde vêm os visitantes">
              <Sources m={m} />
            </Section>
          </div>

          <Section title="Potencial de Conversão por imóvel" description="Quais imóveis transformam visita em interesse.">
            <button
              type="button"
              onClick={() => setShowRule((v) => !v)}
              aria-expanded={showRule}
              className="-mt-2 mb-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-navy-800 hover:underline"
            >
              <Info className="size-4" aria-hidden="true" />
              Como calculamos
            </button>
            {showRule && (
              <div className="mb-5 rounded-2xl bg-sand p-4 text-[14px] leading-relaxed text-navy-950">
                <p>
                  <strong>Taxa de contato</strong>: visitantes do imóvel que chamaram no WhatsApp ou pediram visita (mais os
                  contatos registrados), divididos pelos visitantes do imóvel. {pct(CONVERSION_RULE.contactTarget)} ou mais vale nota
                  máxima.
                </p>
                <p className="mt-2">
                  <strong>Taxa de imersão</strong>: visitantes que abriram o 3D ou o tour. {pct(CONVERSION_RULE.immersiveTarget)} ou
                  mais vale nota máxima.
                </p>
                <p className="mt-2">
                  <strong>Nota</strong> (0 a 100) = {pct(CONVERSION_RULE.contactWeight)} contato + {pct(CONVERSION_RULE.immersiveWeight)}{' '}
                  imersão (sem 3D/tour, só contato). Alto: 70+ · Médio: 40–69 · Baixo: abaixo de 40. Com menos de{' '}
                  {CONVERSION_RULE.minViewers} visitantes no período, o imóvel aparece como "Poucos dados".
                </p>
              </div>
            )}
            <PropertyRanking m={m} />
          </Section>
        </>
      )}
    </div>
  )
}
