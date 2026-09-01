"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { averageProgress, isOverdue } from "@/lib/paint-control/calculations";
import { formatDate } from "@/lib/paint-control/format";
import { ACTIVITY_STATUSES, PRIORITIES } from "@/types/paint-control";
import { PRIORITY_STYLES } from "@/lib/paint-control/constants";
import PageHeader from "@/components/paint-control/PageHeader";
import ProgressBar from "@/components/paint-control/ProgressBar";
import EmptyState from "@/components/paint-control/EmptyState";
import ExecutiveReport from "@/components/paint-control/ExecutiveReport";
import Link from "next/link";
import { CheckCircle2, FileDown } from "lucide-react";

const CHART_INK = "#1F2429";

const PRIORITY_HEX: Record<string, string> = {
  P1: "#E11D48",
  P2: "#F59E0B",
  P3: "#0EA5E9",
  P4: "#94A3B8",
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid #E2E8F0",
  boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
};

export default function RelatoriosPage() {
  const units = usePaintControlStore((s) => s.units);
  const activities = usePaintControlStore((s) => s.activities);
  const responsibles = usePaintControlStore((s) => s.responsibles);

  const byStatus = useMemo(
    () =>
      ACTIVITY_STATUSES.map((status) => ({
        name: status,
        total: activities.filter((a) => a.status === status).length,
      })).filter((d) => d.total > 0),
    [activities]
  );

  const byPriority = useMemo(
    () =>
      PRIORITIES.map((priority) => ({
        name: priority,
        total: activities.filter((a) => a.priority === priority).length,
      })),
    [activities]
  );

  const byResponsible = useMemo(() => {
    return responsibles
      .map((r) => ({ name: r.name.split(" ")[0], total: activities.filter((a) => a.responsibleId === r.id).length }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [responsibles, activities]);

  const byUnit = useMemo(() => {
    return units
      .map((u) => {
        const unitActivities = activities.filter((a) => a.unitId === u.id);
        return {
          unit: u,
          total: unitActivities.length,
          avgProgress: averageProgress(unitActivities),
        };
      })
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [units, activities]);

  const overdueActivities = useMemo(
    () => activities.filter((a) => isOverdue(a)).sort((a, b) => (a.neededDate ?? "").localeCompare(b.neededDate ?? "")),
    [activities]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="ATI Guamaré"
        title="Relatórios"
        description="Indicadores consolidados dos serviços de pintura do ATI."
        actions={
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-accent-hover print:hidden"
          >
            <FileDown className="h-4 w-4" />
            Gerar Relatório PDF
          </button>
        }
      />

      <ExecutiveReport />

      <div className="flex flex-col gap-6 print:hidden">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Serviços por Status">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byStatus} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid horizontal={false} stroke="#EEF1F3" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 11, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F8FAFC" }} />
              <Bar dataKey="total" fill={CHART_INK} radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Serviços por Prioridade">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byPriority} margin={{ left: 8, right: 16 }}>
              <CartesianGrid vertical={false} stroke="#EEF1F3" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F8FAFC" }} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={40}>
                {byPriority.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_HEX[entry.name] ?? CHART_INK} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {byResponsible.length > 0 && (
        <ChartCard title="Serviços por Responsável">
          <ResponsiveContainer width="100%" height={Math.max(160, byResponsible.length * 34)}>
            <BarChart data={byResponsible} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid horizontal={false} stroke="#EEF1F3" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 11, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F8FAFC" }} />
              <Bar dataKey="total" fill="#65825A" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <ChartCard title="Serviços por Unidade e Avanço">
        {byUnit.length === 0 ? (
          <EmptyState title="Nenhum serviço cadastrado ainda" />
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {byUnit.map(({ unit, total, avgProgress }) => (
              <Link
                key={unit.id}
                href={`/paint-control-ati/unidades/${unit.id}`}
                className="grid grid-cols-[1fr_auto_140px] items-center gap-4 py-2.5 hover:bg-slate-50/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{unit.tag}</p>
                  <p className="truncate text-xs text-slate-400">{unit.name}</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">{total} serviços</span>
                <ProgressBar value={avgProgress} size="sm" />
              </Link>
            ))}
          </div>
        )}
      </ChartCard>

      <ChartCard title={`Serviços Atrasados (${overdueActivities.length})`}>
        {overdueActivities.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Nenhum serviço atrasado no momento.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {overdueActivities.map((a) => {
              const unit = units.find((u) => u.id === a.unitId);
              return (
                <Link
                  key={a.id}
                  href={`/paint-control-ati/atividades/${a.id}`}
                  className="grid grid-cols-[100px_1fr_120px] items-center gap-4 py-2.5 hover:bg-slate-50/60"
                >
                  <span className="text-xs font-semibold text-slate-500">{unit?.tag ?? "—"}</span>
                  <span className="truncate text-sm font-medium text-slate-800">
                    {a.title || a.tag || "Sem título"}
                  </span>
                  <span className="text-right text-xs font-semibold text-rose-600">
                    necessária {formatDate(a.neededDate)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </ChartCard>
      </div>
    </div>
  );
}
