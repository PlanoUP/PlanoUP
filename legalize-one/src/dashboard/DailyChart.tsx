import { useEffect, useId, useRef, useState } from 'react'
import type { DailyMetric } from './metricsApi'

const H = 220
const PAD = { top: 12, right: 8, bottom: 26, left: 36 }
const BAR = '#0b3158' // navy-800 — série única (o título diz o que é)
const GRID = '#efeae1' // sand-200

const dayLabel = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
const dayLong = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'UTC' })
const asDate = (day: string) => new Date(`${day}T00:00:00Z`)

/** Ticks "redondos" (0, 5, 10…) para o eixo. */
function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1]
  const raw = max / 4
  const pow = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw
  const ticks: number[] = []
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(Math.round(v))
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step)
  return ticks
}

/** Visitantes por dia: colunas finas, eixo único, dica ao passar o dedo/mouse e tabela equivalente. */
export function DailyChart({ data }: { data: DailyMetric[] }) {
  const [active, setActive] = useState<number | null>(null)
  // Desenha na largura real (texto do eixo sempre no tamanho legível, sem escalar).
  const box = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(720)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setW(Math.max(280, Math.round(entry.contentRect.width))))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const titleId = useId()
  const max = Math.max(0, ...data.map((d) => d.visitors))
  const ticks = niceTicks(max)
  const top = ticks[ticks.length - 1] || 1
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const slot = plotW / Math.max(1, data.length)
  const barW = Math.max(2, Math.min(24, slot - 2))
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH
  const labelEvery = Math.ceil(data.length / Math.max(3, Math.floor(plotW / 64)))
  const current = active !== null ? data[active] : null

  return (
    <div className="relative" ref={box}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="block max-w-full touch-pan-y select-none"
        role="img"
        aria-labelledby={titleId}
        onPointerLeave={() => setActive(null)}
      >
        <title id={titleId}>Visitantes por dia</title>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-slate text-[11px] tabular-nums">
              {t.toLocaleString('pt-BR')}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = PAD.left + i * slot + (slot - barW) / 2
          const h = Math.max(0, y(0) - y(d.visitors))
          const r = Math.min(4, barW / 2, h)
          return (
            <g key={d.day}>
              {h > 0 && (
                <path
                  d={`M${x},${y(0)} V${y(0) - h + r} Q${x},${y(0) - h} ${x + r},${y(0) - h} H${x + barW - r} Q${x + barW},${y(0) - h} ${x + barW},${y(0) - h + r} V${y(0)} Z`}
                  fill={BAR}
                  opacity={active === null || active === i ? 1 : 0.45}
                />
              )}
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={H - 8} textAnchor="middle" className="fill-slate text-[11px] tabular-nums">
                  {dayLabel.format(asDate(d.day))}
                </text>
              )}
              {/* Área de toque maior que a coluna */}
              <rect
                x={PAD.left + i * slot}
                y={PAD.top}
                width={slot}
                height={plotH}
                fill="transparent"
                tabIndex={0}
                aria-label={`${dayLong.format(asDate(d.day))}: ${d.visitors} visitantes`}
                onPointerEnter={() => setActive(i)}
                onPointerDown={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            </g>
          )
        })}
        <line x1={PAD.left} x2={W - PAD.right} y1={y(0)} y2={y(0)} stroke="#e4dccd" strokeWidth={1} />
      </svg>

      {current && active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-0 rounded-xl bg-white px-3 py-2 text-[12.5px] shadow-float ring-1 ring-navy-950/8"
          style={{
            left: `${((PAD.left + active * slot + slot / 2) / W) * 100}%`,
            transform: `translateX(${active > data.length / 2 ? '-100%' : '0'})`,
          }}
        >
          <p className="font-semibold text-navy-950 capitalize">{dayLong.format(asDate(current.day))}</p>
          <p className="text-slate">
            <strong className="text-navy-950 tabular-nums">{current.visitors}</strong> visitantes
          </p>
          <p className="text-slate">
            <strong className="text-navy-950 tabular-nums">{current.contacts}</strong> cliques para contato
          </p>
          <p className="text-slate">
            <strong className="text-navy-950 tabular-nums">{current.leads}</strong> contatos recebidos
          </p>
        </div>
      )}

      <details className="mt-2 text-[13px] text-slate">
        <summary className="cursor-pointer font-semibold text-navy-800">Ver em tabela</summary>
        <div className="mt-2 max-h-64 overflow-auto">
          <table className="w-full text-left tabular-nums">
            <thead>
              <tr className="text-navy-950">
                <th className="py-1 pr-3 font-semibold">Dia</th>
                <th className="py-1 pr-3 font-semibold">Visitantes</th>
                <th className="py-1 pr-3 font-semibold">Cliques p/ contato</th>
                <th className="py-1 font-semibold">Contatos</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.day} className="border-t border-navy-950/6">
                  <td className="py-1 pr-3">{dayLabel.format(asDate(d.day))}</td>
                  <td className="py-1 pr-3">{d.visitors}</td>
                  <td className="py-1 pr-3">{d.contacts}</td>
                  <td className="py-1">{d.leads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
