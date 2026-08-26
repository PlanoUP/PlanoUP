"use client";

import { useMemo, useState } from "react";
import type { Activity, Unit } from "@/types/paint-control";
import { computeUnitStats } from "@/lib/paint-control/calculations";
import UnitCard from "@/components/paint-control/UnitCard";
import SearchInput from "@/components/paint-control/SearchInput";
import EmptyState from "@/components/paint-control/EmptyState";
import { Factory } from "lucide-react";

type FilterKey = "all" | "critical" | "overdue" | "executing" | "empty" | "completed";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "critical", label: "Com serviços críticos" },
  { key: "overdue", label: "Com serviços atrasados" },
  { key: "executing", label: "Em execução" },
  { key: "empty", label: "Sem atividades" },
  { key: "completed", label: "Concluídas" },
];

export default function UnitsGrid({
  units,
  activities,
}: {
  units: Unit[];
  activities: Activity[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const entries = useMemo(() => {
    return units.map((unit) => {
      const unitActivities = activities.filter((a) => a.unitId === unit.id);
      return { unit, stats: computeUnitStats(unitActivities) };
    });
  }, [units, activities]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(({ unit, stats }) => {
      if (q && !`${unit.tag} ${unit.name}`.toLowerCase().includes(q)) return false;
      switch (filter) {
        case "critical":
          return stats.critical > 0;
        case "overdue":
          return stats.overdue > 0;
        case "executing":
          return stats.inExecution > 0;
        case "empty":
          return stats.total === 0;
        case "completed":
          return stats.total > 0 && stats.completed === stats.total;
        default:
          return true;
      }
    });
  }, [entries, query, filter]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar unidade..."
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.key
                  ? "border-slate-900 bg-slate-900 text-accent"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Factory}
            title="Nenhuma unidade encontrada"
            description="Ajuste a busca ou o filtro selecionado."
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(({ unit, stats }) => (
            <UnitCard key={unit.id} unit={unit} stats={stats} />
          ))}
        </div>
      )}
    </div>
  );
}
