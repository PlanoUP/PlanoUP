// Mirrors lib/brava/selectors.ts (tanks), minus the inspection-date axis —
// no such data exists for equipment, so criticality/signaling here comes
// from EquipmentStatus alone.

import { Equipment, EquipmentDerived, EquipmentWithDerived, EquipmentFilter } from "./types";
import { weightedProgress, overallDeviationDays } from "./schedule-engine";
import { diffDays } from "../date-utils";

export function deriveEquipment(equipment: Equipment, todayISO: string): EquipmentDerived {
  const activities = [...equipment.activities].sort((a, b) => a.order - b.order);
  const first = activities[0];
  const last = activities[activities.length - 1];

  const currentActivity = activities.find((a) => a.status === "ATUAL") ?? null;
  const nextActivity = activities.find((a) => a.status === "FUTURO") ?? null;
  const nextMilestone = activities.find((a) => a.isMilestone && a.status !== "CONCLUIDO") ?? null;

  const progress = equipment.status === "CONCLUIDO" ? 100 : weightedProgress(activities);
  const plannedEnd = last?.plannedEnd ?? "";

  return {
    plannedStart: first?.plannedStart ?? "",
    plannedEnd,
    baselinePlannedEnd: last?.baselineEnd ?? "",
    actualStart: first?.actualStart,
    actualEnd: equipment.status === "CONCLUIDO" ? last?.actualEnd : undefined,
    progress,
    daysRemaining: equipment.status === "CONCLUIDO" || !plannedEnd ? null : diffDays(todayISO, plannedEnd),
    deviationDays: overallDeviationDays(activities),
    currentActivity,
    nextActivity,
    nextMilestone,
  };
}

export function withDerived(equipment: Equipment[], todayISO: string): EquipmentWithDerived[] {
  return equipment.map((e) => ({ ...e, derived: deriveEquipment(e, todayISO) }));
}

export function filterEquipment(equipment: EquipmentWithDerived[], filter: EquipmentFilter): EquipmentWithDerived[] {
  const search = filter.search.trim().toLowerCase();
  return equipment.filter((e) => {
    const statusMatch = filter.status === "TODOS" || e.status === filter.status;
    const searchMatch =
      search.length === 0 ||
      e.tag.toLowerCase().includes(search) ||
      e.unit.toLowerCase().includes(search) ||
      e.equipmentType.toLowerCase().includes(search);
    return statusMatch && searchMatch;
  });
}

export interface FleetKpis {
  total: number;
  emManutencao: number;
  programados: number;
  concluidos: number;
  avancoFisicoGeral: number;
  atividadesCriticas: number;
  atrasos: number;
  proximoMarco: { tag: string; name: string; date: string; daysAway: number } | null;
}

export function computeFleetKpis(equipment: EquipmentWithDerived[], todayISO: string): FleetKpis {
  const total = equipment.length;
  const emManutencao = equipment.filter((e) => ["EM_EXECUCAO", "ATRASADO", "CRITICO"].includes(e.status)).length;
  const programados = equipment.filter((e) => e.status === "PROGRAMADO").length;
  const concluidos = equipment.filter((e) => e.status === "CONCLUIDO").length;
  const atrasos = equipment.filter((e) => e.status === "ATRASADO" || e.status === "CRITICO").length;
  const atividadesCriticas = equipment.filter((e) => e.status === "CRITICO").length;

  const active = equipment.filter((e) => e.status !== "CONCLUIDO");

  const withProject = equipment.filter((e) => e.status !== "SEM_PROJETO");
  const avancoFisicoGeral =
    withProject.length === 0
      ? 0
      : Math.round(withProject.reduce((sum, e) => sum + e.derived.progress, 0) / withProject.length);

  let proximoMarco: FleetKpis["proximoMarco"] = null;
  for (const e of active) {
    const m = e.derived.nextMilestone;
    if (!m) continue;
    const daysAway = diffDays(todayISO, m.plannedStart);
    if (daysAway < 0) continue;
    if (!proximoMarco || daysAway < proximoMarco.daysAway) {
      proximoMarco = { tag: e.tag, name: m.name, date: m.plannedStart, daysAway };
    }
  }

  return { total, emManutencao, programados, concluidos, avancoFisicoGeral, atividadesCriticas, atrasos, proximoMarco };
}

export interface UnitSummary {
  unit: string;
  total: number;
  emManutencao: number;
  concluidos: number;
  avancoFisico: number;
}

/** Per-unit (U-260/U-270) rollup for the overview's unit summary cards. */
export function computeUnitSummaries(equipment: EquipmentWithDerived[]): UnitSummary[] {
  const units = Array.from(new Set(equipment.map((e) => e.unit))).sort();
  return units.map((unit) => {
    const items = equipment.filter((e) => e.unit === unit);
    const withProject = items.filter((e) => e.status !== "SEM_PROJETO");
    return {
      unit,
      total: items.length,
      emManutencao: items.filter((e) => ["EM_EXECUCAO", "ATRASADO", "CRITICO"].includes(e.status)).length,
      concluidos: items.filter((e) => e.status === "CONCLUIDO").length,
      avancoFisico:
        withProject.length === 0
          ? 0
          : Math.round(withProject.reduce((sum, e) => sum + e.derived.progress, 0) / withProject.length),
    };
  });
}

export interface TypeSummary {
  type: string;
  total: number;
  emManutencao: number;
}

/** Equipment-type rollup (FORNO/TORRE/PERMUTADOR/...), the equivalent of the tank "família" breakdown. */
export function computeTypeSummaries(equipment: EquipmentWithDerived[]): TypeSummary[] {
  const types = Array.from(new Set(equipment.map((e) => e.equipmentType))).sort();
  return types.map((type) => {
    const items = equipment.filter((e) => e.equipmentType === type);
    return {
      type,
      total: items.length,
      emManutencao: items.filter((e) => ["EM_EXECUCAO", "ATRASADO", "CRITICO"].includes(e.status)).length,
    };
  });
}
