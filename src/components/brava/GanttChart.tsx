"use client";

import { Diamond } from "lucide-react";
import { Activity } from "@/lib/brava/types";
import { buildTimeScale, monthTicks } from "@/lib/brava/timescale";
import { formatShort } from "@/lib/brava/date-utils";
import { useBravaData } from "@/lib/brava/context";
import { cn } from "@/lib/brava/cn";
import SectionHeading from "./SectionHeading";

const LABEL_W = 190;
const CHART_W = 660;
const ROW_H = 38;

export default function GanttChart({ activities }: { activities: Activity[] }) {
  const { today } = useBravaData();
  const ordered = [...activities].sort((a, b) => a.order - b.order);
  if (ordered.length === 0) return null;

  const rangeStart = [ordered[0].baselineStart, ordered[0].plannedStart].sort()[0];
  const rangeEndCandidates = [
    ordered[ordered.length - 1].baselineEnd,
    ordered[ordered.length - 1].plannedEnd,
  ];
  const rangeEnd = rangeEndCandidates.sort().reverse()[0];
  const scale = buildTimeScale(rangeStart, rangeEnd, 6);
  const ticks = monthTicks(scale);
  const toPx = (iso: string) => (scale.toPercent(iso) / 100) * CHART_W;
  const todayPx = toPx(today);
  const showToday = todayPx >= 0 && todayPx <= CHART_W;

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white p-6 shadow-brava-sm sm:p-7">
      <SectionHeading
        eyebrow="Planejamento Detalhado"
        title="Macrocronograma"
        actions={
          <div className="flex flex-wrap gap-4 text-[11px] text-brava-text-secondary">
            <Legend swatchClass="border border-dashed border-brava-text-secondary/50" label="Baseline" />
            <Legend swatchClass="bg-brava-blue" label="Planejado" />
            <Legend swatchClass="bg-brava-accent" label="Atual" />
            <Legend swatchClass="bg-brava-blue-dark" label="Realizado" />
          </div>
        }
      />

      <div className="brava-scrollbar overflow-x-auto">
        <div style={{ width: LABEL_W + CHART_W + 8 }}>
          {/* Month axis */}
          <div className="flex border-b border-brava-border pb-2" style={{ height: 24 }}>
            <div style={{ width: LABEL_W }} />
            <div className="relative" style={{ width: CHART_W }}>
              {ticks.map((t) => (
                <span
                  key={t.iso}
                  className="absolute top-0 text-[10px] text-brava-text-secondary"
                  style={{ left: (t.percent / 100) * CHART_W }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="relative">
            {showToday && (
              <div
                className="pointer-events-none absolute top-0 z-10 flex flex-col items-center"
                style={{ left: LABEL_W + todayPx, height: ordered.length * ROW_H }}
              >
                <div className="h-full w-px bg-brava-blue-dark/70" />
              </div>
            )}
            {showToday && (
              <span
                className="absolute z-10 -translate-x-1/2 rounded-full bg-brava-blue-dark px-1.5 py-0.5 text-[9px] font-semibold text-brava-white"
                style={{ left: LABEL_W + todayPx, top: -2 }}
              >
                HOJE
              </span>
            )}

            {ordered.map((activity) => {
              const baselineLeft = toPx(activity.baselineStart);
              const baselineWidth = Math.max(4, toPx(activity.baselineEnd) - baselineLeft);
              const plannedLeft = toPx(activity.plannedStart);
              const plannedWidth = Math.max(4, toPx(activity.plannedEnd) - plannedLeft);
              const showBaseline =
                activity.baselineStart !== activity.plannedStart || activity.baselineEnd !== activity.plannedEnd;

              const barColor =
                activity.status === "CONCLUIDO"
                  ? "bg-brava-blue-dark"
                  : activity.status === "ATUAL"
                    ? "bg-brava-blue"
                    : "bg-brava-border";

              return (
                <div key={activity.id} className="flex items-center" style={{ height: ROW_H }}>
                  <div style={{ width: LABEL_W }} className="pr-3">
                    <p className="truncate text-[12px] font-medium text-brava-text" title={activity.name}>
                      {activity.name}
                    </p>
                    <p className="text-[10px] text-brava-text-secondary">
                      {formatShort(activity.plannedStart)} – {formatShort(activity.plannedEnd)}
                    </p>
                  </div>
                  <div className="relative" style={{ width: CHART_W, height: ROW_H }}>
                    {showBaseline && (
                      <div
                        className="absolute top-[7px] h-1 rounded-full border border-dashed border-brava-text-secondary/50"
                        style={{ left: baselineLeft, width: baselineWidth }}
                      />
                    )}

                    {activity.isMilestone ? (
                      <Diamond
                        className={cn(
                          "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2",
                          activity.status === "CONCLUIDO"
                            ? "fill-brava-blue-dark text-brava-blue-dark"
                            : activity.status === "ATUAL"
                              ? "fill-brava-accent text-brava-blue-dark"
                              : "fill-brava-white text-brava-border"
                        )}
                        style={{ left: plannedLeft }}
                        strokeWidth={1.5}
                      />
                    ) : (
                      <div
                        className={cn("absolute top-[11px] h-4 overflow-hidden rounded-brava-sm", barColor)}
                        style={{ left: plannedLeft, width: plannedWidth }}
                      >
                        {activity.status === "ATUAL" && (
                          <div
                            className="h-full bg-brava-accent"
                            style={{ width: `${activity.progress}%` }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ swatchClass, label }: { swatchClass: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-2.5 w-3.5 rounded-[3px]", swatchClass)} />
      {label}
    </div>
  );
}
