// Centralized, pure calculations for Material Control — no component should
// recompute readiness/risk/sorting on its own. Mirrors the pattern already
// used for inspection criticality in lib/brava/inspection.ts.

import { diffDays } from "../date-utils";
import { Material, MaterialRiskLevel, MaterialsQuickFilter, MaterialsSortKey } from "./types";
import {
  ACQUISITION_STATUSES,
  MATERIAL_CRITICALITY_META,
  MATERIAL_STATUS_ORDER,
  READY_STATUSES,
} from "./meta";

const ALTO_RISCO_HORIZON_DAYS = 30;

export interface MaterialRiskResult {
  level: MaterialRiskLevel;
  /** Days the forecast lands after the need date (RISCO_CRONOGRAMA only). */
  impactDays: number | null;
  /** Days the forecast lands before the need date (DENTRO_DO_PRAZO only). */
  slackDays: number | null;
}

/**
 * Positive = days of margin before the need date (folga). Negative = days
 * the delivery forecast lands after the need date (atraso). Null when either
 * date is missing — never guessed.
 */
export function calculateDeliverySlack(
  requiredDate: string | undefined,
  expectedDeliveryDate: string | undefined
): number | null {
  if (!requiredDate || !expectedDeliveryDate) return null;
  return diffDays(expectedDeliveryDate, requiredDate);
}

/** See lib/brava/materials/types.ts MaterialRiskLevel for the four buckets. */
export function calculateMaterialRisk(material: Material, todayISO: string): MaterialRiskResult {
  if (READY_STATUSES.includes(material.status) || material.status === "CANCELADO") {
    return { level: "SEM_RISCO", impactDays: null, slackDays: null };
  }

  const slack = calculateDeliverySlack(material.requiredDate, material.expectedDeliveryDate);
  if (slack !== null) {
    return slack < 0
      ? { level: "RISCO_CRONOGRAMA", impactDays: -slack, slackDays: null }
      : { level: "DENTRO_DO_PRAZO", impactDays: null, slackDays: slack };
  }

  // No delivery forecast yet — flag ALTO_RISCO only for a critical item whose
  // need date is already overdue or within the horizon. Never invent a date.
  if (material.criticality === "CRITICO" && material.requiredDate) {
    const daysToNeed = diffDays(todayISO, material.requiredDate);
    if (daysToNeed <= ALTO_RISCO_HORIZON_DAYS) {
      return { level: "ALTO_RISCO", impactDays: null, slackDays: null };
    }
  }

  return { level: "SEM_RISCO", impactDays: null, slackDays: null };
}

export interface MaterialReadiness {
  percent: number;
  criticalPending: number;
}

/** Weighted by criticality (CRITICO=5, IMPORTANTE=3, NORMAL=1) — see spec section 11. */
export function calculateMaterialReadiness(materials: Material[]): MaterialReadiness {
  let totalWeight = 0;
  let readyWeight = 0;
  let criticalPending = 0;

  for (const m of materials) {
    const weight = MATERIAL_CRITICALITY_META[m.criticality].weight;
    totalWeight += weight;
    const isReady = READY_STATUSES.includes(m.status);
    if (isReady) readyWeight += weight;
    if (m.criticality === "CRITICO" && !isReady && m.status !== "CANCELADO") criticalPending++;
  }

  return {
    percent: totalWeight === 0 ? 0 : Math.round((readyWeight / totalWeight) * 100),
    criticalPending,
  };
}

export function getMaterialsByTank(materials: Material[], tankId: string): Material[] {
  return materials.filter((m) => m.tankId === tankId);
}

export function getMaterialsByActivity(materials: Material[], activityId: string): Material[] {
  return materials.filter((m) => m.activityId === activityId);
}

export interface MaterialNeedsBucket {
  key: "ATRASADOS" | "0-30" | "31-60" | "61-90" | "90+";
  label: string;
  items: Material[];
  criticalCount: number;
}

