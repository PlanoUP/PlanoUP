"use client";

import { TankWithDerived } from "@/lib/brava/types";
import { INSPECTION_CRITICALITY_META, formatDaysToInspection } from "@/lib/brava/inspection";
import { STATUS_META } from "@/lib/brava/status-meta";
import { formatShort } from "@/lib/brava/date-utils";
import { cn } from "@/lib/brava/cn";

export default function MapHotspot({
  tag,
  x,
  y,
  tank,
  highlighted,
  onSelect,
}: {
  tag: string;
  x: number;
  y: number;
  tank: TankWithDerived | null;
  highlighted?: boolean;
  onSelect: () => void;
}) {
  const criticality = tank?.derived.inspectionCriticality ?? "SEM_DATA";
  const meta = INSPECTION_CRITICALITY_META[criticality];
  // "Em manutenção" = actively being worked (or overdue while being worked),
  // as opposed to not yet started (PROGRAMADO), done (CONCLUIDO) or
  // unplanned (SEM_PROJETO) — these are the statuses where a progress
  // percentage is actually meaningful to show at a glance on the map.
  const inMaintenance = tank ? ["EM_EXECUCAO", "ATRASADO", "CRITICO"].includes(tank.status) : false;
  const statusMeta = tank ? STATUS_META[tank.status] : null;
  const lineClass = tank ? STATUS_LINE_CLASS[tank.status] : undefined;
  const callout = getCalloutOffset(x, y);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group/hotspot absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation"
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-label={tag}
    >
      {highlighted && (
        <span className={cn("absolute inset-0 -m-3 animate-ping rounded-full opacity-50", meta.dotClass)} />
      )}
      <span
        className={cn(
          "absolute inset-0 -m-2 scale-0 rounded-full opacity-0 transition-all duration-150 group-hover/hotspot:scale-100 group-hover/hotspot:opacity-25",
          meta.dotClass
        )}
      />
      <span
        className={cn(
          "relative block h-3 w-3 rounded-full border-2 border-brava-white shadow-brava-md transition-transform duration-150 group-hover/hotspot:scale-125",
          meta.dotClass,
          highlighted && "scale-150"
        )}
      />

      {tank && inMaintenance && statusMeta && (
        <>
          <svg
            className="pointer-events-none absolute z-10 overflow-visible"
            style={{ left: callout.svgLeft, top: callout.svgTop, width: callout.svgWidth, height: callout.svgHeight }}
            viewBox={`0 0 ${callout.svgWidth} ${callout.svgHeight}`}
          >
            <path
              d={`M ${callout.dotLocalX} ${callout.dotLocalY} L ${callout.dotLocalX} ${callout.boxLocalY} L ${callout.boxLocalX} ${callout.boxLocalY}`}
              fill="none"
              strokeWidth={1.5}
              className={lineClass}
            />
          </svg>
          <span
            className={cn(
              "pointer-events-none absolute z-20 flex w-[90px] -translate-x-1/2 -translate-y-1/2 flex-col gap-1.5 whitespace-nowrap rounded-brava-sm px-2 py-1.5 shadow-brava-lg",
              statusMeta.dotClass
            )}
            style={{ left: callout.dx, top: callout.dy }}
          >
            <span className="flex items-center justify-between gap-1.5">
              <span className="font-mono text-[10px] font-bold text-brava-white">{tag}</span>
              <span className="text-[10px] font-extrabold text-brava-white">{tank.derived.progress}%</span>
            </span>
            <span className="h-[4px] w-full overflow-hidden rounded-full bg-brava-white/25">
              <span
                className="block h-full rounded-full bg-brava-white transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(4, Math.min(100, tank.derived.progress))}%` }}
              />
            </span>
          </span>
        </>
      )}

      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2.5 w-max min-w-[160px] max-w-[220px] -translate-x-1/2 rounded-brava-sm bg-brava-blue-dark px-3 py-2 text-left opacity-0 shadow-brava-lg transition-opacity duration-150 group-hover/hotspot:opacity-100">
        <span className="block font-mono text-[12px] font-bold text-brava-white">{tag}</span>
        {tank ? (
          <>
            <span className="mt-0.5 block text-[10.5px] text-brava-white/80">{tank.product}</span>
            <span className="mt-1 block text-[10.5px] font-semibold text-brava-white">
              {STATUS_LABEL[tank.status] ?? tank.status}
            </span>
            {inMaintenance && statusMeta && (
              <span className="mt-1.5 flex items-center gap-1.5">
                <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-brava-white/20">
                  <span
                    className={cn("block h-full rounded-full", statusMeta.dotClass)}
                    style={{ width: `${Math.max(4, Math.min(100, tank.derived.progress))}%` }}
                  />
                </span>
                <span className="text-[10.5px] font-bold text-brava-white">Avanço: {tank.derived.progress}%</span>
              </span>
            )}
            <span className="mt-1 block text-[10px] text-brava-white/70">
              Próxima inspeção: {tank.nextInternalInspection ? formatShort(tank.nextInternalInspection) : "A definir"}
              {tank.nextInternalInspection && ` · ${formatDaysToInspection(tank.derived.daysToInternalInspection)}`}
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-brava-white">
              <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotClass)} />
              {meta.label}
            </span>
          </>
        ) : (
          <span className="mt-0.5 block text-[10.5px] text-brava-white/70">Dashboard não cadastrado</span>
        )}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-brava-blue-dark" />
      </span>
    </button>
  );
}

const STATUS_LABEL: Record<string, string> = {
  PROGRAMADO: "Programado",
  EM_EXECUCAO: "Em Manutenção",
  CONCLUIDO: "Manutenção Concluída",
  ATRASADO: "Atrasado",
  CRITICO: "Crítico",
  SEM_PROJETO: "Sem Projeto de Manutenção",
};

// Literal class names (not built dynamically) so Tailwind's content scanner
// keeps them in the production build.
const STATUS_LINE_CLASS: Record<string, string> = {
  EM_EXECUCAO: "stroke-brava-blue",
  ATRASADO: "stroke-brava-warning",
  CRITICO: "stroke-brava-danger",
};

const CALLOUT_DX = 58;
const CALLOUT_DY = 44;

/**
 * Pulls the progress callout away from the dot into open space instead of
 * sitting directly on top of it, connected by an elbow leader line — same
 * convention as the reference satellite maps (label box off to the side,
 * line running back to the tank). Flips toward the opposite edge when the
 * dot is close enough to the image border that the default direction would
 * push the box (and its line) off-canvas.
 */
function getCalloutOffset(xPct: number, yPct: number) {
  const dx = (xPct > 62 ? -1 : 1) * CALLOUT_DX;
  const dy = (yPct < 20 ? 1 : -1) * CALLOUT_DY;
  const svgLeft = Math.min(0, dx);
  const svgTop = Math.min(0, dy);
  const svgWidth = Math.max(Math.abs(dx), 1);
  const svgHeight = Math.max(Math.abs(dy), 1);
  return {
    dx,
    dy,
    svgLeft,
    svgTop,
    svgWidth,
    svgHeight,
    dotLocalX: -svgLeft,
    dotLocalY: -svgTop,
    boxLocalX: dx - svgLeft,
    boxLocalY: dy - svgTop,
  };
}
