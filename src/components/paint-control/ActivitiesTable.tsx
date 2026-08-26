"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Eye, Pencil, FileDown, Trash2 } from "lucide-react";
import type { Activity, Responsible, Unit } from "@/types/paint-control";
import { isOverdue } from "@/lib/paint-control/calculations";
import { formatArea, formatDate } from "@/lib/paint-control/format";
import PriorityBadge from "@/components/paint-control/PriorityBadge";
import StatusBadge from "@/components/paint-control/StatusBadge";
import ProgressBar from "@/components/paint-control/ProgressBar";
import OverdueTag from "@/components/paint-control/OverdueTag";
import EmptyState from "@/components/paint-control/EmptyState";
import { ClipboardList } from "lucide-react";

export default function ActivitiesTable({
  activities,
  units,
  responsibles,
  showUnitColumn = false,
  onEdit,
  onRequestDelete,
  onExport,
}: {
  activities: Activity[];
  units: Unit[];
  responsibles: Responsible[];
  showUnitColumn?: boolean;
  onEdit: (activity: Activity) => void;
  onRequestDelete: (activity: Activity) => void;
  onExport: (activity: Activity) => void;
}) {
  const unitById = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);
  const responsibleById = useMemo(
    () => new Map(responsibles.map((r) => [r.id, r])),
    [responsibles]
  );

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nenhum serviço de pintura encontrado"
        description="Cadastre um novo serviço ou ajuste os filtros de busca."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[1080px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2.5">Prioridade</th>
            {showUnitColumn && <th className="px-3 py-2.5">Unidade</th>}
            <th className="px-3 py-2.5">TAG / Equipamento</th>
            <th className="px-3 py-2.5">Local</th>
            <th className="px-3 py-2.5">Serviço</th>
            <th className="px-3 py-2.5">Responsável</th>
            <th className="px-3 py-2.5">Área est.</th>
            <th className="px-3 py-2.5">Data necessária</th>
            <th className="px-3 py-2.5">Data programada</th>
            <th className="px-3 py-2.5 w-40">Avanço</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => {
            const unit = unitById.get(activity.unitId);
            const responsible = activity.responsibleId
              ? responsibleById.get(activity.responsibleId)
              : null;
            const overdue = isOverdue(activity);
            const detailHref = `/paint-control-ati/atividades/${activity.id}`;

            return (
              <tr
                key={activity.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
              >
                <td className="px-3 py-3 align-top">
                  <PriorityBadge priority={activity.priority} />
                </td>
                {showUnitColumn && (
                  <td className="px-3 py-3 align-top">
                    <Link
                      href={`/paint-control-ati/unidades/${activity.unitId}`}
                      className="font-semibold text-slate-700 hover:text-slate-900 hover:underline"
                    >
                      {unit?.tag ?? "—"}
                    </Link>
                  </td>
                )}
                <td className="px-3 py-3 align-top font-medium text-slate-800">{activity.tag || "—"}</td>
                <td className="px-3 py-3 align-top text-slate-500">{activity.local || "—"}</td>
                <td className="px-3 py-3 align-top">
                  <Link href={detailHref} className="font-semibold text-slate-900 hover:underline">
                    {activity.title || "Sem título"}
                  </Link>
                  {overdue && (
                    <div className="mt-1">
                      <OverdueTag />
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 align-top text-slate-600">
                  {responsible?.name ?? <span className="text-slate-400">Sem responsável</span>}
                </td>
                <td className="px-3 py-3 align-top text-slate-600">{formatArea(activity.estimatedAreaM2)}</td>
                <td className="px-3 py-3 align-top text-slate-600">{formatDate(activity.neededDate)}</td>
                <td className="px-3 py-3 align-top text-slate-600">{formatDate(activity.programmedDate)}</td>
                <td className="px-3 py-3 align-top">
                  <ProgressBar value={activity.progress} size="sm" />
                </td>
                <td className="px-3 py-3 align-top">
                  <StatusBadge status={activity.status} />
                </td>
                <td className="px-3 py-3 align-top">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={detailHref}
                      title="Visualizar"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onEdit(activity)}
                      title="Editar"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onExport(activity)}
                      title="Exportar Excel"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <FileDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRequestDelete(activity)}
                      title="Excluir"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
