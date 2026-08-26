"use client";

import { useMemo, useState } from "react";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { globalPriorityComparator, isOverdue } from "@/lib/paint-control/calculations";
import type { Priority } from "@/types/paint-control";
import { PRIORITIES } from "@/types/paint-control";
import { PRIORITY_LABELS } from "@/lib/paint-control/constants";
import PageHeader from "@/components/paint-control/PageHeader";
import SearchInput from "@/components/paint-control/SearchInput";
import PrioritiesTable from "@/components/paint-control/PrioritiesTable";

export default function PrioridadesPage() {
  const units = usePaintControlStore((s) => s.units);
  const activities = usePaintControlStore((s) => s.activities);
  const responsibles = usePaintControlStore((s) => s.responsibles);

  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  const ranked = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activities
      .filter((a) => a.status !== "Concluído" && a.status !== "Cancelado")
      .filter((a) => {
        if (q && !`${a.tag} ${a.title} ${a.local}`.toLowerCase().includes(q)) return false;
        if (unitFilter && a.unitId !== unitFilter) return false;
        if (priorityFilter && a.priority !== priorityFilter) return false;
        if (onlyOverdue && !isOverdue(a)) return false;
        return true;
      })
      .sort(globalPriorityComparator);
  }, [activities, search, unitFilter, priorityFilter, onlyOverdue]);

  const selectClass =
    "rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 outline-none focus:border-slate-400";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="ATI Guamaré"
        title="Mapa de Prioridades ATI"
        description="Quais serviços de pintura precisam de atenção primeiro — em toda a planta."
      />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por TAG, serviço ou local..."
          className="lg:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select className={selectClass} value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)}>
            <option value="">Todas as unidades</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.tag}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | "")}
          >
            <option value="">Todas as prioridades</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
          <button
            onClick={() => setOnlyOverdue((v) => !v)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              onlyOverdue
                ? "border-rose-600 bg-rose-600 text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}
          >
            Somente atrasados
          </button>
        </div>
      </div>

      <p className="text-xs font-medium text-slate-400">
        Ordenado por: P1 → atrasados → data necessária → P2 → P3 → P4. Serviços concluídos e
        cancelados não entram neste mapa.
      </p>

      <PrioritiesTable activities={ranked} units={units} responsibles={responsibles} />
    </div>
  );
}
