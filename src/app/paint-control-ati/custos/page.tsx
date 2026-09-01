"use client";

import { useMemo } from "react";
import { Wallet, TrendingDown, TrendingUp, Percent } from "lucide-react";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { computeCostKpis } from "@/lib/paint-control/costCalculations";
import { formatCurrency } from "@/lib/paint-control/format";
import PageHeader from "@/components/paint-control/PageHeader";
import KpiCard from "@/components/paint-control/KpiCard";
import CostSection from "@/components/paint-control/CostSection";

export default function CustosPage() {
  const items = usePaintControlStore((s) => s.costItems);
  const kpis = useMemo(() => computeCostKpis(items), [items]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="ATI Guamaré · Controle separado"
        title="Custos"
        description="Efetivo e equipamentos do contrato de pintura — custo previsto x realizado, mensal e anual."
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Previsto / Ano" value={formatCurrency(kpis.plannedAnnual)} icon={Wallet} />
        <KpiCard
          label="Realizado / Ano"
          value={formatCurrency(kpis.actualAnnual)}
          icon={TrendingUp}
          tone="accent"
        />
        <KpiCard
          label="Variação (Ano)"
          value={formatCurrency(kpis.varianceAnnual)}
          icon={TrendingDown}
          tone={kpis.varianceAnnual < 0 ? "warning" : "default"}
        />
        <KpiCard label="% Executado" value={`${kpis.executedPct}%`} icon={Percent} />
      </section>

      <CostSection />
    </div>
  );
}
