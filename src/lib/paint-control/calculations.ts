import type { Activity, Priority } from "@/types/paint-control";
import { PRIORITY_WEIGHT } from "@/lib/paint-control/constants";

/** Today's date as YYYY-MM-DD, safe to compare against ISO date-only strings. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * A service is overdue when "today" is past its expected end date (or, if
 * that isn't set yet, its required date) and it hasn't been closed out.
 * Per spec §18: data atual > data prevista/necessária AND status != Concluído.
 */
export function isOverdue(activity: Activity, today: string = todayIso()): boolean {
  if (activity.status === "Concluído" || activity.status === "Cancelado") return false;
  const referenceDate = activity.expectedEndDate || activity.neededDate;
  if (!referenceDate) return false;
  return today > referenceDate;
}

/** "Crítico" = highest priority tier (P1). */
export function isCritical(activity: Activity): boolean {
  return activity.priority === "P1";
}

/**
 * Average progress of an activity set. Cancelled services are excluded —
 * they never contribute to a unit's or the ATI's physical progress.
 *
 * `weightFn` is a seam for the future area-weighted rule (§21): pass e.g.
 * `(a) => a.estimatedAreaM2 ?? 0` to switch from a simple average to an
 * area-weighted one without touching any call site.
 */
export function averageProgress(
  activities: Activity[],
  weightFn?: (activity: Activity) => number
): number {
  const active = activities.filter((a) => a.status !== "Cancelado");
  if (active.length === 0) return 0;

  if (!weightFn) {
    const sum = active.reduce((acc, a) => acc + a.progress, 0);
    return Math.round(sum / active.length);
  }

  const totalWeight = active.reduce((acc, a) => acc + weightFn(a), 0);
  if (totalWeight === 0) return averageProgress(active);
  const weighted = active.reduce((acc, a) => acc + a.progress * weightFn(a), 0);
  return Math.round(weighted / totalWeight);
}

function compareByNeededDate(a: Activity, b: Activity): number {
  if (a.neededDate && b.neededDate) return a.neededDate.localeCompare(b.neededDate);
  if (a.neededDate) return -1;
  if (b.neededDate) return 1;
  return 0;
}

/** Priority tier first, then nearest required date. Used on the Visão Geral priorities table. */
export function priorityComparator(a: Activity, b: Activity): number {
  const weightDiff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
  if (weightDiff !== 0) return weightDiff;
  return compareByNeededDate(a, b);
}

/**
 * Global ATI priority ranking (§22): priority tier, then overdue services
 * first, then nearest required date — applied consistently within each tier
 * so the P1→P2→P3→P4 ordering always wins overall.
 */
export function globalPriorityComparator(a: Activity, b: Activity): number {
  const weightDiff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
  if (weightDiff !== 0) return weightDiff;
  const overdueDiff = Number(isOverdue(b)) - Number(isOverdue(a));
  if (overdueDiff !== 0) return overdueDiff;
  return compareByNeededDate(a, b);
}

export interface AtiKpis {
  total: number;
  programmed: number;
  inExecution: number;
  highPriority: number;
  overdue: number;
  completed: number;
  overallProgress: number;
}

/** "Alta Prioridade" groups the two most urgent tiers (P1 + P2). */
export function isHighPriority(priority: Priority): boolean {
  return priority === "P1" || priority === "P2";
}

export function computeAtiKpis(activities: Activity[]): AtiKpis {
  return {
    total: activities.length,
    programmed: activities.filter((a) => a.status === "Programado").length,
    inExecution: activities.filter((a) => a.status === "Em Execução").length,
    highPriority: activities.filter((a) => isHighPriority(a.priority)).length,
    overdue: activities.filter((a) => isOverdue(a)).length,
    completed: activities.filter((a) => a.status === "Concluído").length,
    overallProgress: averageProgress(activities),
  };
}

export interface UnitStats {
  total: number;
  notStarted: number;
  programmed: number;
  inExecution: number;
  inInspection: number;
  completed: number;
  critical: number;
  overdue: number;
  avgProgress: number;
}

export function computeUnitStats(activities: Activity[]): UnitStats {
  return {
    total: activities.length,
    notStarted: activities.filter((a) => a.status === "Backlog").length,
    programmed: activities.filter((a) => a.status === "Programado").length,
    inExecution: activities.filter((a) => a.status === "Em Execução").length,
    inInspection: activities.filter((a) => a.status === "Em Inspeção").length,
    completed: activities.filter((a) => a.status === "Concluído").length,
    critical: activities.filter((a) => isCritical(a)).length,
    overdue: activities.filter((a) => isOverdue(a)).length,
    avgProgress: averageProgress(activities),
  };
}
