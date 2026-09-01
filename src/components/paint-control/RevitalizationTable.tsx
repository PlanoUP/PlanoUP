"use client";

import { useMemo } from "react";
import { Pencil, FileDown, Trash2 } from "lucide-react";
import type { Responsible, RevitalizationItem } from "@/types/paint-control";
import { isOverdue } from "@/lib/paint-control/calculations";
import { formatArea, formatDate } from "@/lib/paint-control/format";
import PriorityBadge from "@/components/paint-control/PriorityBadge";
import StatusBadge from "@/components/paint-control/StatusBadge";
import ProgressBar from "@/components/paint-control/ProgressBar";
import OverdueTag from "@/components/paint-control/OverdueTag";
import EmptyState from "@/components/paint-control/EmptyState";
import { Warehouse } from "lucide-react";

export default function RevitalizationTable({
  items,
  responsibles,
  onEdit,
  onRequestDelete,
  onExport,
}: {
  items: RevitalizationItem[];
  responsibles: Responsible[];
  onEdit: (item: RevitalizationItem) => void;
  onRequestDelete: (item: RevitalizationItem) => void;
  onExport: (item: RevitalizationItem) => void;
}) {
  const responsibleById = useMemo(
    () => new Map(responsibles.map((r) => [r.id, r])),
    [responsibles]
  );

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Warehouse}
        title="Nenhum item de revitalização encontrado"
        description="Cadastre um novo item ou ajuste os filtros de busca."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[980px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2.5">Prioridade</th>
            <th className="px-3 py-2.5">Área / Instalação</th>
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
          {items.map((item) => {
            const responsible = item.responsibleId ? responsibleById.get(item.responsibleId) : null;
            const overdue = isOverdue(item);

            return (
              <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                <td className="px-3 py-3 align-top">
                  <PriorityBadge priority={item.priority} />
                </td>
                <td className="px-3 py-3 align-top font-medium text-slate-800">{item.area || "—"}</td>
                <td className="px-3 py-3 align-top">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-left font-semibold text-slate-900 hover:underline"
                  >
                    {item.title || "Sem título"}
                  </button>
                  {overdue && (
                    <div className="mt-1">
                      <OverdueTag />
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 align-top text-slate-600">
                  {responsible?.name ?? <span className="text-slate-400">Sem responsável</span>}
                </td>
                <td className="px-3 py-3 align-top text-slate-600">{formatArea(item.estimatedAreaM2)}</td>
                <td className="px-3 py-3 align-top text-slate-600">{formatDate(item.neededDate)}</td>
                <td className="px-3 py-3 align-top text-slate-600">{formatDate(item.programmedDate)}</td>
                <td className="px-3 py-3 align-top">
                  <ProgressBar value={item.progress} size="sm" />
                </td>
                <td className="px-3 py-3 align-top">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-3 py-3 align-top">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(item)}
                      title="Editar"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onExport(item)}
                      title="Exportar Excel"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <FileDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRequestDelete(item)}
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
