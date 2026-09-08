"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { buildTimeScale, monthTicks } from "@/lib/brava/timescale";
import SectionHeading from "./SectionHeading";

const MAX_ROWS = 6;

export default function ProgramOverviewMini() {
  const { tanks } = useBravaData();
  const active = tanks.filter((t) => t.status !== "CONCLUIDO");
  const ordered = [...active].sort((a, b) => a.derived.plannedStart.localeCompare(b.derived.plannedStart)).slice(0, MAX_ROWS);

  if (ordered.length === 0) return null;

  const rangeStart = ordered.reduce((min, t) => (t.derived.plannedStart < min ? t.derived.plannedStart : min), ordered[0].derived.plannedStart);
  const rangeEnd = ordered.reduce((max, t) => (t.derived.plannedEnd > max ? t.derived.plannedEnd : max), ordered[0].derived.plannedEnd);
  const scale = buildTimeScale(rangeStart, rangeEnd, 8);
  const ticks = monthTicks(scale);

  return (
    <div>
      <SectionHeading
        eyebrow="Planejamento"
        title="Visão do Programa"
        subtitle="Distribuição das manutenções ativas e programadas nos próximos meses"
        actions={
          <Link
            href="/brava/consolidado"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brava-blue hover:text-brava-blue-dark"
          >
            Cronograma completo
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <div id="cronograma" className="scroll-mt-24 rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm sm:p-6">
        <div className="flex">
          <div className="w-28 shrink-0 sm:w-36" />
          <div className="relative h-5 flex-1">
            {ticks.map((t) => (
              <span
                key={t.iso}
                className="absolute top-0 text-[10.5px] font-medium uppercase tracking-wide text-brava-text-secondary"
                style={{ left: `${t.percent}%` }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-1 flex flex-col gap-1">
          {ordered.map((tank) => {
            const left = scale.toPercent(tank.derived.plannedStart);
            const width = Math.max(1.5, scale.toPercent(tank.derived.plannedEnd) - left);
            const barColor =
              tank.status === "CRITICO"
                ? "bg-brava-danger"
                : tank.status === "ATRASADO"
                  ? "bg-brava-warning"
                  : tank.status === "EM_EXECUCAO"
                    ? "bg-brava-blue"
                    : "bg-brava-border";

            return (
              <Link
                key={tank.id}
                href={`/brava/tanques/${tank.tag}`}
                className="group flex items-center rounded-brava-sm py-2 transition-colors hover:bg-brava-bg"
              >
                <div className="w-28 shrink-0 pr-2 sm:w-36">
                  <p className="truncate font-mono text-[12.5px] font-semibold text-brava-blue-dark">{tank.tag}</p>
                </div>
                <div className="relative h-5 flex-1">
                  <div
                    className={`absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full ${barColor} transition-transform group-hover:scale-y-125`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                    {(tank.status === "EM_EXECUCAO" || tank.status === "ATRASADO" || tank.status === "CRITICO") && (
                      <div
                        className="h-full rounded-full bg-brava-accent"
                        style={{ width: `${tank.derived.progress}%` }}
                      />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
