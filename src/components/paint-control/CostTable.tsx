"use client";

import { Pencil, FileDown, Trash2, Wallet } from "lucide-react";
import type { CostItem } from "@/types/paint-control";
import { itemVariance } from "@/lib/paint-control/costCalculations";
import { formatCurrency } from "@/lib/paint-control/format";
import EmptyState from "@/components/paint-control/EmptyState";

function CategoryBadge({ category }: { category: CostItem["category"] }) {
  const isLabor = category === "Mão de Obra";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
        isLabor
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      {category}
    </span>
  );
}

export default function CostTable({
  items,
  onEdit,
  onRequestDelete,
  onExport,
}: {
  items: CostItem[];
  onEdit: (item: CostItem) => void;
  onRequestDelete: (item: CostItem) => void;
  onExport: (item: CostItem) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Nenhum item de custo encontrado"
        description="Cadastre um novo item ou ajuste os filtros de busca."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[1100px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2.5">Categoria</th>
            <th className="px-3 py-2.5">Item</th>
            <th className="px-3 py-2.5">Regime</th>
            <th className="px-3 py-2.5 text-right">Qtd</th>
            <th className="px-3 py-2.5 text-right">Previsto / Mês</th>
            <th className="px-3 py-2.5 text-right">Previsto / Ano</th>
            <th className="px-3 py-2.5 text-right">Realizado / Mês</th>
            <th className="px-3 py-2.5 text-right">Realizado / Ano</th>
            <th className="px-3 py-2.5 text-right">Variação (Ano)</th>
            <th className="px-3 py-2.5 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const variance = itemVariance(item);
            const overBudget = item.actualAnnualCost !== null && variance < 0;

            return (
              <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                <td className="px-3 py-3 align-top">
                  <CategoryBadge category={item.category} />
                </td>
                <td className="px-3 py-3 align-top">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-left font-semibold text-slate-900 hover:underline"
                  >
                    {item.name || "Sem nome"}
                  </button>
                </td>
                <td className="px-3 py-3 align-top text-slate-600">{item.regime || "—"}</td>
                <td className="px-3 py-3 align-top text-right text-slate-600">
                  {item.quantity.toLocaleString("pt-BR")}
                </td>
                <td className="px-3 py-3 align-top text-right text-slate-700">
                  {formatCurrency(item.plannedMonthlyCost)}
                </td>
                <td className="px-3 py-3 align-top text-right font-semibold text-slate-900">
                  {formatCurrency(item.plannedAnnualCost)}
                </td>
                <td className="px-3 py-3 align-top text-right text-slate-700">
                  {formatCurrency(item.actualMonthlyCost)}
                </td>
                <td className="px-3 py-3 align-top text-right font-semibold text-slate-900">
                  {formatCurrency(item.actualAnnualCost)}
                </td>
                <td
                  className={`px-3 py-3 align-top text-right font-semibold ${
                    overBudget ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {item.actualAnnualCost === null ? "—" : formatCurrency(variance)}
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
