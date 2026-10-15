// Cost Control domain model for equipment (Shutdown Control — Unidades).
// Mirrors lib/brava/costs/types.ts (CostEntry), linked by Equipment.tag
// instead of Tank.tag. The period vocabulary (2026-2031 CAPEX calendar) is
// generic business language, not tank-specific, so it's reused directly
// from the tanks costs module rather than redefined here.
//
// No seed data: there is no real CAPEX sheet for equipment yet, so this
// starts empty — never invented.

import { CostPeriod } from "../../costs/types";

export interface EquipmentCostEntry {
  id: string;
  tag: string; // e.g. "F-26001" — matched against Equipment.tag at render time, never stored as a foreign key
  period: CostPeriod;
  source: string; // which CAPEX line this came from
  orcado: number; // R$ MM
  realizado: number | null; // R$ MM — null until tracked, filled in as spend happens
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EquipmentCostEntryInput = Omit<EquipmentCostEntry, "id" | "createdAt" | "updatedAt">;
