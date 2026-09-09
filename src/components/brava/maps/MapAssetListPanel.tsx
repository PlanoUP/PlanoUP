"use client";

import { X } from "lucide-react";
import { TankWithDerived } from "@/lib/brava/types";
import { INSPECTION_CRITICALITY_META } from "@/lib/brava/inspection";
import { cn } from "@/lib/brava/cn";

export interface AssetListEntry {
  tag: string;
  tank: TankWithDerived | null;
  hasCoordinate: boolean;
}

export default function MapAssetListPanel({
  entries,
  onSelect,
  onClose,
}: {
  entries: AssetListEntry[];
  onSelect: (tag: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-y-0 left-0 z-30 flex w-full max-w-[300px] flex-col border-r border-brava-border bg-brava-white shadow-brava-lg">
      <div className="flex items-center justify-between border-b border-brava-border px-4 py-3">
        <p className="text-[12px] font-bold uppercase tracking-wide text-brava-blue-dark">Lista de Ativos</p>
        <button onClick={onClose} className="rounded-brava-sm p-1 text-brava-text-secondary hover:bg-brava-bg">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="brava-scrollbar flex-1 overflow-y-auto">
        {entries.map((entry, i) => {
          const criticality = entry.tank?.derived.inspectionCriticality ?? "SEM_DATA";
          const meta = INSPECTION_CRITICALITY_META[criticality];
          return (
            <button
              key={entry.tag}
              onClick={() => onSelect(entry.tag)}
              className="flex w-full items-center gap-3 border-b border-brava-border/70 px-4 py-2.5 text-left transition-colors hover:bg-brava-bg"
            >
              <span className="w-5 shrink-0 text-[11px] font-semibold text-brava-text-secondary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] font-bold text-brava-blue-dark">
                {entry.tag}
              </span>
              {!entry.hasCoordinate && (
                <span className="shrink-0 text-[9.5px] font-semibold uppercase text-brava-text-secondary">
                  Posição a definir
                </span>
              )}
              <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase", meta.badgeClass)}>
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
