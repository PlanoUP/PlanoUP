"use client";

import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { useMaterialsData } from "@/lib/brava/materials/context";
import { calculateMaterialRisk, computeMaterialsKpis, formatMaterialRiskDetail } from "@/lib/brava/materials/calculations";
import { formatShort } from "@/lib/brava/date-utils";

export default function MaterialsHomeSummary() {
  const { tanks, today } = useBravaData();
  const { materials } = useMaterialsData();

  if (materials.length === 0) return null;

  const kpis = computeMaterialsKpis(materials, today);
  const risks = materials
    .map((m) => ({ material: m, risk: calculateMaterialRisk(m, today) }))
    .filter((r) => r.risk.level === "RISCO_CRONOGRAMA" || r.risk.level === "ALTO_RISCO")
    .sort((a, b) => (b.risk.impactDays ?? 0) - (a.risk.impactDays ?? 0))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-4 rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-brava-text-secondary" strokeWidth={1.75} />
          <span className="text-[11px] font-bold uppercase tracking-wide text-brava-text-secondary">
            Prontidão de Materiais
          </span>
        </div>
        <div className="flex items-center gap-5">
          <MiniStat value={`${kpis.readinessPercent}%`} label="Prontidão" />
          <MiniStat value={kpis.criticos} label="Críticos" tone={kpis.criticos > 0 ? "danger" : "neutral"} />
          <MiniStat value={kpis.emRisco} label="Com Risco" tone={kpis.emRisco > 0 ? "danger" : "neutral"} />
          <MiniStat value={kpis.emAtraso} label="Em Atraso" tone={kpis.emAtraso > 0 ? "warning" : "neutral"} />
        </div>
      </div>

      {risks.length > 0 && (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-brava-border pt-3 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
          <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-wide text-brava-text-secondary">
            Próximos Riscos
          </span>
          {risks.map(({ material, risk }) => {
            const tank = tanks.find((t) => t.id === material.tankId);
            return (
              <span key={material.id} className="text-[12px] text-brava-text">
                <span className="font-mono font-semibold text-brava-blue-dark">{tank?.tag}</span>{" "}
                <span className="text-brava-text-secondary">{material.description}</span>{" "}
                <span className="font-semibold text-brava-danger">
                  {formatMaterialRiskDetail(risk) ||
                    (material.expectedDeliveryDate ? formatShort(material.expectedDeliveryDate) : "sem previsão")}
                </span>
              </span>
            );
          })}
        </div>
      )}

      <Link
        href="/brava/materiais"
        className="inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-semibold text-brava-blue hover:text-brava-blue-dark"
      >
        Ver Materiais
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function MiniStat({
  value,
  label,
  tone = "neutral",
}: {
  value: string | number;
  label: string;
  tone?: "neutral" | "danger" | "warning";
}) {
  const toneClass = {
    neutral: "text-brava-blue-dark",
    danger: "text-brava-danger",
    warning: "text-brava-warning",
  }[tone];
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`font-mono text-[18px] font-extrabold leading-none ${toneClass}`}>{value}</span>
      <span className="text-[10.5px] text-brava-text-secondary">{label}</span>
    </div>
  );
}
