// Core domain model for the Brava Energia Tank Maintenance Control System.
// Structured to map cleanly onto future Supabase tables:
// tanks, activities, milestones, progress_updates, notes, users.

export type TankStatus =
  | "PROGRAMADO"
  | "EM_EXECUCAO"
  | "CONCLUIDO"
  | "ATRASADO"
  | "CRITICO";

export type ActivityStatus = "CONCLUIDO" | "ATUAL" | "FUTURO" | "ATRASADO";

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
  inspectionDeadline?: string;
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
}

export type TankWithDerived = Tank & { derived: TankDerived };

export interface TankFilter {
  status: "TODOS" | TankStatus;
  search: string;
}
