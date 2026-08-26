"use client";

import { useMemo, useState } from "react";
import {
  ClipboardList,
  CalendarClock,
  Hammer,
  Flag,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Plus,
} from "lucide-react";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { computeAtiKpis, priorityComparator } from "@/lib/paint-control/calculations";
import PageHeader from "@/components/paint-control/PageHeader";
import KpiCard from "@/components/paint-control/KpiCard";
import PrioritiesTable from "@/components/paint-control/PrioritiesTable";
import UnitsGrid from "@/components/paint-control/UnitsGrid";
import ActivityFormPanel from "@/components/paint-control/ActivityFormPanel";
import type { NewActivityInput } from "@/lib/paint-control/store";

export default function VisaoGeralPage() {
  const units = usePaintControlStore((s) => s.units);
  const activities = usePaintControlStore((s) => s.activities);
  const responsibles = usePaintControlStore((s) => s.responsibles);
  const addActivity = usePaintControlStore((s) => s.addActivity);

  const [formOpen, setFormOpen] = useState(false);

  const kpis = useMemo(() => computeAtiKpis(activities), [activities]);
  const topPriorities = useMemo(
    () => [...activities].sort(priorityComparator).slice(0, 10),
    [activities]
  );

  function handleSubmit(payload: NewActivityInput) {
    addActivity(payload);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="PAINT CONTROL ATI"
        title="Visão Geral ATI"
        description="Panorama consolidado de todos os serviços de pintura do Ativo Industrial de Guamaré."
        actions={
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Novo Serviço de Pintura
          </button>
        }
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <KpiCard label="Total de Serviços" value={kpis.total} icon={ClipboardList} />
        <KpiCard label="Programados" value={kpis.programmed} icon={CalendarClock} />
        <KpiCard label="Em Execução" value={kpis.inExecution} icon={Hammer} tone="accent" />
        <KpiCard label="Alta Prioridade" value={kpis.highPriority} icon={Flag} />
        <KpiCard label="Atrasados" value={kpis.overdue} icon={AlertTriangle} tone="warning" />
        <KpiCard label="Concluídos" value={kpis.completed} icon={CheckCircle2} />
        <KpiCard label="Avanço Geral" value={`${kpis.overallProgress}%`} icon={TrendingUp} tone="accent" />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Prioridades do ATI</h2>
            <p className="text-sm text-slate-500">
              Serviços mais críticos do ativo — ordenados por prioridade e data necessária.
            </p>
          </div>
        </div>
        <PrioritiesTable activities={topPriorities} units={units} responsibles={responsibles} />
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900">Unidades do ATI</h2>
          <p className="text-sm text-slate-500">
            {units.length} unidades cadastradas — clique para abrir o mapa de atividades de cada uma.
          </p>
        </div>
        <UnitsGrid units={units} activities={activities} />
      </section>

      <ActivityFormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        units={units}
        responsibles={responsibles}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
