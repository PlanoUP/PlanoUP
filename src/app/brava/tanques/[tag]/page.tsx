"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/brava/PageHeader";
import ExecutiveHeader from "@/components/brava/ExecutiveHeader";
import ExecutiveTimeline from "@/components/brava/ExecutiveTimeline";
import GanttChart from "@/components/brava/GanttChart";
import PlanningEditor from "@/components/brava/PlanningEditor";
import TankNotes from "@/components/brava/TankNotes";
import TankMaterialsSection from "@/components/brava/materials/TankMaterialsSection";
import TankHistorySection from "@/components/brava/materials/TankHistorySection";
import { useBravaData } from "@/lib/brava/context";
import { useMaterialsData } from "@/lib/brava/materials/context";
import { getMaterialsByTank, calculateMaterialReadiness, calculateMaterialRisk } from "@/lib/brava/materials/calculations";
import { cn } from "@/lib/brava/cn";

type TabKey = "VISAO_GERAL" | "PLANEJAMENTO" | "MATERIAIS" | "HISTORICO";

const TABS: { key: TabKey; label: string }[] = [
  { key: "VISAO_GERAL", label: "Visão Geral" },
  { key: "PLANEJAMENTO", label: "Planejamento" },
  { key: "MATERIAIS", label: "Materiais" },
  { key: "HISTORICO", label: "Histórico" },
];

export default function TankDetailPage() {
  const params = useParams<{ tag: string }>();
  const { getTank, today } = useBravaData();
  const { materials } = useMaterialsData();
  const [tab, setTab] = useState<TabKey>("VISAO_GERAL");
  const tank = getTank(decodeURIComponent(params.tag));

  if (!tank) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-8 text-center">
        <p className="text-[15px] font-semibold text-brava-text">Tanque não encontrado</p>
        <p className="text-[13px] text-brava-text-secondary">
          Verifique a TAG pesquisada ou volte para a visão geral.
        </p>
      </div>
    );
  }

  const tankMaterials = getMaterialsByTank(materials, tank.id);
  const readiness = calculateMaterialReadiness(tankMaterials);
  const materialsAlert =
    readiness.criticalPending > 0 ||
    tankMaterials.some((m) => {
      const level = calculateMaterialRisk(m, today).level;
      return level === "RISCO_CRONOGRAMA" || level === "ALTO_RISCO";
    });

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Visão Geral", href: "/brava" }, { label: tank.tag }]}
        title={`Dashboard — ${tank.tag}`}
        subtitle={`${tank.area} · ${tank.product}`}
      />
      <div className="space-y-6 px-5 py-8 sm:px-8 sm:py-10 lg:space-y-8">
        <ExecutiveHeader tank={tank} />

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
              {tab === t.key && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-brava-blue" />}
            </button>
          ))}
        </div>

        {tab === "VISAO_GERAL" && (
          <>
            {tank.activities.length > 0 && <ExecutiveTimeline activities={tank.activities} />}
            <TankNotes tank={tank} />
          </>
        )}

        {tab === "PLANEJAMENTO" &&
          (tank.activities.length > 0 ? (
            <>
              <GanttChart activities={tank.activities} />
              <PlanningEditor tank={tank} />
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-brava-lg border border-dashed border-brava-border bg-brava-white py-14 text-center">
              <FolderOpen className="h-6 w-6 text-brava-text-secondary" strokeWidth={1.5} />
              <p className="text-[13px] font-medium text-brava-text">Sem projeto de manutenção cadastrado</p>
              <p className="max-w-md px-6 text-[12px] text-brava-text-secondary">
                Este ativo é acompanhado apenas pela data de próxima inspeção interna. Nenhum cronograma de
                manutenção foi iniciado para ele.
              </p>
            </div>
          ))}

        {tab === "MATERIAIS" && <TankMaterialsSection tank={tank} />}

        {tab === "HISTORICO" && <TankHistorySection tankId={tank.id} />}
      </div>
    </>
  );
}
