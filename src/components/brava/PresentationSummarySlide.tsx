"use client";

import { Boxes, Wrench, Gauge, TimerReset, Flag } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { computeFleetKpis } from "@/lib/brava/selectors";
import { formatShort } from "@/lib/brava/date-utils";
import { cn } from "@/lib/brava/cn";

export default function PresentationSummarySlide() {
  const { tanks, today } = useBravaData();
  const kpis = computeFleetKpis(tanks, today);

  return (
    <div className="flex h-full flex-col justify-center gap-10 px-6 sm:px-16">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-8">
        <BigStat icon={Boxes} label="Tanques Monitorados" value={kpis.total} />
        <BigStat icon={Wrench} label="Em Manutenção" value={kpis.emManutencao} accent />
        <BigStat icon={Gauge} label="Avanço Geral" value={kpis.avancoFisicoGeral} suffix="%" />
        <BigStat
          icon={TimerReset}
          label="Atrasos"
          value={kpis.atrasos}
          danger={kpis.atrasos > 0}
          hint={kpis.atividadesCriticas > 0 ? `${kpis.atividadesCriticas} crítico(s)` : undefined}
        />
      </div>

      {kpis.proximoMarco && (
        <div className="flex items-center gap-4 self-center rounded-brava-lg border border-brava-border bg-brava-white px-7 py-5">
          <Flag className="h-6 w-6 shrink-0 text-brava-accent" strokeWidth={2} />
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-brava-text-secondary">
              Próximo marco — {kpis.proximoMarco.tag}
            </p>
            <p className="mt-0.5 text-[20px] font-extrabold text-brava-blue-dark">
              {kpis.proximoMarco.name}
              <span className="ml-3 text-[15px] font-semibold text-brava-text-secondary">
                {formatShort(kpis.proximoMarco.date)} · {kpis.proximoMarco.daysAway}d
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function BigStat({
  icon: Icon,
  label,
  value,
  suffix,
  hint,
  accent,
  danger,
}: {
  icon: typeof Boxes;
  label: string;
  value: number;
  suffix?: string;
  hint?: string;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-brava-lg border border-brava-border bg-brava-white px-4 py-8 text-center">
      <Icon
        className={cn("h-6 w-6", danger ? "text-brava-danger" : accent ? "text-brava-accent" : "text-brava-text-secondary")}
        strokeWidth={1.75}
      />
      <p
        className={cn(
          "font-mono text-[52px] font-extrabold leading-none tracking-tight sm:text-[68px]",
          danger ? "text-brava-danger" : "text-brava-blue-dark"
        )}
      >
        {value}
        {suffix}
      </p>
      <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-brava-text-secondary">{label}</p>
      {hint && <p className="text-[12px] font-semibold text-brava-warning">{hint}</p>}
    </div>
  );
}
