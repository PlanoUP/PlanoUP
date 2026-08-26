"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { isOverdue, priorityComparator } from "@/lib/paint-control/calculations";
import { formatDate } from "@/lib/paint-control/format";
import type { ActivityStatus, Priority } from "@/types/paint-control";
import { ACTIVITY_STATUSES } from "@/types/paint-control";
import { KANBAN_STATUSES } from "@/lib/paint-control/constants";
import PageHeader from "@/components/paint-control/PageHeader";
import PriorityBadge from "@/components/paint-control/PriorityBadge";
import ProgressBar from "@/components/paint-control/ProgressBar";
import OverdueTag from "@/components/paint-control/OverdueTag";

export default function ProgramacaoPage() {
  const units = usePaintControlStore((s) => s.units);
  const activities = usePaintControlStore((s) => s.activities);
  const responsibles = usePaintControlStore((s) => s.responsibles);
  const updateActivity = usePaintControlStore((s) => s.updateActivity);

  const [unitFilter, setUnitFilter] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");

  const unitById = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);
  const responsibleById = useMemo(
    () => new Map(responsibles.map((r) => [r.id, r])),
    [responsibles]
  );

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (unitFilter && a.unitId !== unitFilter) return false;
      if (responsibleFilter && a.responsibleId !== responsibleFilter) return false;
      if (priorityFilter && a.priority !== priorityFilter) return false;
      return true;
    });
  }, [activities, unitFilter, responsibleFilter, priorityFilter]);

  const columns = useMemo(() => {
    return KANBAN_STATUSES.map((status) => ({
      status,
      items: filtered.filter((a) => a.status === status).sort(priorityComparator),
    }));
  }, [filtered]);

  const selectClass =
    "rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 outline-none focus:border-slate-400";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="ATI Guamaré"
        title="Programação"
        description="Visão Kanban dos serviços de pintura por etapa de execução."
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
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
          value={responsibleFilter}
          onChange={(e) => setResponsibleFilter(e.target.value)}
        >
          <option value="">Todos os responsáveis</option>
          {responsibles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | "")}
        >
          <option value="">Todas as prioridades</option>
          {(["P1", "P2", "P3", "P4"] as Priority[]).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3.5" style={{ minWidth: `${columns.length * 280}px` }}>
          {columns.map((column) => (
            <div key={column.status} className="flex w-[270px] shrink-0 flex-col">
              <div className="mb-2.5 flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {column.status}
                </h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                  {column.items.length}
                </span>
              </div>
              <div className="flex min-h-[120px] flex-col gap-2.5 rounded-xl bg-slate-100/70 p-2">
                {column.items.length === 0 && (
                  <p className="px-2 py-6 text-center text-xs text-slate-400">Sem serviços</p>
                )}
                {column.items.map((activity) => {
                  const unit = unitById.get(activity.unitId);
                  const responsible = activity.responsibleId
                    ? responsibleById.get(activity.responsibleId)
                    : null;
                  const overdue = isOverdue(activity);

                  return (
                    <div
                      key={activity.id}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <Link href={`/paint-control-ati/atividades/${activity.id}`} className="block">
                        <div className="mb-2 flex items-center justify-between gap-1.5">
                          <PriorityBadge priority={activity.priority} />
                          {overdue && <OverdueTag />}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-400">
                          {unit?.tag} · {activity.tag || "Sem TAG"}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-900">
                          {activity.title || "Sem título"}
                        </p>
                        <p className="mt-1.5 text-xs text-slate-500">
                          {responsible?.name ?? "Sem responsável"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Necessária: {formatDate(activity.neededDate)}
                        </p>
                        <div className="mt-2">
                          <ProgressBar value={activity.progress} size="sm" />
                        </div>
                      </Link>
                      <select
                        value={activity.status}
                        onChange={(e) =>
                          updateActivity(activity.id, { status: e.target.value as ActivityStatus })
                        }
                        className="mt-2.5 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-600 outline-none focus:border-slate-400"
                      >
                        {ACTIVITY_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
