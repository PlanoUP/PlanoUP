// Pure, read-only presentation helpers for the Home composition. These only
// read data already produced by selectors.ts/schedule-engine.ts — no
// scheduling, dependency or persistence logic lives here.

import { TankWithDerived } from "./types";
import { diffDays } from "./date-utils";

/**
 * Priority order: 1) inspection overdue or maintenance CRITICO, 2) soonest
 * upcoming inspection (unless it's more than 24 months out), 3) active
 * maintenance (EM_EXECUCAO/ATRASADO), 4) next milestone fallback. Never
 * surfaces a NORMAL/no-flag tank while any real overdue asset exists.
 */
export function computeFeaturedTank(tanks: TankWithDerived[]): TankWithDerived | null {
  const active = tanks.filter((t) => t.status !== "CONCLUIDO");
  if (active.length === 0) return null;

  const inspectionOverdue = active.filter((t) => t.derived.inspectionCriticality === "CRITICO");
  if (inspectionOverdue.length > 0) {
    return [...inspectionOverdue].sort(
      (a, b) => (a.derived.daysToInternalInspection ?? 0) - (b.derived.daysToInternalInspection ?? 0)
    )[0];
  }

  const maintenanceCritico = active.find((t) => t.status === "CRITICO");
  if (maintenanceCritico) return maintenanceCritico;

  const withUpcomingInspection = active.filter(
    (t) => t.derived.daysToInternalInspection !== null && t.derived.inspectionCriticality !== "NORMAL"
  );
  if (withUpcomingInspection.length > 0) {
    return [...withUpcomingInspection].sort(
      (a, b) => a.derived.daysToInternalInspection! - b.derived.daysToInternalInspection!
    )[0];
  }

  const emCurso = active.filter((t) => t.status === "EM_EXECUCAO" || t.status === "ATRASADO");
  if (emCurso.length > 0) {
    return [...emCurso].sort((a, b) => a.derived.plannedEnd.localeCompare(b.derived.plannedEnd))[0];
  }

  const withMilestone = active.filter((t) => t.derived.nextMilestone);
  if (withMilestone.length > 0) {
    return [...withMilestone].sort(
      (a, b) => a.derived.nextMilestone!.plannedStart.localeCompare(b.derived.nextMilestone!.plannedStart)
    )[0];
  }

  return active[0];
}

export interface FleetMilestone {
  tag: string;
  tankId: string;
  name: string;
  date: string;
  daysAway: number;
}

export function computeUpcomingMilestones(
  tanks: TankWithDerived[],
  todayISO: string,
  limit = 6
): FleetMilestone[] {
  const items: FleetMilestone[] = [];

  for (const t of tanks) {
    if (t.status === "CONCLUIDO") continue;
    const m = t.derived.nextMilestone;
    if (!m) continue;
    const daysAway = diffDays(todayISO, m.plannedStart);
    if (daysAway < 0) continue;
    items.push({ tag: t.tag, tankId: t.id, name: m.name, date: m.plannedStart, daysAway });
  }

  return items.sort((a, b) => a.daysAway - b.daysAway).slice(0, limit);
}
