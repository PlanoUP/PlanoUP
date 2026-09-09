"use client";

import { Boxes, PackageCheck, Truck, TimerReset, AlertTriangle, ShieldAlert, Gauge } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { useMaterialsData } from "@/lib/brava/materials/context";
import { computeMaterialsKpis } from "@/lib/brava/materials/calculations";
import KpiCard from "../KpiCard";

export default function MaterialsKpiRow() {
  const { today } = useBravaData();
  const { materials } = useMaterialsData();
  const kpis = computeMaterialsKpis(materials, today);

  return (
    <div className="flex flex-col divide-y divide-brava-border rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm sm:flex-row sm:flex-wrap sm:divide-y-0">
      <KpiCard label="Itens Cadastrados" value={kpis.total} icon={Boxes} />
      <KpiCard label="Disponíveis" value={kpis.disponiveis} icon={PackageCheck} />
      <KpiCard label="Em Aquisição" value={kpis.emAquisicao} icon={Truck} />
      <KpiCard
        label="Em Atraso"
        value={kpis.emAtraso}
        icon={TimerReset}
        tone={kpis.emAtraso > 0 ? "warning" : "neutral"}
      />
      <KpiCard
        label="Itens Críticos"
        value={kpis.criticos}
        icon={AlertTriangle}
        tone={kpis.criticalPending > 0 ? "danger" : "neutral"}
        hint={kpis.criticalPending > 0 ? `${kpis.criticalPending} pendente(s)` : undefined}
      />
      <KpiCard
        label="Risco ao Cronograma"
        value={kpis.emRisco}
        icon={ShieldAlert}
        tone={kpis.emRisco > 0 ? "danger" : "neutral"}
      />
      <KpiCard
        label="Prontidão Geral"
        value={kpis.readinessPercent}
        suffix="%"
        icon={Gauge}
        meter={kpis.readinessPercent}
      />
    </div>
  );
}
