// Pure, read-only presentation helpers for the Home composition. These only
// read data already produced by selectors.ts/schedule-engine.ts — no
// scheduling, dependency or persistence logic lives here.

import { TankWithDerived } from "./types";
import { diffDays } from "./date-utils";

export function computeFeaturedTank(tanks: TankWithDerived[]): TankWithDerived | null {
  const active = tanks.filter((t) => t.status !== "CONCLUIDO");
  if (active.length === 0) return null;

  const critico = active.find((t) => t.status === "CRITICO");
  if (critico) return critico;

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
