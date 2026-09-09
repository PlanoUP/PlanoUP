"use client";

import { Pencil, Copy, Trash2, Eye } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { useMaterialsData } from "@/lib/brava/materials/context";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import { Material, MaterialsSortKey } from "@/lib/brava/materials/types";
import { calculateMaterialRisk } from "@/lib/brava/materials/calculations";
import { formatShort } from "@/lib/brava/date-utils";
import MaterialStatusBadge from "./MaterialStatusBadge";
import MaterialCriticalityBadge from "./MaterialCriticalityBadge";
import MaterialRiskBadge from "./MaterialRiskBadge";

const SORT_OPTIONS: { value: MaterialsSortKey; label: string }[] = [
  { value: "PADRAO", label: "Padrão (risco e criticidade primeiro)" },
  { value: "NECESSIDADE", label: "Data de Necessidade" },
  { value: "ENTREGA", label: "Previsão de Entrega" },
  { value: "CRITICIDADE", label: "Criticidade" },
  { value: "STATUS", label: "Status" },
  { value: "TANQUE", label: "Tanque" },
  { value: "MATERIAL", label: "Material" },
];

export default function MaterialsTable({
  materials,
  sortKey,
  onSortKeyChange,
  onView,
  onEdit,
}: {
  materials: Material[];
  sortKey: MaterialsSortKey;
  onSortKeyChange: (key: MaterialsSortKey) => void;
  onView: (m: Material) => void;
  onEdit: (m: Material) => void;
}) {
  const { tanks, today } = useBravaData();
  const { deleteMaterial, duplicateMaterial } = useMaterialsData();
  const { requireEditor } = useEditAuth();

  function handleDelete(m: Material) {
    if (!requireEditor()) return;
    if (window.confirm(`Excluir "${m.description}"? Essa ação não pode ser desfeita.`)) {
      deleteMaterial(m.id);
    }
  }

  function handleDuplicate(m: Material) {
    if (!requireEditor()) return;
    duplicateMaterial(m.id);
  }

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm">
      <div className="flex items-center justify-between gap-3 border-b border-brava-border px-5 py-3">
        <p className="text-[12px] text-brava-text-secondary">{materials.length} material(is)</p>
        <label className="flex items-center gap-2 text-[11.5px] text-brava-text-secondary">
          Ordenar por
          <select
            value={sortKey}
            onChange={(e) => onSortKeyChange(e.target.value as MaterialsSortKey)}
            className="rounded-brava-sm border border-brava-border bg-brava-white px-2 py-1 text-[12px] text-brava-text focus:border-brava-blue focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-[13px] font-medium text-brava-text">Nenhum material cadastrado</p>
          <p className="text-[12px] text-brava-text-secondary">
            Ajuste os filtros ou cadastre o primeiro material do módulo.
          </p>
        </div>
      ) : (
        <div className="brava-scrollbar overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b border-brava-border text-left text-[10.5px] uppercase tracking-wide text-brava-text-secondary">
                <th className="px-5 py-2.5 font-medium">Material</th>
                <th className="px-3 py-2.5 font-medium">Categoria</th>
                <th className="px-3 py-2.5 font-medium">Tanque</th>
                <th className="px-3 py-2.5 font-medium">Atividade</th>
                <th className="px-3 py-2.5 font-medium">Qtd.</th>
                <th className="px-3 py-2.5 font-medium">Disponível</th>
                <th className="px-3 py-2.5 font-medium">Necessidade</th>
                <th className="px-3 py-2.5 font-medium">Entrega Prevista</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Criticidade</th>
                <th className="px-3 py-2.5 font-medium">Risco</th>
                <th className="px-3 py-2.5 font-medium">Responsável</th>
                <th className="px-3 py-2.5 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => {
                const tank = tanks.find((t) => t.id === m.tankId);
                const activity = tank?.activities.find((a) => a.id === m.activityId);
                const risk = calculateMaterialRisk(m, today);
                return (
                  <tr key={m.id} className="border-b border-brava-border/70 last:border-0 hover:bg-brava-bg/50">
                    <td className="max-w-[200px] px-5 py-3">
                      <p className="truncate font-medium text-brava-text" title={m.description}>
                        {m.description}
                      </p>
                      {m.code && <p className="truncate text-[11px] text-brava-text-secondary">{m.code}</p>}
                    </td>
                    <td className="px-3 py-3 text-brava-text-secondary">{m.category}</td>
                    <td className="px-3 py-3">
                      <span className="font-mono font-semibold text-brava-blue-dark">{tank?.tag ?? "—"}</span>
                    </td>
                    <td className="max-w-[160px] truncate px-3 py-3 text-brava-text-secondary" title={activity?.name}>
                      {activity?.name ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-brava-text">
                      {m.quantityRequired} {m.unit}
                    </td>
                    <td className="px-3 py-3 text-brava-text">
                      {m.quantityAvailable} {m.unit}
                    </td>
                    <td className="px-3 py-3 text-brava-text-secondary">{formatShort(m.requiredDate)}</td>
                    <td className="px-3 py-3 text-brava-text-secondary">{formatShort(m.expectedDeliveryDate)}</td>
                    <td className="px-3 py-3">
                      <MaterialStatusBadge status={m.status} size="sm" />
                    </td>
                    <td className="px-3 py-3">
                      <MaterialCriticalityBadge criticality={m.criticality} size="sm" />
                    </td>
                    <td className="px-3 py-3">
                      <MaterialRiskBadge result={risk} size="sm" showDetail={false} />
                    </td>
                    <td className="max-w-[120px] truncate px-3 py-3 text-brava-text-secondary">
                      {m.responsible || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <RowAction icon={Eye} label="Visualizar" onClick={() => onView(m)} />
                        <RowAction icon={Pencil} label="Editar" onClick={() => onEdit(m)} />
                        <RowAction icon={Copy} label="Duplicar" onClick={() => handleDuplicate(m)} />
                        <RowAction icon={Trash2} label="Excluir" onClick={() => handleDelete(m)} danger />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RowAction({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded-brava-sm p-1.5 transition-colors ${
        danger
          ? "text-brava-text-secondary hover:bg-brava-danger-bg hover:text-brava-danger"
          : "text-brava-text-secondary hover:bg-brava-bg hover:text-brava-blue"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
