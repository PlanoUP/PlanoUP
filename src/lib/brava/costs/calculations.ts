import type { CostEntry, CostPeriod } from "@/lib/brava/costs/types";
import { COST_PERIODS, COST_PERIOD_LABELS } from "@/lib/brava/costs/types";

export function formatCostMM(value: number | null): string {
  if (value === null) return "—";
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MM`;
}

export interface CostTotals {
  orcado: number;
  realizado: number;
  variance: number; // orcado - realizado (positive = under budget)
  pctExecuted: number; // realizado / orcado * 100
}

export function computeCostTotals(entries: CostEntry[]): CostTotals {
  const orcado = entries.reduce((acc, e) => acc + e.orcado, 0);
  const realizado = entries.reduce((acc, e) => acc + (e.realizado ?? 0), 0);
  const variance = orcado - realizado;
  const pctExecuted = orcado > 0 ? Math.round((realizado / orcado) * 100) : 0;
  return { orcado, realizado, variance, pctExecuted };
}

export function getCostsByTag(entries: CostEntry[], tag: string): CostEntry[] {
  const upper = tag.toUpperCase();
  return entries.filter((e) => e.tag.toUpperCase() === upper);
}

/** Distinct tags present in the cost sheet, for the overview's "tanks with cost data" list. */
export function getTagsWithCosts(entries: CostEntry[]): string[] {
  return Array.from(new Set(entries.map((e) => e.tag)));
}

export interface CostPeriodPoint {
  period: CostPeriod;
  label: string;
  orcado: number; // sum for this period alone
  realizado: number;
  cumulativeOrcado: number;
  cumulativeRealizado: number;
}

/**
 * Per-period totals plus running cumulative sums (the "curva S") across the
 * fixed 2026→2031 timeline. Works the same for the whole cost sheet (the
 * overview chart) or for a single tag's entries (the tank detail chart) —
 * just pass the already-filtered list in.
 */
export function buildCostScurve(entries: CostEntry[]): CostPeriodPoint[] {
  let cumOrcado = 0;
  let cumRealizado = 0;
  return COST_PERIODS.map((period) => {
    const periodEntries = entries.filter((e) => e.period === period);
    const orcado = periodEntries.reduce((acc, e) => acc + e.orcado, 0);
    const realizado = periodEntries.reduce((acc, e) => acc + (e.realizado ?? 0), 0);
    cumOrcado += orcado;
    cumRealizado += realizado;
    return {
      period,
      label: COST_PERIOD_LABELS[period],
      orcado,
      realizado,
      cumulativeOrcado: Math.round(cumOrcado * 100) / 100,
      cumulativeRealizado: Math.round(cumRealizado * 100) / 100,
    };
  });
}
