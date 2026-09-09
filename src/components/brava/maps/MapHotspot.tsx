"use client";

import { TankWithDerived } from "@/lib/brava/types";
import { INSPECTION_CRITICALITY_META, formatDaysToInspection } from "@/lib/brava/inspection";
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

      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2.5 w-max min-w-[160px] max-w-[220px] -translate-x-1/2 rounded-brava-sm bg-brava-blue-dark px-3 py-2 text-left opacity-0 shadow-brava-lg transition-opacity duration-150 group-hover/hotspot:opacity-100">
        <span className="block font-mono text-[12px] font-bold text-brava-white">{tag}</span>
        {tank ? (
          <>
            <span className="mt-0.5 block text-[10.5px] text-brava-white/80">{tank.product}</span>
            <span className="mt-1 block text-[10.5px] font-semibold text-brava-white">
              {STATUS_LABEL[tank.status] ?? tank.status}
            </span>
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
