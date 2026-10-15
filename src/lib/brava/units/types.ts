// Core domain model for process-unit shutdowns (Shutdown Control) — mirrors
// lib/brava/types.ts (Tank) but for individual equipment items (vessels,
// exchangers, furnaces, towers...) tracked within a process unit's turnaround.
// Deliberately excludes tank-only concepts (product, tankType, the
// inspection-date criticality system) since no such data exists for
// equipment yet — status alone drives signaling here.

export type EquipmentStatus =
  | "PROGRAMADO"
  | "EM_EXECUCAO"
  | "CONCLUIDO"
  | "ATRASADO"
  | "CRITICO"
  | "SEM_PROJETO";

export type ActivityStatus = "CONCLUIDO" | "ATUAL" | "FUTURO" | "ATRASADO";

/** Process unit this equipment belongs to. */
export type ProcessUnit = "U-260" | "U-270";

/** Equipment category, as classified in the real inventory list. */
export type EquipmentType =
  | "FORNO"
  | "TORRE"
  | "PERMUTADOR"
  | "AIR COOLER"
  | "VASO"
  | "FILTRO"
  | "TUBULACAO";

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  FORNO: "Forno",
  TORRE: "Torre",
  PERMUTADOR: "Permutador",
  "AIR COOLER": "Air Cooler",
  VASO: "Vaso",
  FILTRO: "Filtro",
  TUBULACAO: "Tubulação",
};

export interface EquipmentActivity {
  id: string;
  equipmentId: string;
  order: number;
  stageKey: string;
  name: string;
  durationDays: number;
  dependsOn: string[];
  isMilestone: boolean;

  /** Immutable original schedule, captured when the plan was first created. */
  baselineStart: string;
  baselineEnd: string;

  /** Current working plan — recalculated automatically by the schedule engine. */
  plannedStart: string;
  plannedEnd: string;

  /** Real execution dates, filled in as work happens. */
  actualStart?: string;
  actualEnd?: string;

  progress: number; // 0-100
  status: ActivityStatus;
}

export interface Equipment {
  id: string;
  tag: string;
  unit: ProcessUnit;
  equipmentType: EquipmentType;
  status: EquipmentStatus;
  responsible?: string;
  notes?: string;
  activities: EquipmentActivity[];
}

export interface EquipmentDerived {
  plannedStart: string;
  plannedEnd: string;
  baselinePlannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  progress: number;
  daysRemaining: number | null;
  deviationDays: number;
  currentActivity: EquipmentActivity | null;
  nextActivity: EquipmentActivity | null;
  nextMilestone: EquipmentActivity | null;
}

export type EquipmentWithDerived = Equipment & { derived: EquipmentDerived };

export interface EquipmentFilter {
  status: "TODOS" | EquipmentStatus;
  search: string;
}

/** Quick top-of-page grouping, mirroring FamilyView's "CRITICIDADE mixes everything" pattern. */
export type UnitView = "TODAS" | ProcessUnit;
