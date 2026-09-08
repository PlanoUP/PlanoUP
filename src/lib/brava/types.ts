// Core domain model for the Brava Energia Tank Maintenance Control System.
// Structured to map cleanly onto future Supabase tables:
// tanks, activities, milestones, progress_updates, notes, users.

export type TankStatus =
  | "PROGRAMADO"
  | "EM_EXECUCAO"
  | "CONCLUIDO"
  | "ATRASADO"
  | "CRITICO"
  | "SEM_PROJETO";

export type ActivityStatus = "CONCLUIDO" | "ATUAL" | "FUTURO" | "ATRASADO";

/** Tancagem family, derived from the TAG's numeric prefix — see getTankFamily(). */
export type TankFamily = "410" | "6313" | "270";

/**
 * Criticality of the tank's NEXT INTERNAL INSPECTION deadline — a regulatory
 * concept, independent from the maintenance-project TankStatus above. See
 * getInspectionCriticality() for the day-range rules.
 */
export type InspectionCriticality =
  | "CRITICO"
  | "ALTA"
  | "ATENCAO"
  | "PLANEJAR"
  | "NORMAL"
  | "SEM_DATA";

export interface Activity {
  id: string;
  tankId: string;
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

export interface Tank {
  id: string;
  tag: string;
  area: string;
  product: string;
  tankType: string;
  status: TankStatus;
  responsible?: string;
  notes?: string;
  /**
   * Real "PRÓXIMA INTERNA" date from the tank inventory spreadsheet — the
   * next regulatory internal inspection. Feeds ONLY criticality/priority/
   * alerts (see lib/brava/inspection.ts). Never used by the Gantt, the
   * execution timeline, or the planning editor — those run off the
   * activities' own planned/actual dates.
   */
  nextInternalInspection?: string;
  activities: Activity[];
}

export interface TankDerived {
  plannedStart: string;
  plannedEnd: string;
  baselinePlannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  progress: number;
  daysRemaining: number | null;
  deviationDays: number;
  currentActivity: Activity | null;
  nextActivity: Activity | null;
  nextMilestone: Activity | null;

  /** Tancagem family derived from the TAG, or null when it matches none. */
  family: TankFamily | null;
  /** Signed day count to nextInternalInspection (negative = overdue), or null when undated. */
  daysToInternalInspection: number | null;
  /** Criticality bucket computed from daysToInternalInspection. */
  inspectionCriticality: InspectionCriticality;
}

export type TankWithDerived = Tank & { derived: TankDerived };

export interface TankFilter {
  status: "TODOS" | TankStatus;
  search: string;
}

/** Quick top-of-page grouping: CRITICIDADE mixes every family sorted by inspection due date. */
export type FamilyView = "CRITICIDADE" | TankFamily;
