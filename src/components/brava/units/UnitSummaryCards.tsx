"use client";

import { Factory } from "lucide-react";
import { useUnitsData } from "@/lib/brava/units/context";
import { computeUnitSummaries } from "@/lib/brava/units/selectors";
import ProgressBar from "../ProgressBar";

export default function UnitSummaryCards() {
  const { equipment } = useUnitsData();
  const summaries = computeUnitSummaries(equipment);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {summaries.map((s) => (
        <div key={s.unit} className="rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-brava-sm bg-brava-blue/10 text-brava-blue">
              <Factory className="h-4.5 w-4.5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[15px] font-extrabold tracking-tight text-brava-blue-dark">{s.unit}</p>
              <p className="text-[11.5px] text-brava-text-secondary">{s.total} equipamentos cadastrados</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-brava-text-secondary">Em manutenção</p>
              <p className="font-semibold text-brava-blue">{s.emManutencao}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-brava-text-secondary">Concluídos</p>
              <p className="font-semibold text-brava-success">{s.concluidos}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[11px] text-brava-text-secondary">
              <span>Avanço físico</span>
              <span className="font-mono font-bold text-brava-text">{s.avancoFisico}%</span>
            </div>
            <ProgressBar value={s.avancoFisico} />
          </div>
        </div>
      ))}
    </div>
  );
}
