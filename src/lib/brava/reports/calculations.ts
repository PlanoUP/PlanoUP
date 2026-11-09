import { TankWithDerived, Activity } from "../types";
import { CostEntry } from "../costs/types";
import { computeCostTotals } from "../costs/calculations";
import { diffDays } from "../date-utils";
import {
  ReportScope,
  ReportKpis,
  ReportPhysicalProgress,
  ReportFinancialSummary,
  ReportTankRow,
  ReportMilestone,
  ReportCriticalPoint,
} from "./types";

// Tanks with no maintenance project yet (inspection-only) have nothing to
// report progress on; a finished one no longer belongs in a "how's the
// current campaign going" figure either — same exclusion computeFleetKpis
// already uses for its own avancoFisicoGeral, kept consistent here.
function inScopeForProgress(tanks: TankWithDerived[]): TankWithDerived[] {
  return tanks.filter((t) => t.status !== "SEM_PROJETO" && t.status !== "CONCLUIDO");
}

/**
 * Scopes selectable in the report — "Consolidado" (every tracked tank)
 * plus one per distinct Tank.area actually present among tanks with a real
 * maintenance project. There's no "ATI"/"TAG" field in the data model, so
 * this is the closest real, existing grouping; relabel here (not by
 * inventing a fake field) if that distinction turns out to be a different,
 * real concept later.
 */
export function getReportScopes(tanks: TankWithDerived[]): { value: ReportScope; label: string }[] {
  const withProject = tanks.filter((t) => t.status !== "SEM_PROJETO");
  const areas = Array.from(new Set(withProject.map((t) => t.area))).sort();
  return [{ value: "CONSOLIDADO", label: "Consolidado" }, ...areas.map((a) => ({ value: a, label: a }))];
}

export function filterByScope(tanks: TankWithDerived[], scope: ReportScope): TankWithDerived[] {
  if (scope === "CONSOLIDADO") return tanks;
  return tanks.filter((t) => t.area === scope);
}

export function computeReportKpis(tanks: TankWithDerived[]): ReportKpis {
  return {
    total: tanks.length,
    emManutencao: tanks.filter((t) => ["EM_EXECUCAO", "ATRASADO", "CRITICO"].includes(t.status)).length,
    programados: tanks.filter((t) => t.status === "PROGRAMADO").length,
    concluidos: tanks.filter((t) => t.status === "CONCLUIDO").length,
    atencaoOuCritico: tanks.filter((t) => t.status === "ATRASADO" || t.status === "CRITICO").length,
  };
}

/** An activity's planned (baseline-independent) progress as of a given date — 0 before it starts, 100 once its planned window has passed, linear in between. Mirrors weightedProgress's own duration weighting, applied to a date instead of the stored progress field. */
function activityPlannedProgress(activity: Activity, cutoffISO: string): number {
  if (cutoffISO < activity.plannedStart) return 0;
  if (cutoffISO >= activity.plannedEnd) return 100;
  const span = diffDays(activity.plannedStart, activity.plannedEnd);
  if (span <= 0) return 100;
  return (diffDays(activity.plannedStart, cutoffISO) / span) * 100;
}

/**
 * Consolidated physical progress across every in-scope tank's activities
 * pooled together — the same duration-weighting schedule-engine's own
 * weightedProgress() already uses inside one tank, extended across tanks
 * instead of averaging each tank's already-rounded percentage. A
 * multi-month intervention pulls the portfolio figure further than a
 * two-week one, the same way a long activity already outweighs a short one
 * within a single tank's own progress number.
 */
export function computeConsolidatedProgress(
  tanks: TankWithDerived[],
  cutoffISO: string,
  previousRealizado: number | null
): ReportPhysicalProgress {
  const scoped = inScopeForProgress(tanks);
  const activities = scoped.flatMap((t) => t.activities);
  const totalDuration = activities.reduce((sum, a) => sum + a.durationDays, 0);

  const realizado =
    totalDuration === 0
      ? 0
      : (activities.reduce((sum, a) => sum + (a.progress / 100) * a.durationDays, 0) / totalDuration) * 100;

  const previsto =
    totalDuration === 0
      ? 0
      : (activities.reduce((sum, a) => sum + (activityPlannedProgress(a, cutoffISO) / 100) * a.durationDays, 0) /
          totalDuration) *
        100;

  return {
    previsto: Math.round(previsto),
    realizado: Math.round(realizado),
    desvioPP: Math.round(realizado - previsto),
    deltaSemanaAnterior: previousRealizado === null ? null : Math.round(realizado) - previousRealizado,
  };
}

/**
 * hasData is false (never a fabricated R$ 0) whenever no in-scope tank has
 * a single cost_entries row — the slide shows "dado indisponível" in that
 * case rather than a budget that doesn't exist.
 */
