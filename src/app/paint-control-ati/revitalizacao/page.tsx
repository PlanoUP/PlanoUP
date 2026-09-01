"use client";

import { useMemo } from "react";
import { ClipboardList, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { averageProgress, isOverdue } from "@/lib/paint-control/calculations";
import PageHeader from "@/components/paint-control/PageHeader";
import KpiCard from "@/components/paint-control/KpiCard";
import RevitalizationSection from "@/components/paint-control/RevitalizationSection";

export default function RevitalizacaoPage() {
  const items = usePaintControlStore((s) => s.revitalizationItems);

  const kpis = useMemo(
    () => ({
      total: items.length,
      overdue: items.filter((i) => isOverdue(i)).length,
      completed: items.filter((i) => i.status === "Concluído").length,
      avgProgress: averageProgress(items),
    }),
    [items]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="ATI Guamaré · Controle separado"
        title="Revitalização"
        description="Cronograma Plurianual de Revitalização - Pintura — instalações e áreas do sítio, fora do controle por unidade de processo."
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Total de Itens" value={kpis.total} icon={ClipboardList} />
        <KpiCard label="Atrasados" value={kpis.overdue} icon={AlertTriangle} tone="warning" />
        <KpiCard label="Concluídos" value={kpis.completed} icon={CheckCircle2} />
        <KpiCard label="Avanço Geral" value={`${kpis.avgProgress}%`} icon={TrendingUp} tone="accent" />
      </section>

      <RevitalizationSection />
    </div>
  );
}
