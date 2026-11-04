// Pure, read-only presentation helpers for the Home composition. These only
// read data already produced by selectors.ts/schedule-engine.ts — no
// scheduling, dependency or persistence logic lives here.

import { TankWithDerived } from "./types";
import { diffDays } from "./date-utils";
import { buildInspectionFleet } from "./inspection";
import { INSPECTION_INVENTORY } from "./data/inspection-inventory";

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

export type AttentionKind = "CRITICO" | "ATRASADO" | "INSPECAO_VENCIDA";

export interface AttentionItem {
  tag: string;
  tankId: string;
  area: string;
  kind: AttentionKind;
  detail: string;
  /** Higher sorts first — CRITICO status always wins, then by how overdue. */
  severity: number;
}

/**
 * Everything that needs a human looking at it right now, combined into one
 * list: maintenance in CRITICO or ATRASADO status, and any tank (tracked or
 * not) whose next regulatory inspection is already overdue or inside the
 * CRITICO window. A tank can contribute more than one item (e.g. ATRASADO
 * *and* an overdue inspection are two different problems worth separate
 * lines) — finished projects are excluded, same as everywhere else now.
 */
export function computeAttentionItems(tanks: TankWithDerived[], todayISO: string): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const t of tanks) {
    if (t.status === "CONCLUIDO") continue;

    if (t.status === "CRITICO") {
      items.push({
        tag: t.tag,
        tankId: t.id,
        area: t.area,
        kind: "CRITICO",
        detail: "Status crítico — prioridade máxima",
        severity: 10_000,
      });
    } else if (t.status === "ATRASADO") {
      const days = t.derived.daysRemaining;
      items.push({
        tag: t.tag,
        tankId: t.id,
        area: t.area,
        kind: "ATRASADO",
        detail: days !== null && days < 0 ? `${Math.abs(days)}d de atraso na entrega` : "Atrasado em relação ao planejado",
        severity: 1000 + (days !== null ? Math.abs(Math.min(days, 0)) : 0),
      });
    }

    if (t.derived.inspectionCriticality === "CRITICO" && t.derived.daysToInternalInspection !== null) {
      const days = t.derived.daysToInternalInspection;
      items.push({
        tag: t.tag,
        tankId: t.id,
        area: t.area,
        kind: "INSPECAO_VENCIDA",
        detail: days < 0 ? `Inspeção interna vencida há ${Math.abs(days)}d` : `Inspeção interna vence em ${days}d`,
        severity: 500 + (days < 0 ? Math.abs(days) : -days),
      });
    }
  }

  return items.sort((a, b) => b.severity - a.severity);
}

export type DeadlineKind = "MARCO" | "INSPECAO";

export interface DeadlineItem {
  tag: string;
  tankId: string | null;
  tracked: boolean;
  kind: DeadlineKind;
  label: string;
  date: string;
  daysAway: number;
  overdue: boolean;
}

/**
 * Every upcoming date worth watching, in one sorted list: maintenance
 * milestones (from the tanks actually under an active project) and
 * regulatory inspection due dates (the full real inventory, same source as
 * UpcomingInspectionsTimeline) — merged instead of living in two separate
 * widgets, so one scan covers both kinds of deadline. Overdue inspections
 * sort first (most overdue first), then everything else by how soon it's
 * due. Finished projects are excluded, same as everywhere else now.
 */
export function computeDeadlines(tanks: TankWithDerived[], todayISO: string, limit = 12): DeadlineItem[] {
  const items: DeadlineItem[] = [];

  for (const t of tanks) {
    if (t.status === "CONCLUIDO") continue;
    const m = t.derived.nextMilestone;
    if (!m) continue;
    const daysAway = diffDays(todayISO, m.plannedStart);
    if (daysAway < 0) continue;
    items.push({
      tag: t.tag,
      tankId: t.id,
      tracked: true,
      kind: "MARCO",
      label: m.name,
      date: m.plannedStart,
      daysAway,
      overdue: false,
    });
  }

  const fleet = buildInspectionFleet(tanks, INSPECTION_INVENTORY, todayISO);
  for (const asset of fleet) {
    if (!asset.nextInternalInspection || asset.daysToInternalInspection === null) continue;
    items.push({
      tag: asset.tag,
      tankId: null,
      tracked: asset.tracked,
      kind: "INSPECAO",
      label: "Inspeção interna",
      date: asset.nextInternalInspection,
      daysAway: asset.daysToInternalInspection,
      overdue: asset.daysToInternalInspection < 0,
    });
  }

  return items
    .sort((a, b) => a.daysAway - b.daysAway)
    .slice(0, limit);
}
