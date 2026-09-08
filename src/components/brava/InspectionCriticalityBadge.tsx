import { InspectionCriticality } from "@/lib/brava/types";
import { INSPECTION_CRITICALITY_META, formatDaysToInspection } from "@/lib/brava/inspection";
import { formatShort } from "@/lib/brava/date-utils";
import { cn } from "@/lib/brava/cn";

/**
 * Small badge for INSPECTION criticality (regulatory), deliberately styled
 * like StatusBadge (maintenance) but never using the same component, so the
 * two concepts stay visually distinguishable side by side.
 */
export default function InspectionCriticalityBadge({
  criticality,
  size = "md",
  className,
}: {
  criticality: InspectionCriticality;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = INSPECTION_CRITICALITY_META[criticality];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        meta.badgeClass,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotClass)} />
      {meta.label}
    </span>
  );
}

/** Wraps children with a discreet hover tooltip: date, day-count and criticality. */
export function InspectionTooltip({
  nextInternalInspection,
  daysToInternalInspection,
  criticality,
  children,
}: {
  nextInternalInspection?: string;
  daysToInternalInspection: number | null;
  criticality: InspectionCriticality;
  children: React.ReactNode;
}) {
  const meta = INSPECTION_CRITICALITY_META[criticality];
  return (
    <div className="group/tooltip relative w-full">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-[220px] -translate-x-1/2 rounded-brava-sm bg-brava-blue-dark px-3 py-2 text-left opacity-0 shadow-brava-lg transition-opacity duration-150 group-hover/tooltip:opacity-100">
        <span className="block text-[9.5px] font-bold uppercase tracking-wide text-brava-white/70">
          Próxima Inspeção Interna
        </span>
        <span className="mt-1 block text-[11.5px] font-semibold text-brava-white">
          {nextInternalInspection ? formatShort(nextInternalInspection) : "A definir"}
        </span>
        <span className="mt-1 block text-[10.5px] text-brava-white/85">
          {formatDaysToInspection(daysToInternalInspection)}
        </span>
        <span className="mt-1.5 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-brava-white">
          <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotClass)} />
          {meta.label}
        </span>
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-brava-blue-dark" />
      </span>
    </div>
  );
}
