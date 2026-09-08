"use client";

import { Boxes, Wrench, CalendarClock, CheckCircle2, Gauge, AlertTriangle, Flag, TimerReset } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { computeFleetKpis } from "@/lib/brava/selectors";
import { formatShort } from "@/lib/brava/date-utils";
import KpiCard from "./KpiCard";

export default function KpiRow() {
  const { tanks, today } = useBravaData();
  const kpis = computeFleetKpis(tanks, today);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <KpiCard label="Total de Tanques" value={kpis.total} icon={Boxes} />
      <KpiCard label="Em Manutenção" value={kpis.emManutencao} icon={Wrench} tone="accent" />
      <KpiCard label="Programados" value={kpis.programados} icon={CalendarClock} />
      <KpiCard label="Concluídos" value={kpis.concluidos} icon={CheckCircle2} />
      <KpiCard label="Avanço Físico Geral" value={kpis.avancoFisicoGeral} suffix="%" icon={Gauge} tone="accent" />
      <KpiCard
        label="Críticas"
        value={kpis.atividadesCriticas}
        icon={AlertTriangle}
        tone={kpis.atividadesCriticas > 0 ? "danger" : "neutral"}
      />
      <KpiCard
        label="Atrasos"
        value={kpis.atrasos}
        icon={TimerReset}
        tone={kpis.atrasos > 0 ? "warning" : "neutral"}
      />
      <KpiCard
        label="Próximo Marco"
        value={kpis.proximoMarco ? kpis.proximoMarco.tag : "—"}
        icon={Flag}
        hint={kpis.proximoMarco ? `${kpis.proximoMarco.name} · ${formatShort(kpis.proximoMarco.date)}` : undefined}
      />
    </div>
  );
}
