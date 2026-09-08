// Timezone-safe date helpers. All dates are stored as ISO "YYYY-MM-DD" strings
// and manipulated as UTC-midnight Date objects to avoid off-by-one drift.

export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISO(d);
}

/** Number of days from `a` to `b` (b - a). */
export function diffDays(a: string, b: string): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / MS_PER_DAY);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function isBefore(a: string, b: string): boolean {
  return a < b;
}

export function isAfter(a: string, b: string): boolean {
  return a > b;
}

export function clampISO(iso: string, min: string, max: string): string {
  if (iso < min) return min;
  if (iso > max) return max;
  return iso;
}

const MONTHS_PT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

export function formatShort(iso?: string): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
}

export function formatLong(iso?: string): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  return `${d.getUTCDate()} ${MONTHS_PT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatMonthYear(iso: string): string {
  const d = parseISO(iso);
  return `${MONTHS_PT[d.getUTCMonth()]}/${String(d.getUTCFullYear()).slice(2)}`;
}
