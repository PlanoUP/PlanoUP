import type { CostItem } from "@/types/paint-control";

export interface CostKpis {
  plannedMonthly: number;
  plannedAnnual: number;
  actualMonthly: number;
  actualAnnual: number;
  varianceAnnual: number; // previsto - realizado (positive = under budget)
  executedPct: number; // realizado ano / previsto ano * 100
}

/**
 * previsto x realizado totals across a set of cost items — always derived
 * live from the line items rather than a stored total, so the sums stay
 * correct as items are added, edited or removed.
 */
export function computeCostKpis(items: CostItem[]): CostKpis {
  const plannedMonthly = items.reduce((acc, i) => acc + i.plannedMonthlyCost, 0);
  const plannedAnnual = items.reduce((acc, i) => acc + i.plannedAnnualCost, 0);
  const actualMonthly = items.reduce((acc, i) => acc + (i.actualMonthlyCost ?? 0), 0);
  const actualAnnual = items.reduce((acc, i) => acc + (i.actualAnnualCost ?? 0), 0);
  const varianceAnnual = plannedAnnual - actualAnnual;
  const executedPct = plannedAnnual > 0 ? Math.round((actualAnnual / plannedAnnual) * 100) : 0;

  return { plannedMonthly, plannedAnnual, actualMonthly, actualAnnual, varianceAnnual, executedPct };
}

/** Annual variance for a single row — same "previsto - realizado" convention as the KPI total. */
export function itemVariance(item: CostItem): number {
  return item.plannedAnnualCost - (item.actualAnnualCost ?? 0);
}
