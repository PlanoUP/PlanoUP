"use client";

import { Boxes, Wrench, Gauge, TimerReset } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { computeFleetKpis } from "@/lib/brava/selectors";
import KpiCard from "./KpiCard";

export default function KpiRow() {
  const { tanks, today } = useBravaData();
  const kpis = computeFleetKpis(tanks, today);

  return (
    <div className="flex flex-col divide-y divide-brava-border rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm sm:flex-row sm:divide-x sm:divide-y-0">
      <KpiCard label="Tanques Monitorados" value={kpis.total} icon={Boxes} />
      <KpiCard label="Em Manutenção" value={kpis.emManutencao} icon={Wrench} tone="accent" />
      <KpiCard label="Avanço Geral" value={kpis.avancoFisicoGeral} suffix="%" icon={Gauge} meter={kpis.avancoFisicoGeral} />
      <KpiCard
        label="Atrasos"
        value={kpis.atrasos}
        icon={TimerReset}
        tone={kpis.atrasos > 0 ? "warning" : "neutral"}
        hint={kpis.atividadesCriticas > 0 ? `${kpis.atividadesCriticas} crítico(s)` : "Nenhuma pendência crítica"}
      />
    </div>
  );
}
