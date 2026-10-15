"use client";

import { useMemo, useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Percent } from "lucide-react";
import { EquipmentWithDerived } from "@/lib/brava/units/types";
import { useEquipmentCostsData } from "@/lib/brava/units/costs/context";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import { computeCostTotals, buildCostScurve, getCostsByTag, formatCostMM } from "@/lib/brava/units/costs/calculations";
import { COST_PERIOD_LABELS } from "@/lib/brava/costs/types";
import KpiCard from "../../KpiCard";
import SectionHeading from "../../SectionHeading";
import CostScurveChart from "../../costs/CostScurveChart";

export default function EquipmentCostsSection({ equipment }: { equipment: EquipmentWithDerived }) {
  const { costs, updateCost } = useEquipmentCostsData();
  const { requireEditor } = useEditAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");

  const equipmentCosts = useMemo(() => getCostsByTag(costs, equipment.tag), [costs, equipment.tag]);
  const totals = useMemo(() => computeCostTotals(equipmentCosts), [equipmentCosts]);
  const scurve = useMemo(() => buildCostScurve(equipmentCosts), [equipmentCosts]);

  function startEdit(id: string, current: number | null) {
    if (!requireEditor()) return;
    setEditingId(id);
    setDraftValue(current === null ? "" : String(current));
  }

  function commitEdit(id: string) {
    const parsed = draftValue.trim() === "" ? null : Number(draftValue.replace(",", "."));
    if (parsed !== null && Number.isNaN(parsed)) {
      setEditingId(null);
      return;
    }
    updateCost(id, { realizado: parsed });
    setEditingId(null);
  }

  if (equipmentCosts.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Cost Control"
          title="Custos do Equipamento"
          subtitle="Acompanhamento de CAPEX — orçado x realizado para este equipamento"
        />
        <div className="flex flex-col items-center justify-center rounded-brava-lg border border-dashed border-brava-border py-14 text-center">
          <p className="text-[13px] font-medium text-brava-text">Nenhum custo cadastrado para este equipamento</p>
          <p className="mt-1 max-w-sm px-6 text-[12px] text-brava-text-secondary">
            Não há serviços de CAPEX associados à TAG {equipment.tag} na planilha atual.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionHeading
          eyebrow="Cost Control"
          title="Custos do Equipamento"
          subtitle="Acompanhamento de CAPEX — orçado x realizado para este equipamento"
        />
        <div className="flex flex-col divide-y divide-brava-border rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm sm:flex-row sm:divide-x sm:divide-y-0">
          <KpiCard label="Orçado" value={formatCostMM(totals.orcado)} icon={Wallet} />
          <KpiCard label="Realizado" value={formatCostMM(totals.realizado)} icon={TrendingUp} tone="accent" />
          <KpiCard
            label="Variação"
            value={formatCostMM(totals.variance)}
            icon={TrendingDown}
            tone={totals.variance < 0 ? "danger" : "neutral"}
          />
          <KpiCard label="% Executado" value={totals.pctExecuted} suffix="%" icon={Percent} meter={totals.pctExecuted} />
        </div>
      </div>

      <div className="rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm sm:p-6">
        <h3 className="mb-1 text-[14px] font-bold text-brava-text">Curva S — Orçado x Realizado</h3>
        <p className="mb-4 text-[12.5px] text-brava-text-secondary">
          Acumulado dos serviços de CAPEX deste equipamento ao longo de 2026–2031.
        </p>
        <CostScurveChart data={scurve} />
      </div>

      <div className="overflow-hidden rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm">
        <div className="border-b border-brava-border px-5 py-3.5">
          <h3 className="text-[13px] font-bold text-brava-text">Detalhamento por Serviço</h3>
          <p className="text-[11.5px] text-brava-text-secondary">
            Itens do CAPEX para esta TAG. Clique em "Realizado" para atualizar o valor executado.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-brava-border text-[10.5px] font-bold uppercase tracking-wide text-brava-text-secondary">
                <th className="px-5 py-2.5">Serviço</th>
                <th className="px-5 py-2.5">Período</th>
                <th className="px-5 py-2.5 text-right">Orçado</th>
                <th className="px-5 py-2.5 text-right">Realizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brava-border">
              {equipmentCosts.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-brava-bg">
                  <td className="px-5 py-2.5 text-brava-text">{c.notes || c.source}</td>
                  <td className="px-5 py-2.5 text-brava-text-secondary">{COST_PERIOD_LABELS[c.period]}</td>
                  <td className="px-5 py-2.5 text-right font-mono text-brava-text">{formatCostMM(c.orcado)}</td>
                  <td className="px-5 py-2.5 text-right font-mono">
                    {editingId === c.id ? (
                      <input
                        autoFocus
                        type="text"
                        inputMode="decimal"
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        onBlur={() => commitEdit(c.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEdit(c.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-24 rounded-brava-sm border border-brava-blue/40 px-2 py-1 text-right text-[12.5px] outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => startEdit(c.id, c.realizado)}
                        className="rounded-brava-sm px-2 py-1 text-brava-blue transition-colors hover:bg-brava-blue/10"
                      >
                        {formatCostMM(c.realizado)}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
