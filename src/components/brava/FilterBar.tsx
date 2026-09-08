"use client";

import { Search } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { TankStatus } from "@/lib/brava/types";
import { STATUS_META } from "@/lib/brava/status-meta";
import { cn } from "@/lib/brava/cn";

const FILTER_OPTIONS: { value: "TODOS" | TankStatus; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "EM_EXECUCAO", label: "Em Execução" },
  { value: "PROGRAMADO", label: "Programado" },
  { value: "ATRASADO", label: "Atrasado" },
  { value: "CRITICO", label: "Crítico" },
  { value: "CONCLUIDO", label: "Concluído" },
];

export default function FilterBar({ searchPlaceholder }: { searchPlaceholder?: string }) {
  const { filter, setFilter } = useBravaData();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brava-text-secondary" />
        <input
          value={filter.search}
          onChange={(e) => setFilter({ search: e.target.value })}
          placeholder={searchPlaceholder ?? "Pesquisar TAG, área ou produto…"}
          className="w-full rounded-brava-sm border border-brava-border bg-brava-white py-1.5 pl-8 pr-3 text-[13px] text-brava-text placeholder:text-brava-text-secondary focus:border-brava-blue focus:outline-none focus:ring-1 focus:ring-brava-blue sm:w-64"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTER_OPTIONS.map((opt) => {
          const active = filter.status === opt.value;
          const dotClass = opt.value === "TODOS" ? "bg-brava-blue" : STATUS_META[opt.value].dotClass;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter({ status: opt.value })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                active
                  ? "border-brava-blue bg-brava-blue text-brava-white"
                  : "border-brava-border bg-brava-white text-brava-text-secondary hover:border-brava-blue/30 hover:text-brava-text"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-brava-accent" : dotClass)} />
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
