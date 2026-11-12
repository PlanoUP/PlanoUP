"use client";

import { useMemo } from "react";
import { TankWithDerived } from "@/lib/brava/types";
import { buildPhysicalSCurve } from "@/lib/brava/scurve";
import { formatShort, todayISO } from "@/lib/brava/date-utils";
import PhysicalScurveChart from "./PhysicalScurveChart";

export default function TankScurveSection({ tank }: { tank: TankWithDerived }) {
  const scurve = useMemo(() => buildPhysicalSCurve([tank]), [tank]);

  if (scurve.length === 0) return null;

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm sm:p-6">
      <h3 className="mb-1 text-[14px] font-bold text-brava-text">Curva S — Avanço Físico</h3>
      <p className="mb-4 text-[12.5px] text-brava-text-secondary">Previsto x Realizado acumulado para este tanque.</p>
      <PhysicalScurveChart data={scurve} height={220} />
      <p className="mt-3 text-[11px] italic leading-relaxed text-brava-text-secondary">
        O trecho do Realizado antes de hoje ({formatShort(todayISO())}) é uma estimativa por interpolação linear a partir
        do início real de cada etapa — o sistema ainda não guarda um histórico semanal de avanço registrado.
      </p>
    </div>
  );
}
