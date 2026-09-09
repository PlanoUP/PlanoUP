"use client";

import { useState } from "react";
import { Check, AlertTriangle, Plus, Boxes, PackageCheck, Truck, ShieldAlert } from "lucide-react";
import { TankWithDerived } from "@/lib/brava/types";
import { useBravaData } from "@/lib/brava/context";
import { useMaterialsData } from "@/lib/brava/materials/context";
import { Material } from "@/lib/brava/materials/types";
import {
  calculateMaterialReadiness,
  calculateMaterialRisk,
  getMaterialsByTank,
} from "@/lib/brava/materials/calculations";
import { READY_STATUSES } from "@/lib/brava/materials/meta";
import KpiCard from "../KpiCard";
import SectionHeading from "../SectionHeading";
import MaterialFormDrawer from "./MaterialFormDrawer";
import MaterialDetailDrawer from "./MaterialDetailDrawer";
import MaterialsTable from "./MaterialsTable";
import { cn } from "@/lib/brava/cn";

export default function TankMaterialsSection({ tank }: { tank: TankWithDerived }) {
  const { today } = useBravaData();
  const { materials } = useMaterialsData();
  const tankMaterials = getMaterialsByTank(materials, tank.id);

  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | undefined>(undefined);
  const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null);
  const [prefillActivityId, setPrefillActivityId] = useState<string | undefined>(undefined);

  const readiness = calculateMaterialReadiness(tankMaterials);
  const disponiveis = tankMaterials.filter((m) => READY_STATUSES.includes(m.status)).length;
  const emAquisicao = tankMaterials.filter((m) =>
    ["SOLICITACAO_EM_ANDAMENTO", "EM_COTACAO", "PEDIDO_EMITIDO", "EM_FABRICACAO", "EM_TRANSPORTE"].includes(m.status)
  ).length;
  const emRisco = tankMaterials.filter((m) => {
    const level = calculateMaterialRisk(m, today).level;
    return level === "RISCO_CRONOGRAMA" || level === "ALTO_RISCO";
  }).length;

  const ordered = [...tank.activities].sort((a, b) => a.order - b.order);
  const generalMaterials = tankMaterials.filter((m) => !m.activityId);

  function openCreate(activityId?: string) {
    setEditingMaterial(undefined);
    setPrefillActivityId(activityId);
    setFormOpen(true);
  }

  function openEdit(m: Material) {
    setEditingMaterial(m);
    setPrefillActivityId(undefined);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionHeading
          eyebrow="Material Control"
          title="Materiais do Tanque"
          subtitle="Prontidão de materiais e associação com as atividades do cronograma"
          actions={
            <button
              onClick={() => openCreate(undefined)}
              className="inline-flex items-center gap-1.5 rounded-brava-sm bg-brava-blue px-3.5 py-2 text-[12.5px] font-semibold text-brava-white transition-colors hover:bg-brava-blue-dark"
            >
              <Plus className="h-3.5 w-3.5" />
              Cadastrar Material
            </button>
          }
        />
        <div className="flex flex-col divide-y divide-brava-border rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm sm:flex-row sm:flex-wrap sm:divide-y-0">
          <KpiCard label="Material Readiness" value={readiness.percent} suffix="%" icon={Boxes} meter={readiness.percent} />
          <KpiCard label="Itens Necessários" value={tankMaterials.length} icon={Boxes} />
          <KpiCard label="Disponíveis" value={disponiveis} icon={PackageCheck} />
          <KpiCard label="Em Aquisição" value={emAquisicao} icon={Truck} />
          <KpiCard
            label="Críticos Pendentes"
            value={readiness.criticalPending}
            icon={AlertTriangle}
            tone={readiness.criticalPending > 0 ? "danger" : "neutral"}
          />
          <KpiCard label="Risco ao Cronograma" value={emRisco} icon={ShieldAlert} tone={emRisco > 0 ? "danger" : "neutral"} />
        </div>
        {readiness.criticalPending > 0 && (
          <p className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-brava-danger">
            <AlertTriangle className="h-3.5 w-3.5" />
            {readiness.criticalPending} item(ns) crítico(s) pendente(s)
          </p>
        )}
      </div>

      {tankMaterials.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-brava-lg border border-dashed border-brava-border py-14 text-center">
          <p className="text-[13px] font-medium text-brava-text">Nenhum material cadastrado para este tanque</p>
          <p className="mt-1 max-w-sm px-6 text-[12px] text-brava-text-secondary">
            Cadastre os materiais necessários e associe-os às atividades do cronograma para acompanhar a prontidão.
          </p>
        </div>
      ) : (
        <>
          {ordered.length > 0 && (
            <div>
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-brava-text-secondary">
                Materiais por Atividade
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ordered.map((activity) => {
                  const items = tankMaterials.filter((m) => m.activityId === activity.id);
                  if (items.length === 0) return null;
                  return (
                    <div key={activity.id} className="rounded-brava-lg border border-brava-border bg-brava-white p-4 shadow-brava-sm">
                      <p className="mb-2.5 truncate text-[12.5px] font-bold uppercase tracking-wide text-brava-blue-dark" title={activity.name}>
                        {activity.name}
                      </p>
                      <ul className="space-y-1.5">
                        {items.map((m) => {
                          const ready = READY_STATUSES.includes(m.status);
                          return (
                            <li key={m.id}>
                              <button
                                onClick={() => setViewingMaterial(m)}
                                className="flex w-full items-center gap-2 rounded-brava-sm px-1.5 py-1 text-left transition-colors hover:bg-brava-bg"
                              >
                                {ready ? (
                                  <Check className="h-3.5 w-3.5 shrink-0 text-brava-success" strokeWidth={2.5} />
                                ) : (
                                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-brava-warning" strokeWidth={2} />
                                )}
                                <span className={cn("truncate text-[12.5px]", ready ? "text-brava-text-secondary" : "text-brava-text")}>
                                  {m.description}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}

                {generalMaterials.length > 0 && (
                  <div className="rounded-brava-lg border border-brava-border bg-brava-white p-4 shadow-brava-sm">
                    <p className="mb-2.5 text-[12.5px] font-bold uppercase tracking-wide text-brava-blue-dark">
                      Geral do Tanque
                    </p>
                    <ul className="space-y-1.5">
                      {generalMaterials.map((m) => {
                        const ready = READY_STATUSES.includes(m.status);
                        return (
                          <li key={m.id}>
                            <button
                              onClick={() => setViewingMaterial(m)}
                              className="flex w-full items-center gap-2 rounded-brava-sm px-1.5 py-1 text-left transition-colors hover:bg-brava-bg"
                            >
                              {ready ? (
                                <Check className="h-3.5 w-3.5 shrink-0 text-brava-success" strokeWidth={2.5} />
                              ) : (
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-brava-warning" strokeWidth={2} />
                              )}
                              <span className={cn("truncate text-[12.5px]", ready ? "text-brava-text-secondary" : "text-brava-text")}>
                                {m.description}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <MaterialsTable
            materials={tankMaterials}
            sortKey="PADRAO"
            onSortKeyChange={() => {}}
            onView={setViewingMaterial}
            onEdit={openEdit}
          />
        </>
      )}

      <MaterialFormDrawer
        open={formOpen}
        onClose={() => setFormOpen(false)}
        material={editingMaterial}
        defaultTankId={tank.id}
        defaultActivityId={prefillActivityId}
      />
      <MaterialDetailDrawer open={!!viewingMaterial} onClose={() => setViewingMaterial(null)} material={viewingMaterial} />
    </div>
  );
}
