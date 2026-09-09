"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/brava/cn";
import { MaterialsQuickFilter } from "@/lib/brava/materials/types";

const FILTER_OPTIONS: { value: MaterialsQuickFilter; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "410", label: "410" },
  { value: "6313", label: "6313" },
  { value: "270", label: "270" },
  { value: "CRITICOS", label: "Críticos" },
  { value: "EM_ATRASO", label: "Em Atraso" },
  { value: "EM_AQUISICAO", label: "Em Aquisição" },
  { value: "RECEBIDOS", label: "Recebidos" },
  { value: "COM_RISCO", label: "Com Risco" },
];

export default function MaterialsFilterBar({
  quickFilter,
  onQuickFilterChange,
  search,
  onSearchChange,
}: {
  quickFilter: MaterialsQuickFilter;
  onQuickFilterChange: (v: MaterialsQuickFilter) => void;
  search: string;
  onSearchChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {FILTER_OPTIONS.map((opt) => {
          const active = quickFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onQuickFilterChange(opt.value)}
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                active
                  ? "border-brava-blue bg-brava-blue text-brava-white"
                  : "border-brava-border bg-brava-white text-brava-text-secondary hover:border-brava-blue/30 hover:text-brava-text"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brava-text-secondary" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Material, TAG, pedido ou fornecedor…"
          className="w-full rounded-brava-sm border border-brava-border bg-brava-white py-1.5 pl-8 pr-3 text-[13px] text-brava-text placeholder:text-brava-text-secondary focus:border-brava-blue focus:outline-none focus:ring-1 focus:ring-brava-blue sm:w-72"
        />
      </div>
    </div>
  );
}
