import type { ActivityStatus, Priority } from "@/types/paint-control";

export const PRIORITY_LABELS: Record<Priority, string> = {
  P1: "P1 — Crítica",
  P2: "P2 — Alta",
  P3: "P3 — Média",
  P4: "P4 — Baixa",
};

export const PRIORITY_SHORT_LABELS: Record<Priority, string> = {
  P1: "Crítica",
  P2: "Alta",
  P3: "Média",
  P4: "Baixa",
};

/** Discreet, professional per-priority accents — no full-red alarms. */
export const PRIORITY_STYLES: Record<Priority, { dot: string; text: string; bg: string; border: string }> = {
  P1: { dot: "bg-rose-600", text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
  P2: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  P3: { dot: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" },
  P4: { dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
};

/** Lower weight sorts first: P1 → P2 → P3 → P4. */
export const PRIORITY_WEIGHT: Record<Priority, number> = {
  P1: 0,
  P2: 1,
  P3: 2,
  P4: 3,
};

export const STATUS_STYLES: Record<ActivityStatus, { text: string; bg: string; border: string }> = {
  Backlog: { text: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
  "Aguardando Programação": { text: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
  Programado: { text: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" },
  "Aguardando Liberação": { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  Liberado: { text: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200" },
  "Em Execução": { text: "text-lime-800", bg: "bg-lime-100", border: "border-lime-300" },
  Paralisado: { text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
  "Em Inspeção": { text: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
  Concluído: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  Cancelado: { text: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" },
};

/** Column order for the Programação Kanban board. */
export const KANBAN_STATUSES: ActivityStatus[] = [
  "Backlog",
  "Aguardando Programação",
  "Programado",
  "Liberado",
  "Em Execução",
  "Em Inspeção",
  "Concluído",
];

export const AUTHOR_NAME = "Usuário";
