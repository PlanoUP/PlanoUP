import type { ActivityStatus } from "@/types/paint-control";

export interface ScurvePoint {
  month: string; // YYYY-MM
  label: string; // "jan/27"
  plannedPct: number;
  actualPct: number;
}

interface ScurveItem {
  programmedDate: string | null;
  neededDate: string | null;
  status: ActivityStatus;
  actualEndDate: string | null;
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, 1));
  return date
    .toLocaleDateString("pt-BR", { month: "short", year: "2-digit", timeZone: "UTC" })
    .replace(".", "");
}

/**
 * A simplified "curva S": cumulative % of items planned to be done by each
 * month (programmedDate, falling back to neededDate) vs cumulative % of
 * items actually completed by then. Macro-level by design — one line per
 * month across the whole set, not per-item granularity.
 */
export function buildScurveData(items: ScurveItem[]): ScurvePoint[] {
  const total = items.length;
  const planDates = items
    .map((i) => i.programmedDate || i.neededDate)
    .filter((d): d is string => Boolean(d));
  if (total === 0 || planDates.length === 0) return [];

  const months = planDates.map(monthKey).sort();
  const startMonth = months[0];
  const endMonth = months[months.length - 1];

  const points: ScurvePoint[] = [];
  let cursor = startMonth;
  let guard = 0;
  while (guard < 240) {
    guard += 1;
    const plannedDone = items.filter((i) => {
      const d = i.programmedDate || i.neededDate;
      return d ? monthKey(d) <= cursor : false;
    }).length;
    const actualDone = items.filter((i) => {
      if (i.status !== "Concluído") return false;
      const d = i.actualEndDate;
      return d ? monthKey(d) <= cursor : true;
    }).length;

    points.push({
      month: cursor,
      label: monthLabel(cursor),
      plannedPct: Math.round((plannedDone / total) * 100),
      actualPct: Math.round((actualDone / total) * 100),
    });

    if (cursor === endMonth) break;
    cursor = addMonths(cursor, 1);
  }
  return points;
}

/** Current month key (YYYY-MM), for the "hoje" reference marker on the S-curve. */
export function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7);
}