const NEEDS_BUCKET_LABELS: Record<MaterialNeedsBucket["key"], string> = {
  ATRASADOS: "Atrasados",
  "0-30": "0–30 dias",
  "31-60": "31–60 dias",
  "61-90": "61–90 dias",
  "90+": "+90 dias",
};

/** Only materials not yet fulfilled/cancelled, with a real need date, are bucketed. */
export function getUpcomingMaterialNeeds(materials: Material[], todayISO: string): MaterialNeedsBucket[] {
  const buckets: Record<MaterialNeedsBucket["key"], Material[]> = {
    ATRASADOS: [],
    "0-30": [],
    "31-60": [],
    "61-90": [],
    "90+": [],
  };

  for (const m of materials) {
    if (READY_STATUSES.includes(m.status) || m.status === "CANCELADO") continue;
    if (!m.requiredDate) continue;
    const days = diffDays(todayISO, m.requiredDate);
    if (days < 0) buckets.ATRASADOS.push(m);
    else if (days <= 30) buckets["0-30"].push(m);
    else if (days <= 60) buckets["31-60"].push(m);
    else if (days <= 90) buckets["61-90"].push(m);
    else buckets["90+"].push(m);
  }

  return (Object.keys(buckets) as MaterialNeedsBucket["key"][]).map((key) => ({
    key,
    label: NEEDS_BUCKET_LABELS[key],
    items: buckets[key],
    criticalCount: buckets[key].filter((m) => m.criticality === "CRITICO").length,
  }));
}

/**
 * Default panel ordering: materials in risk first, then pending criticals,
 * then soonest need date, then everything else — see spec section 14.
 */
export function sortMaterialsByPriority(materials: Material[], todayISO: string): Material[] {
  function tier(m: Material): number {
    const risk = calculateMaterialRisk(m, todayISO).level;
    if (risk === "RISCO_CRONOGRAMA" || risk === "ALTO_RISCO") return 0;
    if (m.criticality === "CRITICO" && !READY_STATUSES.includes(m.status) && m.status !== "CANCELADO") return 1;
    if (m.requiredDate) return 2;
    return 3;
  }

  return [...materials].sort((a, b) => {
    const ta = tier(a);
    const tb = tier(b);
    if (ta !== tb) return ta - tb;
    if (ta === 2) return a.requiredDate!.localeCompare(b.requiredDate!);
    return a.description.localeCompare(b.description);
  });
}

/** "+5 DIAS" / "15 DIAS DE FOLGA" / "PREVISÃO NÃO INFORMADA" / "" — never invented. */
export function formatMaterialRiskDetail(result: MaterialRiskResult): string {
  if (result.level === "RISCO_CRONOGRAMA" && result.impactDays !== null) {
    return `+${result.impactDays} dia${result.impactDays === 1 ? "" : "s"}`;
  }
  if (result.level === "DENTRO_DO_PRAZO" && result.slackDays !== null) {
    return `${result.slackDays} dia${result.slackDays === 1 ? "" : "s"} de folga`;
  }
  if (result.level === "ALTO_RISCO") {
    return "Previsão não informada";
  }
  return "";
}

const NO_DATE_SORT_VALUE = "9999-99-99";

/** Explicit column sorting for the table header — "PADRAO" defers to sortMaterialsByPriority. */
export function sortMaterialsByColumn(
  materials: Material[],
  key: MaterialsSortKey,
  todayISO: string,
  tankTagById: Record<string, string>
): Material[] {
  if (key === "PADRAO") return sortMaterialsByPriority(materials, todayISO);

  const arr = [...materials];
  switch (key) {
    case "NECESSIDADE":
      arr.sort((a, b) => (a.requiredDate ?? NO_DATE_SORT_VALUE).localeCompare(b.requiredDate ?? NO_DATE_SORT_VALUE));
      break;
    case "ENTREGA":
      arr.sort((a, b) =>
        (a.expectedDeliveryDate ?? NO_DATE_SORT_VALUE).localeCompare(b.expectedDeliveryDate ?? NO_DATE_SORT_VALUE)
      );
      break;
    case "CRITICIDADE":
      arr.sort(
        (a, b) => MATERIAL_CRITICALITY_META[b.criticality].weight - MATERIAL_CRITICALITY_META[a.criticality].weight
      );
      break;
    case "STATUS":
      arr.sort((a, b) => MATERIAL_STATUS_ORDER.indexOf(a.status) - MATERIAL_STATUS_ORDER.indexOf(b.status));
      break;
    case "TANQUE":
      arr.sort((a, b) => (tankTagById[a.tankId] ?? "").localeCompare(tankTagById[b.tankId] ?? ""));
      break;
    case "MATERIAL":
      arr.sort((a, b) => a.description.localeCompare(b.description));
      break;
  }
  return arr;
}

