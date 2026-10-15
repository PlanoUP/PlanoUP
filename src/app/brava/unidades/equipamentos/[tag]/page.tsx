"use client";

import { useEffect, useState } from "react";
import { FolderOpen } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import PageHeader from "@/components/brava/PageHeader";
import EquipmentExecutiveHeader from "@/components/brava/units/EquipmentExecutiveHeader";
import EquipmentExecutiveTimeline from "@/components/brava/units/EquipmentExecutiveTimeline";
import EquipmentGanttChart from "@/components/brava/units/EquipmentGanttChart";
import EquipmentPlanningEditor from "@/components/brava/units/EquipmentPlanningEditor";
import EquipmentNotes from "@/components/brava/units/EquipmentNotes";
import EquipmentMaterialsSection from "@/components/brava/units/materials/EquipmentMaterialsSection";
import EquipmentHistorySection from "@/components/brava/units/materials/EquipmentHistorySection";
import EquipmentCostsSection from "@/components/brava/units/costs/EquipmentCostsSection";
import { useUnitsData } from "@/lib/brava/units/context";
import { useEquipmentMaterialsData } from "@/lib/brava/units/materials/context";
import { useEquipmentCostsData } from "@/lib/brava/units/costs/context";
import {
  getMaterialsByEquipment,
  calculateMaterialReadiness,
  calculateMaterialRisk,
} from "@/lib/brava/units/materials/calculations";
import { getCostsByTag } from "@/lib/brava/units/costs/calculations";
import { cn } from "@/lib/brava/cn";

type TabKey = "VISAO_GERAL" | "PLANEJAMENTO" | "MATERIAIS" | "CUSTOS" | "HISTORICO";

const TABS: { key: TabKey; label: string }[] = [
  { key: "VISAO_GERAL", label: "Visão Geral" },
  { key: "PLANEJAMENTO", label: "Planejamento" },
  { key: "MATERIAIS", label: "Materiais" },
  { key: "CUSTOS", label: "Custos" },
  { key: "HISTORICO", label: "Histórico" },
];

const TAB_KEYS = TABS.map((t) => t.key);

export default function EquipmentDetailPage() {
  const params = useParams<{ tag: string }>();
  const searchParams = useSearchParams();
  const { getEquipment, today } = useUnitsData();
  const { materials } = useEquipmentMaterialsData();
  const { costs } = useEquipmentCostsData();
  const [tab, setTab] = useState<TabKey>("VISAO_GERAL");
  const equipment = getEquipment(decodeURIComponent(params.tag));

  useEffect(() => {
    const requested = searchParams.get("tab")?.toUpperCase();
    if (requested && TAB_KEYS.includes(requested as TabKey)) {
      setTab(requested as TabKey);
    }
  }, [searchParams]);

  if (!equipment) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-8 text-center">
        <p className="text-[15px] font-semibold text-brava-text">Equipamento não encontrado</p>
        <p className="text-[13px] text-brava-text-secondary">
          Verifique a TAG pesquisada ou volte para a visão geral.
        </p>
      </div>
    );
  }

  const equipmentMaterials = getMaterialsByEquipment(materials, equipment.id);
  const readiness = calculateMaterialReadiness(equipmentMaterials);
  const materialsAlert =
    readiness.criticalPending > 0 ||
    equipmentMaterials.some((m) => {
      const level = calculateMaterialRisk(m, today).level;
      return level === "RISCO_CRONOGRAMA" || level === "ALTO_RISCO";
    });

  const equipmentCosts = getCostsByTag(costs, equipment.tag);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Unidades de Processo", href: "/brava/unidades" }, { label: equipment.tag }]}
        title={`Dashboard — ${equipment.tag}`}
        subtitle={`${equipment.unit} · ${equipment.equipmentType}`}
      />
      <div className="space-y-6 px-5 py-8 sm:px-8 sm:py-10 lg:space-y-8">
        <EquipmentExecutiveHeader equipment={equipment} />

        <div className="flex gap-1 border-b border-brava-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold transition-colors",
                tab === t.key ? "text-brava-blue-dark" : "text-brava-text-secondary hover:text-brava-text"
              )}
            >
              {t.label}
              {t.key === "MATERIAIS" && materialsAlert && (
                <span className="h-1.5 w-1.5 rounded-full bg-brava-danger" />
              )}
              {t.key === "CUSTOS" && equipmentCosts.length > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-brava-accent" />
              )}
              {tab === t.key && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-brava-blue" />}
            </button>
          ))}
        </div>

        {tab === "VISAO_GERAL" && (
          <>
            {equipment.activities.length > 0 && <EquipmentExecutiveTimeline activities={equipment.activities} />}
            <EquipmentNotes equipment={equipment} />
          </>
        )}

        {tab === "PLANEJAMENTO" &&
          (equipment.activities.length > 0 ? (
            <>
              <EquipmentGanttChart activities={equipment.activities} />
              <EquipmentPlanningEditor equipment={equipment} />
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-brava-lg border border-dashed border-brava-border bg-brava-white py-14 text-center">
              <FolderOpen className="h-6 w-6 text-brava-text-secondary" strokeWidth={1.5} />
              <p className="text-[13px] font-medium text-brava-text">Sem projeto de parada cadastrado</p>
              <p className="max-w-md px-6 text-[12px] text-brava-text-secondary">
                Nenhum cronograma de parada foi iniciado para este equipamento ainda.
              </p>
            </div>
          ))}

        {tab === "MATERIAIS" && <EquipmentMaterialsSection equipment={equipment} />}

        {tab === "CUSTOS" && <EquipmentCostsSection equipment={equipment} />}

        {tab === "HISTORICO" && <EquipmentHistorySection equipmentId={equipment.id} />}
      </div>
    </>
  );
}
