"use client";

import { useBravaData } from "@/lib/brava/context";
import { computeFleetKpis } from "@/lib/brava/selectors";
import { formatLong } from "@/lib/brava/date-utils";
import BlueprintGrid from "./BlueprintGrid";
import TankIllustration from "./TankIllustration";

export default function HeroExecutive() {
  const { tanks, today } = useBravaData();
  const kpis = computeFleetKpis(tanks, today);

  return (
    <section className="relative overflow-hidden border-b border-brava-border bg-brava-white">
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
        {/* Left — executive summary */}
        <div className="relative z-10 flex flex-col justify-center px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brava-blue/15 bg-brava-blue/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brava-blue">
            <span className="h-1.5 w-1.5 rounded-full bg-brava-accent" />
            Brava Energia · Polo Potiguar
          </span>

          <h1 className="mt-5 text-[2.1rem] font-extrabold leading-[1.06] tracking-tight text-brava-blue-dark sm:text-[2.75rem] lg:text-[3.1rem]">
            Central de Controle
            <br />
            de Manutenção de Tanques
          </h1>

          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-brava-text-secondary sm:text-base">
            Acompanhamento executivo do planejamento, execução e avanço físico
            das manutenções de tanques industriais — do início da drenagem ao
            comissionamento.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-brava-border pt-5 text-[13px]">
            <SummaryStat value={kpis.total} label="Tanques monitorados" />
            <Divider />
            <SummaryStat value={kpis.emManutencao} label="Em manutenção" accent />
            <Divider />
            <SummaryStat value={`${kpis.avancoFisicoGeral}%`} label="Avanço geral" />
            <Divider />
            <SummaryStat
              value={kpis.atrasos}
              label="Atrasos ativos"
              tone={kpis.atrasos > 0 ? "danger" : undefined}
            />
          </div>

          <p className="mt-6 text-[11.5px] uppercase tracking-wide text-brava-text-secondary">
            Última atualização · {formatLong(today)}
          </p>
        </div>

        {/* Right — technical composition */}
        <div className="relative hidden min-h-[360px] items-center justify-center overflow-hidden bg-brava-bg lg:flex">
          <BlueprintGrid className="absolute inset-0 h-full w-full text-brava-blue" />
          <TankIllustration
            variant="hero"
            className="relative z-10 h-[260px] w-[260px] text-brava-blue-dark/70 xl:h-[300px] xl:w-[300px]"
          />

          <FloatingChip className="left-[12%] top-[18%]" label="Avanço Físico" value={`${kpis.avancoFisicoGeral}%`} />
          <FloatingChip
            className="bottom-[16%] right-[10%]"
            label="Próximo Marco"
            value={kpis.proximoMarco ? `${kpis.proximoMarco.daysAway}d` : "—"}
            accent
          />
        </div>
      </div>
    </section>
  );
}

function SummaryStat({
  value,
  label,
  accent,
  tone,
}: {
  value: string | number;
  label: string;
  accent?: boolean;
  tone?: "danger";
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className={
          "font-mono text-lg font-bold " +
          (tone === "danger" ? "text-brava-danger" : accent ? "text-brava-blue" : "text-brava-blue-dark")
        }
      >
        {value}
      </span>
      <span className="text-[12px] text-brava-text-secondary">{label}</span>
    </div>
  );
}

function Divider() {
  return <span className="hidden h-4 w-px bg-brava-border sm:block" />;
}

function FloatingChip({
  className,
  label,
  value,
  accent,
}: {
  className: string;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "absolute z-10 flex items-center gap-2.5 rounded-brava-md border border-brava-border bg-brava-white/95 px-3.5 py-2.5 shadow-brava-lg backdrop-blur " +
        className
      }
    >
      <span className={`h-2 w-2 rounded-full ${accent ? "bg-brava-accent" : "bg-brava-blue"}`} />
      <div className="leading-tight">
        <p className="text-[9.5px] font-semibold uppercase tracking-wide text-brava-text-secondary">{label}</p>
        <p className="text-[13px] font-bold text-brava-blue-dark">{value}</p>
      </div>
    </div>
  );
}
