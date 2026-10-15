// Centralized, pure calculations for equipment Cost Control — mirrors
// lib/brava/costs/calculations.ts, adapted to EquipmentCostEntry. The
// period vocabulary and CostPeriodPoint/formatCostMM shapes are reused
// directly from the tanks costs module since they're generic.

import { EquipmentCostEntry } from "./types";
import { COST_PERIODS, COST_PERIOD_LABELS } from "../../costs/types";
import { CostPeriodPoint } from "../../costs/calculations";

export { formatCostMM } from "../../costs/calculations";
export type { CostPeriodPoint };

export interface CostTotals {
  orcado: number;
  realizado: number;
  variance: number; // orcado - realizado (positive = under budget)
  pctExecuted: number; // realizado / orcado * 100
}

export function computeCostTotals(entries: EquipmentCostEntry[]): CostTotals {
  const orcado = entries.reduce((acc, e) => acc + e.orcado, 0);
  const realizado = entries.reduce((acc, e) => acc + (e.realizado ?? 0), 0);
  const variance = orcado - realizado;
  const pctExecuted = orcado > 0 ? Math.round((realizado / orcado) * 100) : 0;
  return { orcado, realizado, variance, pctExecuted };
}

export function getCostsByTag(entries: EquipmentCostEntry[], tag: string): EquipmentCostEntry[] {
  const upper = tag.toUpperCase();
  return entries.filter((e) => e.tag.toUpperCase() === upper);
}

/** Distinct tags present in the cost sheet, for the overview's "equipment with cost data" list. */
export function getTagsWithCosts(entries: EquipmentCostEntry[]): string[] {
  return Array.from(new Set(entries.map((e) => e.tag)));
}

export function buildCostScurve(entries: EquipmentCostEntry[]): CostPeriodPoint[] {
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