export function computeFinancialSummary(tanks: TankWithDerived[], costs: CostEntry[]): ReportFinancialSummary {
  const tags = new Set(tanks.map((t) => t.tag.toUpperCase()));
  const scopedCosts = costs.filter((c) => tags.has(c.tag.toUpperCase()));
  const tagsWithData = new Set(scopedCosts.map((c) => c.tag.toUpperCase()));
  const totals = computeCostTotals(scopedCosts);

  const lines = Array.from(tagsWithData)
    .map((tag) => {
      const tankCosts = scopedCosts.filter((c) => c.tag.toUpperCase() === tag);
      const t = computeCostTotals(tankCosts);
      return { tag, orcado: t.orcado, realizado: t.realizado };
    })
    .sort((a, b) => b.orcado - a.orcado);

  return {
    hasData: tagsWithData.size > 0,
    orcado: totals.orcado,
    realizado: totals.realizado,
    saldo: totals.variance,
    tanksWithData: tagsWithData.size,
    tanksInScope: tanks.length,
    lines,
  };
}

function classify(tank: TankWithDerived): ReportTankRow["classificacao"] {
  if (tank.status === "CONCLUIDO") return "CONCLUIDO";
  // ATRASADO is already date-derived (plannedEnd passed without completion,
  // see deriveActivityStatus) and CRITICO is a human escalation call — both
  // are real signals, not a bare "negative desvioPP" read.
  if (tank.status === "CRITICO" || tank.status === "ATRASADO") return "CRITICO";
  const daysRemaining = tank.derived.daysRemaining;
  if (daysRemaining !== null && daysRemaining <= 14) return "ATENCAO";
  if (tank.derived.deviationDays > 5) return "ATENCAO";
  return "NO_PRAZO";
}

const CLASS_RANK: Record<ReportTankRow["classificacao"], number> = {
  CRITICO: 0,
  ATENCAO: 1,
  NO_PRAZO: 2,
  CONCLUIDO: 3,
};

export function buildTankMatrix(tanks: TankWithDerived[], cutoffISO: string): ReportTankRow[] {
  const active = tanks.filter((t) => t.status !== "SEM_PROJETO");
  const rows: ReportTankRow[] = active.map((t) => {
    const activities = t.activities;
    const totalDuration = activities.reduce((sum, a) => sum + a.durationDays, 0);
    const previsto =
      totalDuration === 0
        ? 0
        : Math.round(
            activities.reduce((sum, a) => sum + (activityPlannedProgress(a, cutoffISO) / 100) * a.durationDays, 0) /
              totalDuration *
              100
          );
    return {
      tag: t.tag,
      area: t.area,
      faseAtual: t.status === "CONCLUIDO" ? "Concluído" : t.status === "PROGRAMADO" ? "Aguardando início" : t.derived.currentActivity?.name ?? "—",
      previsto,
      realizado: t.derived.progress,
      desvioPP: t.derived.progress - previsto,
      previsaoEntrega: t.derived.plannedEnd || "",
      classificacao: classify(t),
    };
  });

  return rows.sort((a, b) => {
    const rankDiff = CLASS_RANK[a.classificacao] - CLASS_RANK[b.classificacao];
    if (rankDiff !== 0) return rankDiff;
    return a.desvioPP - b.desvioPP;
  });
}

export function buildMilestones(tanks: TankWithDerived[], cutoffISO: string, daysAhead: number): ReportMilestone[] {
  const windowEnd = diffDaysISO(cutoffISO, daysAhead);
  const milestones: ReportMilestone[] = [];
  for (const t of tanks) {
    for (const a of t.activities) {
      if (!a.isMilestone || a.status === "CONCLUIDO") continue;
      if (a.plannedStart < cutoffISO || a.plannedStart > windowEnd) continue;
      milestones.push({
        tag: t.tag,
        nome: a.name,
        data: a.plannedStart,
        diasRestantes: diffDays(cutoffISO, a.plannedStart),
      });
    }
  }
  return milestones.sort((a, b) => a.diasRestantes - b.diasRestantes);
}

function diffDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * A starting point for the draft's "Pontos Críticos" block, built from
 * tanks already flagged ATRASADO/CRITICO — never published as-is: situação
 * is the one fact the system actually knows (status + deviation), while
 * impacto/ação stay blank for a person to fill in before closing the week.
 */
export function suggestCriticalPoints(tanks: TankWithDerived[]): ReportCriticalPoint[] {
  return tanks
    .filter((t) => t.status === "CRITICO" || t.status === "ATRASADO")
    .map((t) => ({
      id: `${t.id}-suggested`,
      tag: t.tag,
      situacao:
        t.status === "CRITICO"
          ? "Escalado como crítico"
          : `Atrasado — desvio de ${t.derived.deviationDays > 0 ? "+" : ""}${t.derived.deviationDays}d sobre o baseline`,
      impacto: "",
      acao: "",
      responsavel: t.responsible ?? "",
      prazo: "",
    }));
}
