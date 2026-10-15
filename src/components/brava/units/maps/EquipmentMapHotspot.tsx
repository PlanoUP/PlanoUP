"use client";

import { EquipmentWithDerived } from "@/lib/brava/units/types";
import { STATUS_META } from "@/lib/brava/status-meta";
import { CalloutOffset, hashTag } from "@/lib/brava/maps/calloutLayout";
import { cn } from "@/lib/brava/cn";

export default function EquipmentMapHotspot({
  tag,
  x,
  y,
  equipment,
  highlighted,
  calloutOffset,
  onSelect,
}: {
  tag: string;
  x: number;
  y: number;
  equipment: EquipmentWithDerived | null;
  highlighted?: boolean;
  /** Pre-computed by EquipmentMapExplorer for every in-maintenance item on the map at once, so boxes don't collide. */
  calloutOffset?: CalloutOffset;
  onSelect: () => void;
}) {
  const meta = equipment ? STATUS_META[equipment.status] : STATUS_META.SEM_PROJETO;
  // Statuses with a real maintenance record and a meaningful progress
  // number to show at a glance — actively worked, overdue while worked, or
  // finished. Excludes PROGRAMADO (nothing has actually started yet) and
  // SEM_PROJETO (no project at all).
  const showsProgress = equipment ? ["EM_EXECUCAO", "ATRASADO", "CRITICO", "CONCLUIDO"].includes(equipment.status) : false;
  const accentBorderClass = equipment ? STATUS_ACCENT_BORDER[equipment.status] : undefined;
  const lineClass = equipment ? STATUS_LINE_CLASS[equipment.status] : undefined;
  const callout = calloutOffset ? toSvgGeometry(calloutOffset) : null;
  // Staggered so dozens of dots don't all blink in lockstep — a cheap,
  // stable per-tag offset keeps the map feeling alive instead of static.
  const pulseDelay = (hashTag(tag) % 24) / 10;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group/hotspot absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation"
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-label={tag}
    >
      {highlighted ? (
        <span className={cn("absolute inset-0 -m-3 animate-ping rounded-full opacity-50", meta.dotClass)} />
      ) : (
        <span
          className={cn("absolute inset-0 -m-1.5 rounded-full animate-radar-pulse", meta.dotClass)}
          style={{ animationDelay: `${pulseDelay}s` }}
        />
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

      {equipment && showsProgress && callout && (
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
              "pointer-events-none absolute z-20 flex w-[126px] -translate-x-1/2 -translate-y-1/2 flex-col gap-1.5 rounded-brava-sm border border-brava-border bg-brava-white px-2.5 py-1.5 shadow-brava-lg",
              accentBorderClass
            )}
            style={{ left: callout.dx, top: callout.dy, borderLeftWidth: 3 }}
          >
            <span className="flex items-center justify-between gap-1.5 whitespace-nowrap">
              <span className="font-mono text-[10px] font-bold text-brava-blue-dark">{tag}</span>
              <span className={cn("text-[10px] font-extrabold", meta.textClass)}>{equipment.derived.progress}%</span>
            </span>
            <span className="relative h-[5px] w-full overflow-hidden rounded-full bg-[#98A2B3]">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-brava-accent transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(4, Math.min(100, equipment.derived.progress))}%` }}
              />
            </span>
          </span>
        </>
      )}

      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2.5 w-max min-w-[160px] max-w-[220px] -translate-x-1/2 rounded-brava-sm bg-brava-blue-dark px-3 py-2 text-left opacity-0 shadow-brava-lg transition-opacity duration-150 group-hover/hotspot:opacity-100">
        <span className="block font-mono text-[12px] font-bold text-brava-white">{tag}</span>
        {equipment ? (
          <>
            <span className="mt-0.5 block text-[10.5px] text-brava-white/80">{equipment.unit}</span>
            <span className="mt-1 block text-[10.5px] font-semibold text-brava-white">{meta.label}</span>
            {showsProgress && (
              <span className="mt-1.5 flex items-center gap-1.5">
                <span className="relative h-[4px] flex-1 overflow-hidden rounded-full bg-brava-white/25">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-brava-accent"
                    style={{ width: `${Math.max(4, Math.min(100, equipment.derived.progress))}%` }}
                  />
                </span>
                <span className="text-[10.5px] font-bold text-brava-white">Avanço: {equipment.derived.progress}%</span>
              </span>
            )}
          </>
        ) : (
          <span className="mt-0.5 block text-[10.5px] text-brava-white/70">Dashboard não cadastrado</span>
        )}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-brava-blue-dark" />
      </span>
    </button>
  );
}

// Literal class names (not built dynamically) so Tailwind's content scanner
// keeps them in the production build.
const STATUS_LINE_CLASS: Record<string, string> = {
  EM_EXECUCAO: "stroke-brava-blue",
  ATRASADO: "stroke-brava-warning",
  CRITICO: "stroke-brava-danger",
  CONCLUIDO: "stroke-brava-success",
};

const STATUS_ACCENT_BORDER: Record<string, string> = {
  EM_EXECUCAO: "border-l-brava-blue",
  ATRASADO: "border-l-brava-warning",
  CRITICO: "border-l-brava-danger",
  CONCLUIDO: "border-l-brava-success",
};

/** Converts a pre-computed {dx, dy} offset into the local SVG box/path the elbow leader line is drawn in. */
function toSvgGeometry(offset: CalloutOffset) {
  const { dx, dy } = offset;
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
