import { diffDays, parseISO, addDays } from "./date-utils";

export interface TimeScale {
  startISO: string;
  endISO: string;
  totalDays: number;
  toPercent: (iso: string) => number;
  spanPercent: (startIso: string, endIso: string) => number;
}

export function buildTimeScale(startISO: string, endISO: string, paddingDays = 0): TimeScale {
  const start = addDays(startISO, -paddingDays);
  const end = addDays(endISO, paddingDays);
  const totalDays = Math.max(1, diffDays(start, end));

  return {
    startISO: start,
    endISO: end,
    totalDays,
    toPercent: (iso: string) => (diffDays(start, iso) / totalDays) * 100,
    spanPercent: (startIso: string, endIso: string) =>
      Math.max(0.6, (diffDays(startIso, endIso) / totalDays) * 100),
  };
}

export interface MonthTick {
  iso: string;
  label: string;
  percent: number;
}

export function monthTicks(scale: TimeScale): MonthTick[] {
  const ticks: MonthTick[] = [];
  const start = parseISO(scale.startISO);
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const endDate = parseISO(scale.endISO);

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  while (cursor <= endDate) {
    const iso = cursor.toISOString().slice(0, 10);
    ticks.push({
      iso,
      label: `${monthNames[cursor.getUTCMonth()]}/${String(cursor.getUTCFullYear()).slice(2)}`,
      percent: scale.toPercent(iso),
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return ticks;
}
