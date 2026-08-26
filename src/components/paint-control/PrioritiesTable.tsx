"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, Flag } from "lucide-react";
import type { Activity, Responsible, Unit } from "@/types/paint-control";
import { isOverdue } from "@/lib/paint-control/calculations";
import { formatDate } from "@/lib/paint-control/format";
import PriorityBadge from "@/components/paint-control/PriorityBadge";
import StatusBadge from "@/components/paint-control/StatusBadge";
import ProgressBar from "@/components/paint-control/ProgressBar";
import OverdueTag from "@/components/paint-control/OverdueTag";
import EmptyState from "@/components/paint-control/EmptyState";

/** Consolidated priorities table used on Visão Geral and Mapa de Prioridades ATI. */
export default function PrioritiesTable({
  activities,
  units,
  responsibles,
}: {
  activities: Activity[];
  units: Unit[];
  responsibles: Responsible[];
}) {
  const unitById = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);
  const responsibleById = useMemo(
    () => new Map(responsibles.map((r) => [r.id, r])),
    [responsibles]
  );

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Flag}
        title="Nenhum serviço para exibir"
        description="Não há serviços de pintura cadastrados com os critérios atuais."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[920px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2.5">Prioridade</th>
            <th className="px-3 py-2.5">Unidade</th>
            <th className="px-3 py-2.5">TAG / Equipamento</th>
            <th className="px-3 py-2.5">Serviço</th>
            <th className="px-3 py-2.5">Responsável</th>
            <th className="px-3 py-2.5">Data necessária</th>
            <th className="px-3 py-2.5 w-36">Avanço</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5 text-right">Abrir</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => {
            const unit = unitById.get(activity.unitId);
            const responsible = activity.responsibleId
              ? responsibleById.get(activity.responsibleId)
              : null;
            const overdue = isOverdue(activity);

            return (
              <tr
                key={activity.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
              >
                <td className="px-3 py-3 align-top">
                  <PriorityBadge priority={activity.priority} />
                </td>
                <td className="px-3 py-3 align-top">
                  <Link
                    href={`/paint-control-ati/unidades/${activity.unitId}`}
                    className="font-semibold text-slate-700 hover:text-slate-900 hover:underline"
                  >
                    {unit?.tag ?? "—"}
                  </Link>
                </td>
                <td className="px-3 py-3 align-top font-medium text-slate-800">{activity.tag || "—"}</td>
                <td className="px-3 py-3 align-top">
                  <span className="font-semibold text-slate-900">{activity.title || "Sem título"}</span>
                  {overdue && (
                    <div className="mt-1">
                      <OverdueTag />
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 align-top text-slate-600">
                  {responsible?.name ?? <span className="text-slate-400">Sem responsável</span>}
                </td>
                <td className="px-3 py-3 align-top text-slate-600">{formatDate(activity.neededDate)}</td>
                <td className="px-3 py-3 align-top">
                  <ProgressBar value={activity.progress} size="sm" />
                </td>
                <td className="px-3 py-3 align-top">
                  <StatusBadge status={activity.status} />
                </td>
                <td className="px-3 py-3 align-top text-right">
                  <Link
                    href={`/paint-control-ati/atividades/${activity.id}`}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  >
                    Abrir
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