export interface MaterialsFilterOptions {
  quickFilter: MaterialsQuickFilter;
  search: string;
  /** Tank.id -> TAG, for TAG search — materials only store tankId. */
  tankTagById: Record<string, string>;
}

/** Central filter logic for the quick-filter chips + free-text search. */
export function filterMaterials(materials: Material[], opts: MaterialsFilterOptions, todayISO: string): Material[] {
  const search = opts.search.trim().toLowerCase();

  return materials.filter((m) => {
    switch (opts.quickFilter) {
      case "410":
      case "6313":
      case "270":
        if (m.tankFamily !== opts.quickFilter) return false;
        break;
      case "CRITICOS":
        if (m.criticality !== "CRITICO") return false;
        break;
      case "EM_ATRASO": {
        const late =
          !READY_STATUSES.includes(m.status) &&
          m.status !== "CANCELADO" &&
          !!m.requiredDate &&
          diffDays(todayISO, m.requiredDate) < 0;
        if (!late) return false;
        break;
      }
      case "EM_AQUISICAO":
        if (!ACQUISITION_STATUSES.includes(m.status)) return false;
        break;
      case "RECEBIDOS":
        if (!READY_STATUSES.includes(m.status)) return false;
        break;
      case "COM_RISCO": {
        const level = calculateMaterialRisk(m, todayISO).level;
        if (level !== "RISCO_CRONOGRAMA" && level !== "ALTO_RISCO") return false;
        break;
      }
      case "TODOS":
      default:
        break;
    }

    if (search.length === 0) return true;
    const tag = (opts.tankTagById[m.tankId] ?? "").toLowerCase();
    return (
      m.description.toLowerCase().includes(search) ||
      m.code.toLowerCase().includes(search) ||
      tag.includes(search) ||
      (m.purchaseOrder ?? "").toLowerCase().includes(search) ||
      (m.supplier ?? "").toLowerCase().includes(search)
    );
  });
}

export interface MaterialsKpis {
  total: number;
  disponiveis: number;
  emAquisicao: number;
  emAtraso: number;
  criticos: number;
  emRisco: number;
  readinessPercent: number;
  criticalPending: number;
}

export function computeMaterialsKpis(materials: Material[], todayISO: string): MaterialsKpis {
  const readiness = calculateMaterialReadiness(materials);
  let disponiveis = 0;
  let emAquisicao = 0;
  let emAtraso = 0;
  let criticos = 0;
  let emRisco = 0;

  for (const m of materials) {
    if (READY_STATUSES.includes(m.status)) disponiveis++;
    if (ACQUISITION_STATUSES.includes(m.status)) emAquisicao++;
    if (m.criticality === "CRITICO") criticos++;

    const risk = calculateMaterialRisk(m, todayISO).level;
    if (risk === "RISCO_CRONOGRAMA" || risk === "ALTO_RISCO") emRisco++;

    if (
      !READY_STATUSES.includes(m.status) &&
      m.status !== "CANCELADO" &&
      m.requiredDate &&
      diffDays(todayISO, m.requiredDate) < 0
    ) {
      emAtraso++;
    }
  }

  return {
    total: materials.length,
    disponiveis,
    emAquisicao,
    emAtraso,
    criticos,
    emRisco,
    readinessPercent: readiness.percent,
    criticalPending: readiness.criticalPending,
  };
}
