"use client";

import Link from "next/link";
import { useBravaData } from "@/lib/brava/context";
import { filterTanks } from "@/lib/brava/selectors";
import { buildTimeScale, monthTicks } from "@/lib/brava/timescale";
import { STATUS_META } from "@/lib/brava/status-meta";
import { formatShort } from "@/lib/brava/date-utils";
import FilterBar from "./FilterBar";
import SectionHeading from "./SectionHeading";

const LABEL_W = 150;
const CHART_W = 720;
const ROW_H = 40;

export default function ConsolidatedGantt() {
  const { tanks, filter, today } = useBravaData();
  // Excludes tanks with no activities/schedule (e.g. SEM_PROJETO — inspection-
  // only, no maintenance dates) — this Gantt is strictly the maintenance
  // schedule, never inspection dates.
  const filtered = filterTanks(tanks, filter).filter(
    (t) => t.status !== "CONCLUIDO" && t.derived.plannedStart !== ""
  );
  const ordered = [...filtered].sort((a, b) => a.derived.plannedStart.localeCompare(b.derived.plannedStart));

  if (ordered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-brava-md border border-dashed border-brava-border py-16 text-center">
        <p className="text-[13px] font-medium text-brava-text">Nenhum tanque no período selecionado</p>
        <p className="text-[12px] text-brava-text-secondary">Ajuste os filtros para visualizar o cronograma.</p>
      </div>
    );
  }

  const rangeStart = ordered.reduce((min, t) => (t.derived.plannedStart < min ? t.derived.plannedStart : min), ordered[0].derived.plannedStart);
  const rangeEnd = ordered.reduce((max, t) => (t.derived.plannedEnd > max ? t.derived.plannedEnd : max), ordered[0].derived.plannedEnd);
  const scale = buildTimeScale(rangeStart, rangeEnd, 10);
  const ticks = monthTicks(scale);
  const toPx = (iso: string) => (scale.toPercent(iso) / 100) * CHART_W;
  const todayPx = toPx(today);
  const showToday = todayPx >= 0 && todayPx <= CHART_W;

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white p-6 shadow-brava-sm sm:p-7">
      <SectionHeading
        eyebrow="Planejamento Consolidado"
        title="Cronograma Consolidado"
        subtitle="Sobreposição e sequência das manutenções ativas e programadas"
        actions={<FilterBar searchPlaceholder="Pesquisar TAG…" />}
      />

      <div className="brava-scrollbar overflow-x-auto">
        <div style={{ width: LABEL_W + CHART_W + 8 }}>
          <div className="flex border-b border-brava-border pb-2" style={{ height: 24 }}>
            <div style={{ width: LABEL_W }} />
            <div className="relative" style={{ width: CHART_W }}>
              {ticks.map((t) => (
                <span
                  key={t.iso}
                  className="absolute top-0 border-l border-brava-border/70 pl-1.5 text-[10px] text-brava-text-secondary"
                  style={{ left: (t.percent / 100) * CHART_W }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            {showToday && (
              <div
                className="pointer-events-none absolute top-0 z-10"
                style={{ left: LABEL_W + todayPx, height: ordered.length * ROW_H }}
              >
                <div className="h-full w-px bg-brava-blue-dark/70" />
                <span className="absolute -top-1 -translate-x-1/2 rounded-full bg-brava-blue-dark px-1.5 py-0.5 text-[9px] font-semibold text-brava-white">
                  HOJE
                </span>
              </div>
            )}

            {ordered.map((tank) => {
              const left = toPx(tank.derived.plannedStart);
              const width = Math.max(6, toPx(tank.derived.plannedEnd) - left);
              const meta = STATUS_META[tank.status];
              const barBg =
                tank.status === "EM_EXECUCAO"
                  ? "bg-brava-blue"
                  : tank.status === "CRITICO"
                    ? "bg-brava-danger"
                    : tank.status === "ATRASADO"
                      ? "bg-brava-warning"
                      : "bg-brava-border";

              return (
                <Link
                  key={tank.id}
                  href={`/brava/tanques/${tank.tag}`}
                  className="flex items-center hover:bg-brava-bg/60"
                  style={{ height: ROW_H }}
                >
                  <div style={{ width: LABEL_W }} className="pr-3">
                    <p className="truncate font-mono text-[12px] font-semibold text-brava-blue-dark">
                      {tank.tag}
                    </p>
                    <p className="truncate text-[10px] text-brava-text-secondary">{meta.label}</p>
                  </div>
                  <div className="relative" style={{ width: CHART_W, height: ROW_H }}>
                    <div
                      className={`absolute top-[11px] h-4 overflow-hidden rounded-brava-sm ${barBg}`}
                      style={{ left, width }}
                      title={`${tank.tag}: ${formatShort(tank.derived.plannedStart)} – ${formatShort(tank.derived.plannedEnd)}`}
                    >
                      {(tank.status === "EM_EXECUCAO" || tank.status === "ATRASADO" || tank.status === "CRITICO") && (
                        <div className="h-full bg-brava-accent" style={{ width: `${tank.derived.progress}%` }} />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 border-t border-brava-border pt-4 text-[11px] text-brava-text-secondary">
        <LegendDot className="bg-brava-blue" label="Em Execução" />
        <LegendDot className="bg-brava-warning" label="Atrasado" />
        <LegendDot className="bg-brava-danger" label="Crítico" />
        <LegendDot className="bg-brava-border" label="Programado" />
        <LegendDot className="bg-brava-accent" label="Avanço realizado" />
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2.5 w-3.5 rounded-[3px] ${className}`} />
      {label}
    </div>
  );
}
