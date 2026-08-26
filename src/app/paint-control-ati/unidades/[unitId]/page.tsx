"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Factory } from "lucide-react";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { computeUnitStats } from "@/lib/paint-control/calculations";
import ProgressBar from "@/components/paint-control/ProgressBar";
import KpiCard from "@/components/paint-control/KpiCard";
import ActivitiesSection from "@/components/paint-control/ActivitiesSection";
import EmptyState from "@/components/paint-control/EmptyState";
import {
  ClipboardList,
  Inbox,
  CalendarClock,
  Hammer,
  Search,
  CheckCircle2,
  Flag,
  TrendingUp,
} from "lucide-react";

export default function UnitDetailPage({ params }: { params: { unitId: string } }) {
  const units = usePaintControlStore((s) => s.units);
  const activities = usePaintControlStore((s) => s.activities);

  const unit = units.find((u) => u.id === params.unitId);
  const unitActivities = useMemo(
    () => activities.filter((a) => a.unitId === params.unitId),
    [activities, params.unitId]
  );
  const stats = useMemo(() => computeUnitStats(unitActivities), [unitActivities]);

  if (!unit) {
    return (
      <EmptyState
        icon={Factory}
        title="Unidade não encontrada"
        description="Esta unidade pode ter sido removida. Volte para a lista de unidades do ATI."
        action={
          <Link
            href="/paint-control-ati/unidades"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-accent hover:bg-slate-800"
          >
            Voltar para Unidades
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <Link href="/paint-control-ati" className="hover:text-slate-600">
          ATI
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/paint-control-ati/unidades" className="hover:text-slate-600">
          {unit.tag}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-600">Pintura</span>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{unit.tag}</h1>
        <p className="mt-1 text-sm text-slate-500">{unit.name}</p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <KpiCard label="Total" value={stats.total} icon={ClipboardList} />
        <KpiCard label="Não iniciados" value={stats.notStarted} icon={Inbox} />
        <KpiCard label="Programados" value={stats.programmed} icon={CalendarClock} />
        <KpiCard label="Em execução" value={stats.inExecution} icon={Hammer} tone="accent" />
        <KpiCard label="Em inspeção" value={stats.inInspection} icon={Search} />
        <KpiCard label="Concluídos" value={stats.completed} icon={CheckCircle2} />
        <KpiCard label="Críticos" value={stats.critical} icon={Flag} tone="warning" />
        <KpiCard label="Avanço médio" value={`${stats.avgProgress}%`} icon={TrendingUp} tone="accent" />
      </section>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">Avanço físico médio da unidade</span>
          <span className="font-bold text-slate-900">{stats.avgProgress}%</span>
        </div>
        <ProgressBar value={stats.avgProgress} showLabel={false} />
      </div>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900">Mapa de Atividades</h2>
          <p className="text-sm text-slate-500">Serviços de pintura cadastrados para {unit.tag}.</p>
        </div>
        <ActivitiesSection
          activities={unitActivities}
          defaultUnitId={unit.id}
          newButtonLabel="Novo Serviço de Pintura"
        />
      </section>
    </div>
  );
}
