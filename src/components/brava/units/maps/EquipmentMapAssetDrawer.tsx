"use client";

import Link from "next/link";
import { X, ArrowUpRight, AlertTriangle, Factory } from "lucide-react";
import { EquipmentWithDerived } from "@/lib/brava/units/types";
import { useEquipmentMaterialsData } from "@/lib/brava/units/materials/context";
import {
  getMaterialsByEquipment,
  calculateMaterialReadiness,
  calculateMaterialRisk,
} from "@/lib/brava/units/materials/calculations";
import { formatShort } from "@/lib/brava/date-utils";
import EquipmentStatusBadge from "../EquipmentStatusBadge";

export default function EquipmentMapAssetDrawer({
  tag,
  equipment,
  today,
  onClose,
}: {
  tag: string;
  equipment: EquipmentWithDerived | null;
  today: string;
  onClose: () => void;
}) {
  const { materials } = useEquipmentMaterialsData();
  const equipmentMaterials = equipment ? getMaterialsByEquipment(materials, equipment.id) : [];
  const readiness = calculateMaterialReadiness(equipmentMaterials);
  const materialsAtRisk = equipmentMaterials.filter((m) => {
    const level = calculateMaterialRisk(m, today).level;
    return level === "RISCO_CRONOGRAMA" || level === "ALTO_RISCO";
  }).length;
  const criticalMaterialAtRisk = equipmentMaterials.some((m) => {
    if (m.criticality !== "CRITICO") return false;
    const level = calculateMaterialRisk(m, today).level;
    return level === "RISCO_CRONOGRAMA" || level === "ALTO_RISCO";
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-stretch">
      <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-brava-blue-dark/40 backdrop-blur-[1px]" />
      <div className="relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl bg-brava-white shadow-brava-lg sm:h-full sm:max-h-none sm:w-full sm:max-w-[420px] sm:rounded-none">
        <div className="flex items-center justify-between border-b border-brava-border px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brava-blue">Ativo Selecionado</p>
          <button onClick={onClose} className="rounded-brava-sm p-1.5 text-brava-text-secondary transition-colors hover:bg-brava-bg hover:text-brava-text">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="brava-scrollbar flex-1 overflow-y-auto">
          <div className="relative flex h-40 w-full items-center justify-center bg-brava-bg">
            <Factory className="h-16 w-16 text-brava-border" strokeWidth={1.5} />
          </div>

          <div className="px-5 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-mono text-[22px] font-extrabold tracking-tight text-brava-blue-dark">{tag}</h2>
              {equipment && <EquipmentStatusBadge status={equipment.status} size="sm" />}
            </div>
            {equipment ? (
              <>
                <p className="mt-1 text-[12.5px] text-brava-text-secondary">
                  {equipment.unit} · {equipment.equipmentType}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-brava-border pt-4">
                  <Field label="Avanço">
                    <span className="font-mono text-[15px] font-bold text-brava-blue-dark">{equipment.derived.progress}%</span>
                  </Field>
                  <Field label="Início Previsto">
                    <span className="text-[13px] font-medium text-brava-text">{formatShort(equipment.derived.plannedStart)}</span>
                  </Field>
                  <Field label="Conclusão Prevista">
                    <span className="text-[13px] font-medium text-brava-text">{formatShort(equipment.derived.plannedEnd)}</span>
                  </Field>
                  <Field label="Próximo Marco" span2>
                    <span className="text-[13px] font-medium text-brava-text">
                      {equipment.derived.nextMilestone ? equipment.derived.nextMilestone.name : "—"}
                    </span>
                  </Field>
                </div>

                {equipmentMaterials.length > 0 && (
                  <div className="mt-4 rounded-brava-md border border-brava-border bg-brava-bg p-3.5">
                    <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-brava-text-secondary">
                      Materiais
                    </p>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="text-brava-text-secondary">Prontidão</span>
                      <span className="font-mono font-bold text-brava-blue-dark">{readiness.percent}%</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[12.5px]">
                      <span className="text-brava-text-secondary">Pendências críticas</span>
                      <span className="font-mono font-bold text-brava-text">{readiness.criticalPending}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[12.5px]">
                      <span className="text-brava-text-secondary">Itens em risco</span>
                      <span className="font-mono font-bold text-brava-text">{materialsAtRisk}</span>
                    </div>
                    {criticalMaterialAtRisk && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-brava-danger">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Material Crítico
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="mt-3 text-[13px] text-brava-text-secondary">
                Este ativo ainda não possui um dashboard cadastrado no sistema.
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-brava-border px-5 py-4">
          {equipment ? (
            <Link
              href={`/brava/unidades/equipamentos/${equipment.tag}`}
              className="flex items-center justify-center gap-1.5 rounded-brava-sm bg-brava-blue px-4 py-2.5 text-[13px] font-semibold text-brava-white transition-colors hover:bg-brava-blue-dark"
            >
              Abrir Dashboard do Equipamento
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              disabled
              className="flex w-full items-center justify-center gap-1.5 rounded-brava-sm border border-brava-border bg-brava-bg px-4 py-2.5 text-[13px] font-semibold text-brava-text-secondary"
            >
              Dashboard Não Cadastrado
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? "col-span-2" : undefined}>
      <p className="mb-1 text-[10px] uppercase tracking-wide text-brava-text-secondary">{label}</p>
      {children}
    </div>
  );
}
