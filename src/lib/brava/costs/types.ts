// Cost Control domain model — CAPEX line items (orçado x realizado) linked
// to tanks by TAG, a third independent control axis alongside the
// maintenance schedule (Gantt/PlanningEditor) and Materials. Values are
// stored exactly as the source CAPEX sheet reports them: R$ MM (millions),
// per fixed yearly period. A tank can have several entries across periods
// (e.g. a service split between 2026 and its 2027 carryover) — each entry
// is one "serviço" line from the CAPEX sheet.

export type CostPeriod = "2026" | "CARRYOVER_2027" | "2027" | "2028" | "2029" | "2030" | "2031";

export const COST_PERIODS: CostPeriod[] = ["2026", "CARRYOVER_2027", "2027", "2028", "2029", "2030", "2031"];

export const COST_PERIOD_LABELS: Record<CostPeriod, string> = {
  "2026": "2026",
  CARRYOVER_2027: "Carryover 2027",
  "2027": "2027",
  "2028": "2028",
  "2029": "2029",
  "2030": "2030",
  "2031": "2031",
};

/** Chronological order for cumulative/S-curve math — carryover sits between 2026 and 2027. */
export const COST_PERIOD_ORDER: Record<CostPeriod, number> = {
  "2026": 0,
  CARRYOVER_2027: 1,
  "2027": 2,
  "2028": 3,
  "2029": 4,
  "2030": 5,
  "2031": 6,
};

export interface CostEntry {
  id: string;
  tag: string; // e.g. "TQ-1222-25" — matched against Tank.tag at render time, never stored as a foreign key
  period: CostPeriod;
  source: string; // which CAPEX line this came from, e.g. "CAPEX 2026-2031 — Tanques"
  orcado: number; // R$ MM
  realizado: number | null; // R$ MM — null until tracked, filled in as spend happens
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CostEntryInput = Omit<CostEntry, "id" | "createdAt" | "updatedAt">;
