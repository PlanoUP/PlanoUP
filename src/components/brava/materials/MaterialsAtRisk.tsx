"use client";

import Link from "next/link";
import { useBravaData } from "@/lib/brava/context";
import { Material } from "@/lib/brava/materials/types";
import { calculateMaterialRisk } from "@/lib/brava/materials/calculations";
import { formatShort } from "@/lib/brava/date-utils";
import MaterialCriticalityBadge from "./MaterialCriticalityBadge";
import MaterialRiskBadge from "./MaterialRiskBadge";
import SectionHeading from "../SectionHeading";

export default function MaterialsAtRisk({ materials }: { materials: Material[] }) {
  const { tanks, today } = useBravaData();

  const atRisk = materials
    .map((m) => ({ material: m, risk: calculateMaterialRisk(m, today) }))
    .filter((r) => r.risk.level === "RISCO_CRONOGRAMA" || r.risk.level === "ALTO_RISCO")
    .sort((a, b) => (b.risk.impactDays ?? 0) - (a.risk.impactDays ?? 0));

  if (atRisk.length === 0) return null;

  return (
    <div>
      <SectionHeading
        eyebrow="Atenção"
        title="Materiais em Risco"
        subtitle="Previsão de entrega após a data de necessidade, ou item crítico sem previsão próximo do prazo"
      />
      <div className="divide-y divide-brava-border rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm">
        {atRisk.map(({ material, risk }) => {
          const tank = tanks.find((t) => t.id === material.tankId);
          return (
            <div key={material.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {tank && (
                    <Link
                      href={`/brava/tanques/${tank.tag}`}
                      className="font-mono text-[12.5px] font-bold text-brava-blue-dark hover:underline"
                    >
                      {tank.tag}
                    </Link>
                  )}
                  <MaterialCriticalityBadge criticality={material.criticality} size="sm" />
                </div>
                <p className="mt-0.5 truncate text-[13.5px] font-semibold text-brava-text">{material.description}</p>
                <p className="mt-0.5 text-[11.5px] text-brava-text-secondary">
                  Necessidade: {formatShort(material.requiredDate)} · Entrega:{" "}
                  {material.expectedDeliveryDate ? formatShort(material.expectedDeliveryDate) : "Não informada"}
                </p>
              </div>
              <MaterialRiskBadge result={risk} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
