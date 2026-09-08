// Inspection-criticality engine — a regulatory concept driven by each tank's
// NEXT INTERNAL INSPECTION date (real data from the tank inventory
// spreadsheet), completely independent from the maintenance-project schedule
// (Gantt/timeline/planning editor keep using the activities' own dates).
//
// Centralized here so no component recomputes family/criticality/day-count on
// its own — see getTankFamily, getDaysToInspection, getInspectionCriticality,
// sortByInspectionPriority below.

import { TankFamily, InspectionCriticality, TankWithDerived } from "./types";
import { diffDays } from "./date-utils";

const SIX_MONTHS_DAYS = 182;
const TWELVE_MONTHS_DAYS = 365;
const TWENTY_FOUR_MONTHS_DAYS = 730;

/** Family membership from the TAG's numeric body — TQ-410xx / TQ-6313xxx / TQ-270xx. */
export function getTankFamily(tag: string): TankFamily | null {
  const body = tag.replace(/^TQ-/i, "");
  if (/^6313\d{3}$/.test(body)) return "6313";
  if (/^41\d{3}$/.test(body)) return "410";
  if (/^27\d{3}$/.test(body)) return "270";
  return null;
}

export const FAMILY_LABELS: Record<TankFamily, string> = {
  "410": "Tancagem 410",
  "6313": "Tancagem 6313",
  "270": "Tancagem 270",
};

/** Signed day count to the next internal inspection; null when undated. Negative = overdue. */
export function getDaysToInspection(
  nextInternalInspection: string | undefined,
  todayISO: string
): number | null {
  if (!nextInternalInspection) return null;
  return diffDays(todayISO, nextInternalInspection);
}

/** Criticality bucket from the signed day count — see the panel's classification rules. */
export function getInspectionCriticality(daysToInspection: number | null): InspectionCriticality {
  if (daysToInspection === null) return "SEM_DATA";
  if (daysToInspection < 0) return "CRITICO";
  if (daysToInspection <= SIX_MONTHS_DAYS) return "ALTA";
  if (daysToInspection <= TWELVE_MONTHS_DAYS) return "ATENCAO";
  if (daysToInspection <= TWENTY_FOUR_MONTHS_DAYS) return "PLANEJAR";
  return "NORMAL";
}

export interface InspectionCriticalityMeta {
  label: string;
  dotClass: string;
  textClass: string;
  badgeClass: string;
}

export const INSPECTION_CRITICALITY_META: Record<InspectionCriticality, InspectionCriticalityMeta> = {
  CRITICO: {
    label: "Crítico",
    dotClass: "bg-brava-danger",
    textClass: "text-brava-danger",
    badgeClass: "border-brava-danger-border bg-brava-danger-bg text-brava-danger",
  },
  ALTA: {
    label: "Alta",
    dotClass: "bg-[#F79009]",
    textClass: "text-[#B54708]",
    badgeClass: "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]",
  },
  ATENCAO: {
    label: "Atenção",
    dotClass: "bg-[#EAAA08]",
    textClass: "text-[#854A00]",
    badgeClass: "border-[#FEE28A] bg-[#FEFBE8] text-[#854A00]",
  },
  PLANEJAR: {
    label: "Planejar",
    dotClass: "bg-brava-blue",
    textClass: "text-brava-blue",
    badgeClass: "border-brava-blue/20 bg-brava-blue/[0.06] text-brava-blue",
  },
  NORMAL: {
    label: "Normal",
    dotClass: "bg-brava-success",
    textClass: "text-brava-success",
    badgeClass: "border-brava-success-border bg-brava-success-bg text-brava-success",
  },
  SEM_DATA: {
    label: "Sem data",
    dotClass: "bg-brava-text-secondary",
    textClass: "text-brava-text-secondary",
    badgeClass: "border-brava-border bg-brava-bg text-brava-text-secondary",
  },
};

/** "RESTAM Xd" / "VENCE HOJE" / "VENCIDO HÁ Xd" / "SEM DATA CADASTRADA" — never hardcode these. */
export function formatDaysToInspection(days: number | null): string {
  if (days === null) return "Sem data cadastrada";
  if (days === 0) return "Vence hoje";
  if (days > 0) return `Restam ${days}d`;
  return `Vencido há ${Math.abs(days)}d`;
}

interface InspectionPriorityLike {
  tag: string;
  daysToInternalInspection: number | null;
}

/**
 * Ordering rule for the whole panel: overdue first (oldest overdue first),
 * then soonest-upcoming to furthest-out, then undated last. Ties break on
 * TAG so the order is stable and deterministic. Shared by the tracked-fleet
 * sorter below and by sortAssetsByInspectionPriority (macro due-date view).
 */
