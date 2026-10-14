"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Wallet, TrendingUp, TrendingDown, Percent } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { useCostsData } from "@/lib/brava/costs/context";
import { computeCostTotals, buildCostScurve, getCostsByTag, getTagsWithCosts, formatCostMM } from "@/lib/brava/costs/calculations";
import PageHeader from "@/components/brava/PageHeader";
import KpiCard from "@/components/brava/KpiCard";
import CostScurveChart from "@/components/brava/costs/CostScurveChart";

const MAINTENANCE_STATUSES = ["EM_EXECUCAO", "ATRASADO", "CRITICO"];

export default function CustosPage() {
  const { tanks } = useBravaData();
  const { costs, status } = useCostsData();

  const totals = useMemo(() => computeCostTotals(costs), [costs]);
  const scurve = useMemo(() => buildCostScurve(costs), [costs]);

  const maintenanceTanksWithCosts = useMemo(() => {
    const tagsWithCosts = new Set(getTagsWithCosts(costs).map((t) => t.toUpperCase()));
    return tanks
      .filter((t) => MAINTENANCE_STATUSES.includes(t.status) && tagsWithCosts.has(t.tag.toUpperCase()))
      .map((t) => ({ tank: t, totals: computeCostTotals(getCostsByTag(costs, t.tag)) }))
      .sort((a, b) => b.totals.orcado - a.totals.orcado);
  }, [tanks, costs]);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Visão Geral", href: "/brava" }, { label: "Custos" }]}
        title="Custos"
        subtitle="Acompanhamento de CAPEX — orçado x realizado por tanque e período (2026–2031)."
      />
      <div className="space-y-6 px-5 py-8 sm:px-8 sm:py-10 lg:space-y-8">
        {status === "loading" && <p className="text-[13px] text-brava-text-secondary">Carregando custos...</p>}

        <div className="flex flex-col divide-y divide-brava-border rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm sm:flex-row sm:divide-x sm:divide-y-0">
          <KpiCard label="Orçado Total" value={formatCostMM(totals.orcado)} icon={Wallet} />
          <KpiCard label="Realizado Total" value={formatCostMM(totals.realizado)} icon={TrendingUp} tone="accent" />
          <KpiCard
            label="Variação"
            value={formatCostMM(totals.variance)}
            icon={TrendingDown}
            tone={totals.variance < 0 ? "danger" : "neutral"}
          />
          <KpiCard label="% Executado" value={totals.pctExecuted} suffix="%" icon={Percent} meter={totals.pctExecuted} />
        </div>

        <div className="rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm sm:p-6">
          <h3 className="mb-1 text-[14px] font-bold text-brava-text">Orçado x Realizado — Geral</h3>
          <p className="mb-4 text-[12.5px] text-brava-text-secondary">
            Acumulado do CAPEX de tanques ao longo do período 2026–2031.
          </p>
          <CostScurveChart data={scurve} />
        </div>

        <div className="rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm sm:p-6">
          <h3 className="mb-1 text-[14px] font-bold text-brava-text">Tanques em Manutenção com Custos</h3>
          <p className="mb-4 text-[12.5px] text-brava-text-secondary">
            Clique em um tanque para ver a curva de custos e o detalhamento por serviço.
          </p>
          {maintenanceTanksWithCosts.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-brava-text-secondary">
              Nenhum tanque em manutenção com custos cadastrados no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {maintenanceTanksWithCosts.map(({ tank, totals: t }) => (
                <Link
                  key={tank.id}
                  href={`/brava/tanques/${encodeURIComponent(tank.tag)}?tab=CUSTOS`}
                  className="flex flex-col gap-2 rounded-brava-md border border-brava-border p-4 transition-colors hover:border-brava-blue/40 hover:bg-brava-bg"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] font-bold text-brava-text">{tank.tag}</span>
                    <span className="text-[11px] font-semibold text-brava-text-secondary">{t.pctExecuted}%</span>
                  </div>
                  <p className="text-[11px] text-brava-text-secondary">{tank.product}</p>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-brava-text-secondary">Orçado</span>
                    <span className="font-semibold text-brava-text">{formatCostMM(t.orcado)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-brava-text-secondary">Realizado</span>
                    <span className="font-semibold text-brava-blue">{formatCostMM(t.realizado)}</span>
                  </div>
                  <div className="h-[3px] w-full overflow-hidden rounded-full bg-brava-border/70">
                    <div
                      className="h-full rounded-full bg-brava-blue transition-[width] duration-700 ease-out"
                      style={{ width: `${Math.max(0, Math.min(100, t.pctExecuted))}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
