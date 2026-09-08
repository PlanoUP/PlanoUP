"use client";

import { AlertTriangle, Clock, CalendarClock, CalendarRange, HelpCircle } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { computeInspectionSummary } from "@/lib/brava/inspection";
import SectionHeading from "./SectionHeading";
import { cn } from "@/lib/brava/cn";

export default function InspectionSummary() {
  const { tanks } = useBravaData();
  const counts = computeInspectionSummary(tanks);

  const tiles = [
    {
      label: "Ativos Críticos",
      sub: "Inspeção vencida",
      value: counts.criticos,
      icon: AlertTriangle,
      tone: "text-brava-danger",
    },
    {
      label: "Até 6 Meses",
      sub: "Vencem em breve",
      value: counts.ate6Meses,
      icon: Clock,
      tone: "text-[#B54708]",
    },
    {
      label: "6–12 Meses",
      sub: "Atenção",
      value: counts.entre6e12,
      icon: CalendarClock,
      tone: "text-[#854A00]",
    },
    {
      label: "12–24 Meses",
      sub: "Planejar",
      value: counts.entre12e24,
      icon: CalendarRange,
      tone: "text-brava-blue",
    },
    {
      label: "Sem Data Definida",
      sub: "Cadastro pendente",
      value: counts.semData,
      icon: HelpCircle,
      tone: "text-brava-text-secondary",
    },
  ];

  return (
    <div>
      <SectionHeading
        eyebrow="Gestão de Vencimentos"
        title="Criticidade das Inspeções"
        subtitle="Próxima inspeção interna de cada ativo — recalculado automaticamente a partir da data atual"
      />
      <div className="grid grid-cols-2 divide-y divide-brava-border rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm sm:grid-cols-5 sm:divide-y-0 sm:divide-x">
        {tiles.map(({ label, sub, value, icon: Icon, tone }) => (
          <div key={label} className="flex flex-col gap-2 px-5 py-4">
            <div className={cn("flex items-center gap-2", tone)}>
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              <span className="text-[10.5px] font-semibold uppercase tracking-wide text-brava-text-secondary">
                {label}
              </span>
            </div>
            <p className={cn("font-mono text-[30px] font-extrabold leading-none tracking-tight", tone)}>
              {value}
            </p>
            <p className="text-[11px] text-brava-text-secondary">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
