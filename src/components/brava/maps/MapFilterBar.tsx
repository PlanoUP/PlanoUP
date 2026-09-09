"use client";

import { Search } from "lucide-react";
import { MapFilterOption, MapQuickFilter } from "@/lib/brava/maps/types";
import { cn } from "@/lib/brava/cn";

const BASE_FILTERS: { value: MapQuickFilter; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "CRITICOS", label: "Críticos" },
  { value: "EM_MANUTENCAO", label: "Em Manutenção" },
  { value: "INSPECAO_PROXIMA", label: "Inspeção Próxima" },
];

export default function MapFilterBar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  extraFilters,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  filter: MapQuickFilter;
  onFilterChange: (v: MapQuickFilter) => void;
  extraFilters: MapFilterOption[];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brava-text-secondary" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar tanque (ex.: 41005, 6313005…)"
          className="w-full rounded-brava-sm border border-brava-border bg-brava-white py-1.5 pl-8 pr-3 text-[13px] text-brava-text placeholder:text-brava-text-secondary focus:border-brava-blue focus:outline-none focus:ring-1 focus:ring-brava-blue sm:w-72"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[...BASE_FILTERS, ...extraFilters].map((opt) => {
          const active = filter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onFilterChange(opt.value)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
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
    </div>
  );
}
