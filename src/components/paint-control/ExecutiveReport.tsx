"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { computeAtiKpis, averageProgress } from "@/lib/paint-control/calculations";
import { computeCostKpis } from "@/lib/paint-control/costCalculations";
import { buildScurveData, currentMonthKey } from "@/lib/paint-control/reportCalculations";
import { formatCurrency } from "@/lib/paint-control/format";
import type { CostCategory, CostItem } from "@/types/paint-control";

const INK = "#1F2429";
const BLUE = "#0284C7";
const EMERALD = "#059669";
const ROSE = "#E11D48";
const TRACK = "#E2E8F0";

function ReportSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid rounded-xl border border-slate-200 bg-white p-5 shadow-sm print:rounded-none print:border-0 print:border-b print:border-slate-200 print:shadow-none">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ScurveChart({ data }: { data: ReturnType<typeof buildScurveData> }) {
  const today = currentMonthKey();
  const showToday = data.some((d) => d.month === today);

  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">Sem datas suficientes para montar a curva.</p>;
  }

  return (
    <div style={{ width: "100%", maxWidth: 680 }} className="mx-auto">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} stroke="#EEF1F3" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {showToday && <ReferenceLine x={today} stroke="#CBD5E1" strokeDasharray="3 3" label={{ value: "hoje", fontSize: 10, fill: "#94A3B8", position: "top" }} />}
          <Line
            type="monotone"
            dataKey="plannedPct"
            name="Planejado"
            stroke={INK}
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
          />
          <Line type="monotone" dataKey="actualPct" name="Realizado" stroke={BLUE} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ProgressDonut({ label, pct }: { label: string; pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const data = [
    { name: label, value: clamped },
    { name: "Restante", value: 100 - clamped },
  ];
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 170, height: 170 }}>
        <PieChart width={170} height={170}>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={62}
            outerRadius={85}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill={BLUE} />
            <Cell fill={TRACK} />
          </Pie>
        </PieChart>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{clamped}%</span>
        </div>
      </div>
      <p className="mt-1 text-center text-sm font-semibold text-slate-700">{label}</p>
    </div>
  );
}

function BudgetDonut({ title, planned, actual }: { title: string; planned: number; actual: number }) {
  const pct = planned > 0 ? Math.round((actual / planned) * 100) : 0;
  const overBudget = actual > planned;
  const color = overBudget ? ROSE : EMERALD;
  const ringPct = Math.max(0, Math.min(pct, 100));
  const data = [
    { name: "Realizado", value: ringPct },
    { name: "Restante", value: 100 - ringPct },
  ];
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 150, height: 150 }}>
        <PieChart width={150} height={150}>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={52}
            outerRadius={72}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill={TRACK} />
          </Pie>
        </PieChart>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-slate-900">{pct}%</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-bold text-slate-900">{title}</p>
      <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
        {overBudget ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
        {overBudget ? "Acima do previsto" : "Dentro do previsto"}
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {formatCurrency(actual)} de {formatCurrency(planned)}
      </p>
    </div>
  );
}

function budgetByCategory(items: CostItem[], category: CostCategory) {
  const kpis = computeCostKpis(items.filter((i) => i.category === category));
  return { planned: kpis.plannedAnnual, actual: kpis.actualAnnual };
}

export default function ExecutiveReport() {
  const activities = usePaintControlStore((s) => s.activities);
  const revitalizationItems = usePaintControlStore((s) => s.revitalizationItems);
  const costItems = usePaintControlStore((s) => s.costItems);

  const atiKpis = useMemo(() => computeAtiKpis(activities), [activities]);
  const revitalizationProgress = useMemo(() => averageProgress(revitalizationItems), [revitalizationItems]);

  const atiScurve = useMemo(() => buildScurveData(activities), [activities]);
  const revitalizationScurve = useMemo(() => buildScurveData(revitalizationItems), [revitalizationItems]);

  const costTotal = useMemo(() => computeCostKpis(costItems), [costItems]);
  const laborBudget = useMemo(() => budgetByCategory(costItems, "Mão de Obra"), [costItems]);
  const equipmentBudget = useMemo(() => budgetByCategory(costItems, "Equipamento"), [costItems]);

  const emittedAt = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 text-white print:rounded-none print:border-0 print:bg-white print:text-slate-900 print:border-b-2 print:border-slate-900">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-accent print:text-slate-500">
          Relatório Executivo · ATI Guamaré
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight">PAINT CONTROL — Pintura, Revitalização e Custos</h2>
        <p className="mt-1 text-xs text-slate-300 print:text-slate-500">Emitido em {emittedAt}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Serviços ATI", value: atiKpis.total },
            { label: "Avanço ATI", value: `${atiKpis.overallProgress}%` },
            { label: "Atrasados ATI", value: atiKpis.overdue },
            { label: "Previsto/Ano (Custos)", value: formatCurrency(costTotal.plannedAnnual) },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg bg-white/10 px-3 py-2.5 text-center print:border print:border-slate-200 print:bg-white"
            >
              <p className="text-lg font-bold">{kpi.value}</p>
              <p className="text-[10px] font-medium text-slate-300 print:text-slate-500">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>

      <ReportSection
        title="Cronograma — Curva S (ATI Geral)"
        description="Percentual acumulado de serviços de pintura planejados x realizados ao longo do tempo."
      >
        <ScurveChart data={atiScurve} />
      </ReportSection>

      <ReportSection
        title="Cronograma — Curva S (Revitalização)"
        description="Percentual acumulado de itens de revitalização planejados x realizados ao longo do tempo."
      >
        <ScurveChart data={revitalizationScurve} />
      </ReportSection>

      <ReportSection title="Avanço Geral" description="Avanço físico médio consolidado, visão macro por controle.">
        <div className="flex flex-wrap items-start justify-center gap-8">
          <ProgressDonut label="ATI Geral" pct={atiKpis.overallProgress} />
          <ProgressDonut label="Revitalização" pct={revitalizationProgress} />
        </div>
      </ReportSection>

      <ReportSection
        title="Custos — Previsto x Realizado"
        description="Efetivo e equipamentos do contrato de pintura, comparados ao orçamento anual."
      >
        <div className="flex flex-wrap items-start justify-center gap-8">
          <BudgetDonut title="Mão de Obra" planned={laborBudget.planned} actual={laborBudget.actual} />
          <BudgetDonut title="Equipamento" planned={equipmentBudget.planned} actual={equipmentBudget.actual} />
          <BudgetDonut title="Total" planned={costTotal.plannedAnnual} actual={costTotal.actualAnnual} />
        </div>
      </ReportSection>

      <p className="text-center text-[10px] text-slate-400 print:text-slate-400">
        PAINT CONTROL ATI — Gestão de Serviços de Pintura — Ativo Industrial de Guamaré
      </p>
    </div>
  );
}
