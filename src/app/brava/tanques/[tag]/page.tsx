"use client";

import { FolderOpen } from "lucide-react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/brava/PageHeader";
import ExecutiveHeader from "@/components/brava/ExecutiveHeader";
import ExecutiveTimeline from "@/components/brava/ExecutiveTimeline";
import GanttChart from "@/components/brava/GanttChart";
import PlanningEditor from "@/components/brava/PlanningEditor";
import TankNotes from "@/components/brava/TankNotes";
import { useBravaData } from "@/lib/brava/context";

export default function TankDetailPage() {
  const params = useParams<{ tag: string }>();
  const { getTank } = useBravaData();
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

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Visão Geral", href: "/brava" }, { label: tank.tag }]}
        title={`Dashboard — ${tank.tag}`}
        subtitle={`${tank.area} · ${tank.product}`}
      />
      <div className="space-y-6 px-5 py-8 sm:px-8 sm:py-10 lg:space-y-8">
        <ExecutiveHeader tank={tank} />
        {tank.activities.length > 0 ? (
          <>
            <ExecutiveTimeline activities={tank.activities} />
            <GanttChart activities={tank.activities} />
            <PlanningEditor tank={tank} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-brava-lg border border-dashed border-brava-border bg-brava-white py-14 text-center">
            <FolderOpen className="h-6 w-6 text-brava-text-secondary" strokeWidth={1.5} />
            <p className="text-[13px] font-medium text-brava-text">
              Sem projeto de manutenção cadastrado
            </p>
            <p className="max-w-md px-6 text-[12px] text-brava-text-secondary">
              Este ativo é acompanhado apenas pela data de próxima inspeção interna, abaixo.
              Nenhum cronograma de manutenção foi iniciado para ele.
            </p>
          </div>
        )}
        <TankNotes tank={tank} />
      </div>
    </>
  );
}