function compareInspectionPriority(a: InspectionPriorityLike, b: InspectionPriorityLike): number {
  const da = a.daysToInternalInspection;
  const db = b.daysToInternalInspection;

  if (da === null && db === null) return a.tag.localeCompare(b.tag);
  if (da === null) return 1;
  if (db === null) return -1;

  const overdueA = da < 0;
  const overdueB = db < 0;
  if (overdueA && overdueB) {
    if (da !== db) return da - db; // most negative (oldest overdue) first
  } else if (overdueA !== overdueB) {
    return overdueA ? -1 : 1; // any overdue tank outranks any upcoming one
  } else if (da !== db) {
    return da - db; // soonest upcoming first
  }
  return a.tag.localeCompare(b.tag);
}

export function sortByInspectionPriority<T extends TankWithDerived>(tanks: T[]): T[] {
  return [...tanks].sort((a, b) =>
    compareInspectionPriority(
      { tag: a.tag, daysToInternalInspection: a.derived.daysToInternalInspection },
      { tag: b.tag, daysToInternalInspection: b.derived.daysToInternalInspection }
    )
  );
}

/** Same ordering rule, generalized for the macro due-date fleet (tracked + untracked assets). */
export function sortAssetsByInspectionPriority<T extends InspectionPriorityLike>(assets: T[]): T[] {
  return [...assets].sort(compareInspectionPriority);
}

export interface InspectionFleetAsset {
  tag: string;
  family: TankFamily | null;
  nextInternalInspection?: string;
  daysToInternalInspection: number | null;
  inspectionCriticality: InspectionCriticality;
  /** True when this TAG also has a real Tank record (maintenance project) — false = inspection-only asset. */
  tracked: boolean;
}

/**
 * Merges the complete real inspection inventory (every tancagem Brava
 * tracks for regulatory purposes) with the tanks actually under an active
 * maintenance project. Used ONLY by the macro due-date views (Consolidado +
 * Cronograma) — Tank Control, the executive summary and the featured-tank
 * logic keep using the maintenance-tracked fleet only, unchanged.
 */
export function buildInspectionFleet(
  tanks: TankWithDerived[],
  inventory: { tag: string; nextInternalInspection: string }[],
  todayISO: string
): InspectionFleetAsset[] {
  const byTag = new Map(tanks.map((t) => [t.tag.toUpperCase(), t]));
  const seen = new Set<string>();
  const result: InspectionFleetAsset[] = [];

  for (const item of inventory) {
    const key = item.tag.toUpperCase();
    seen.add(key);
    const tracked = byTag.get(key);
    if (tracked) {
      result.push({
        tag: tracked.tag,
        family: tracked.derived.family,
        nextInternalInspection: tracked.nextInternalInspection,
        daysToInternalInspection: tracked.derived.daysToInternalInspection,
        inspectionCriticality: tracked.derived.inspectionCriticality,
        tracked: true,
      });
    } else {
      const days = getDaysToInspection(item.nextInternalInspection, todayISO);
      result.push({
        tag: item.tag,
        family: getTankFamily(item.tag),
        nextInternalInspection: item.nextInternalInspection,
        daysToInternalInspection: days,
        inspectionCriticality: getInspectionCriticality(days),
        tracked: false,
      });
    }
  }

  // Defensive: a maintenance-tracked tank absent from the inventory (e.g. one
  // genuinely undated, like TQ-1222-62) still needs to appear somewhere.
  for (const t of tanks) {
    if (seen.has(t.tag.toUpperCase())) continue;
    result.push({
      tag: t.tag,
      family: t.derived.family,
      nextInternalInspection: t.nextInternalInspection,
      daysToInternalInspection: t.derived.daysToInternalInspection,
      inspectionCriticality: t.derived.inspectionCriticality,
      tracked: true,
    });
  }

  return result;
}

export interface InspectionSummaryCounts {
  criticos: number;
  ate6Meses: number;
  entre6e12: number;
  entre12e24: number;
  normal: number;
  semData: number;
}

/** Executive counters for the Home "Criticidade das Inspeções" block. */
export function computeInspectionSummary(tanks: TankWithDerived[]): InspectionSummaryCounts {
  const counts: InspectionSummaryCounts = {
    criticos: 0,
    ate6Meses: 0,
    entre6e12: 0,
    entre12e24: 0,
    normal: 0,
    semData: 0,
  };

  for (const t of tanks) {
    switch (t.derived.inspectionCriticality) {
      case "CRITICO":
        counts.criticos++;
        break;
      case "ALTA":
        counts.ate6Meses++;
        break;
      case "ATENCAO":
        counts.entre6e12++;
        break;
      case "PLANEJAR":
        counts.entre12e24++;
        break;
      case "NORMAL":
        counts.normal++;
        break;
      case "SEM_DATA":
        counts.semData++;
        break;
    }
  }

  return counts;
}
