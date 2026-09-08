import { Tank, TankDerived, TankWithDerived, TankFilter } from "./types";
import { weightedProgress, overallDeviationDays } from "./schedule-engine";
import { diffDays } from "./date-utils";

export function deriveTank(tank: Tank, todayISO: string): TankDerived {
  const activities = [...tank.activities].sort((a, b) => a.order - b.order);
  const first = activities[0];
  const last = activities[activities.length - 1];

  const currentActivity = activities.find((a) => a.status === "ATUAL") ?? null;
  const nextActivity =
    activities.find((a) => a.status === "FUTURO") ?? null;
  const nextMilestone =
    activities.find((a) => a.isMilestone && a.status !== "CONCLUIDO") ?? null;

  const progress = tank.status === "CONCLUIDO" ? 100 : weightedProgress(activities);
  const plannedEnd = last?.plannedEnd ?? "";

  return {
    plannedStart: first?.plannedStart ?? "",
    plannedEnd,
    baselinePlannedEnd: last?.baselineEnd ?? "",
    actualStart: first?.actualStart,
    actualEnd: tank.status === "CONCLUIDO" ? last?.actualEnd : undefined,
    progress,
    daysRemaining: tank.status === "CONCLUIDO" ? null : diffDays(todayISO, plannedEnd),
    deviationDays: overallDeviationDays(activities),
    currentActivity,
    nextActivity,
    nextMilestone,
  };
}

export function withDerived(tanks: Tank[], todayISO: string): TankWithDerived[] {
  return tanks.map((t) => ({ ...t, derived: deriveTank(t, todayISO) }));
}

export function filterTanks(tanks: TankWithDerived[], filter: TankFilter): TankWithDerived[] {
  const search = filter.search.trim().toLowerCase();
  return tanks.filter((t) => {
    const statusMatch = filter.status === "TODOS" || t.status === filter.status;
    const searchMatch =
      search.length === 0 ||
      t.tag.toLowerCase().includes(search) ||
      t.area.toLowerCase().includes(search) ||
      t.product.toLowerCase().includes(search);
    return statusMatch && searchMatch;
  });
}

export interface FleetKpis {
  total: number;
  emManutencao: number;
  programados: number;
  concluidos: number;
  avancoFisicoGeral: number;
  atividadesCriticas: number;
  atrasos: number;
  proximoMarco: { tag: string; name: string; date: string; daysAway: number } | null;
}

export function computeFleetKpis(tanks: TankWithDerived[], todayISO: string): FleetKpis {
  const total = tanks.length;
  const emManutencao = tanks.filter((t) =>
    ["EM_EXECUCAO", "ATRASADO", "CRITICO"].includes(t.status)
  ).length;
  const programados = tanks.filter((t) => t.status === "PROGRAMADO").length;
  const concluidos = tanks.filter((t) => t.status === "CONCLUIDO").length;
  const atrasos = tanks.filter((t) => t.status === "ATRASADO" || t.status === "CRITICO").length;
  const atividadesCriticas = tanks.filter((t) => t.status === "CRITICO").length;

  const active = tanks.filter((t) => t.status !== "CONCLUIDO");
  const avancoFisicoGeral =
    tanks.length === 0
      ? 0
      : Math.round(tanks.reduce((sum, t) => sum + t.derived.progress, 0) / tanks.length);

  let proximoMarco: FleetKpis["proximoMarco"] = null;
  for (const t of active) {
    const m = t.derived.nextMilestone;
    if (!m) continue;
    const daysAway = diffDays(todayISO, m.plannedStart);
    if (daysAway < 0) continue;
    if (!proximoMarco || daysAway < proximoMarco.daysAway) {
      proximoMarco = { tag: t.tag, name: m.name, date: m.plannedStart, daysAway };
    }
  }

  return {
    total,
    emManutencao,
    programados,
    concluidos,
    avancoFisicoGeral,
    atividadesCriticas,
    atrasos,
    proximoMarco,
  };
}
