"use client";

import { useEffect, useRef, useState } from "react";
import { TankWithDerived } from "@/lib/brava/types";
import { INSPECTION_CRITICALITY_META, formatDaysToInspection } from "@/lib/brava/inspection";
import { mapStatusLabel, mapStatusDotClass } from "@/lib/brava/maps/statusLabel";
import { CalloutOffset, hashTag } from "@/lib/brava/maps/calloutLayout";
import { formatShort } from "@/lib/brava/date-utils";
import { cn } from "@/lib/brava/cn";

export default function MapHotspot({
  tag,
  x,
  y,
  tank,
  highlighted,
  calloutOffset,
  onSelect,
  draggable,
  mapScale,
  onCalloutOffsetChange,
}: {
  tag: string;
  x: number;
  y: number;
  tank: TankWithDerived | null;
  highlighted?: boolean;
  /** Pre-computed by AssetMapExplorer for every in-maintenance tank on the map at once, so boxes don't collide. */
  calloutOffset?: CalloutOffset;
  onSelect: () => void;
  /** Lets an editor drag the callout box to a manual position — gated the same way as Modo de Calibração. */
  draggable?: boolean;
  /** Current map zoom factor, to convert pointer-movement px into the (unscaled) layer space the offset itself is expressed in. */
  mapScale?: number;
  /** Fired once on drop, with the final {dx, dy} to persist — not during the drag itself. */
  onCalloutOffsetChange?: (dx: number, dy: number) => void;
}) {
  // While dragging (or just after dropping, until the parent's own
  // calloutOffset — recomputed from the saved override — catches up),
  // this is the source of truth for where the box renders; it takes
  // priority over the calloutOffset prop so the box and its leader line
  // track the pointer immediately instead of waiting on a round trip.
  const [dragOffset, setDragOffset] = useState<CalloutOffset | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; base: CalloutOffset } | null>(null);

  useEffect(() => {
    if (dragOffset && calloutOffset && calloutOffset.dx === dragOffset.dx && calloutOffset.dy === dragOffset.dy) {
      setDragOffset(null);
    }
  }, [calloutOffset, dragOffset]);
  const criticality = tank?.derived.inspectionCriticality ?? "SEM_DATA";
  const meta = INSPECTION_CRITICALITY_META[criticality];
  // The map pin itself only answers one question at a glance — is this tank
  // being worked on right now, or not yet — rather than the finer
  // inspection-criticality scale (still shown, spelled out in words, in the
  // hover tooltip below).
  const dotColorClass = tank ? mapStatusDotClass(tank.status) : "bg-brava-text-secondary";
  // Statuses with a real, dated maintenance plan — a meaningful progress
  // number to show at a glance, 0% included (PROGRAMADO: scheduled, next up,
  // nothing started yet). Excludes SEM_PROJETO, which has no plan at all.
  const showsProgress = tank
    ? ["PROGRAMADO", "EM_EXECUCAO", "ATRASADO", "CRITICO", "CONCLUIDO"].includes(tank.status)
    : false;
  const statusLabel = tank ? mapStatusLabel(tank.status) : null;
  const effectiveOffset = dragOffset ?? calloutOffset;
  const callout = effectiveOffset ? toSvgGeometry(effectiveOffset) : null;
  // Staggered so dozens of dots don't all blink in lockstep — a cheap,
  // stable per-tag offset keeps the map feeling alive instead of static.
  const pulseDelay = (hashTag(tag) % 24) / 10;

  function onBoxPointerDown(e: React.PointerEvent) {
    if (!draggable || !callout) return;
    e.stopPropagation(); // this is the box being grabbed, not the hotspot button being clicked
    dragStartRef.current = { x: e.clientX, y: e.clientY, base: { dx: callout.dx, dy: callout.dy } };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onBoxPointerMove(e: React.PointerEvent) {
    if (!dragStartRef.current) return;
    const { x: startX, y: startY, base } = dragStartRef.current;
    const scale = mapScale || 1;
    setDragOffset({ dx: base.dx + (e.clientX - startX) / scale, dy: base.dy + (e.clientY - startY) / scale });
  }

  function onBoxPointerUp(e: React.PointerEvent) {
    if (!dragStartRef.current) return;
    const moved = Math.hypot(e.clientX - dragStartRef.current.x, e.clientY - dragStartRef.current.y);
    dragStartRef.current = null;
    setIsDragging(false);
    if (moved > 4 && dragOffset) {
      e.stopPropagation(); // was an actual drag — don't let the click bubble into onSelect
      onCalloutOffsetChange?.(dragOffset.dx, dragOffset.dy);
    } else {
      setDragOffset(null); // negligible movement — treat as a plain click and let it bubble as before
    }
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group/hotspot absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation"
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-label={tag}
    >
      {highlighted ? (
        <span className={cn("absolute inset-0 -m-3 animate-ping rounded-full opacity-50", dotColorClass)} />
      ) : (
        <span
          className={cn("absolute inset-0 -m-1.5 rounded-full animate-radar-pulse", dotColorClass)}
          style={{ animationDelay: `${pulseDelay}s` }}
        />
      )}
      <span
        className={cn(
          "absolute inset-0 -m-2 scale-0 rounded-full opacity-0 transition-all duration-150 group-hover/hotspot:scale-100 group-hover/hotspot:opacity-25",
          dotColorClass
        )}
      />
      <span
        className={cn(
          "relative block h-3 w-3 rounded-full border-2 border-brava-white shadow-brava-md transition-transform duration-150 group-hover/hotspot:scale-125",
          dotColorClass,
          highlighted && "scale-150"
        )}
      />

      {tank && showsProgress && callout && (
        <>
          {/*
            One quadratic curve through the same corner the old two-segment
            elbow met at, instead of a hard right angle — a gentle bend reads
            as one continuous line pulling the card off the dot, rather than
            a ruler-drawn connector. Kept neutral white (not status-colored)
            on purpose: the dot's own color is the inspection-criticality
            scale, the card's status dot below is the maintenance-status
            scale — two different legends meeting at this line, so tinting
            it either color would misattribute it to one of them. White
            reads as the connective tissue between both, not a third signal.
          */}
          <svg
            className="pointer-events-none absolute z-10 overflow-visible"
            style={{
              left: callout.svgLeft,
              top: callout.svgTop,
              width: callout.svgWidth,
              height: callout.svgHeight,
              filter: "drop-shadow(0 0 2.5px rgba(255,255,255,0.55))",
            }}
            viewBox={`0 0 ${callout.svgWidth} ${callout.svgHeight}`}
          >
            <path
              d={`M ${callout.dotLocalX} ${callout.dotLocalY} Q ${callout.dotLocalX} ${callout.boxLocalY} ${callout.boxLocalX} ${callout.boxLocalY}`}
              fill="none"
              strokeWidth={1.5}
              strokeLinecap="round"
              className="stroke-white/80"
            />
          </svg>
          <span
            onPointerDown={onBoxPointerDown}
            onPointerMove={onBoxPointerMove}
            onPointerUp={onBoxPointerUp}
            onPointerCancel={onBoxPointerUp}
            className={cn(
              "absolute z-20 flex w-[132px] -translate-x-1/2 -translate-y-1/2 flex-col gap-1.5 rounded-brava-md border border-white/15 bg-brava-blue-dark/90 px-3 py-2 shadow-brava-lg backdrop-blur-md",
              draggable ? (isDragging ? "cursor-grabbing" : "cursor-grab hover:border-brava-accent/60") : "pointer-events-none"
            )}
            style={{ left: callout.dx, top: callout.dy, touchAction: draggable ? "none" : undefined }}
          >
            <span className="flex items-center justify-between gap-1.5 whitespace-nowrap">
              <span className="flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotColorClass)} />
                <span className="font-mono text-[10px] font-bold text-white">{tag}</span>
              </span>
              <span className="text-[10px] font-extrabold text-brava-accent">{tank.derived.progress}%</span>
            </span>
            {/* Track (the "end of progress" reference, full width) with the fill overlaid on top. */}
            <span className="relative h-[4px] w-full overflow-hidden rounded-full bg-white/15">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-brava-accent shadow-[0_0_5px_rgba(210,245,30,0.65)] transition-[width] duration-700 ease-out"
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
            <span className="mt-1 flex items-center gap-1.5 text-[10.5px] font-semibold text-brava-white">
              <span className={cn("h-1.5 w-1.5 rounded-full", dotColorClass)} />
              {statusLabel}
            </span>
            {showsProgress && (
              <span className="mt-1.5 flex items-center gap-1.5">
                <span className="relative h-[4px] flex-1 overflow-hidden rounded-full bg-brava-white/25">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-brava-accent"
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
