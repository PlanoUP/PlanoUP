// Centralized, pure calculations for equipment Material Control — mirrors
// lib/brava/materials/calculations.ts, adapted to EquipmentMaterial.

import { diffDays } from "../../date-utils";
import { EquipmentMaterial, EquipmentMaterialsQuickFilter, EquipmentMaterialsSortKey } from "./types";
import { MaterialRiskLevel } from "../../materials/types";
import {
  ACQUISITION_STATUSES,
  MATERIAL_CRITICALITY_META,
  MATERIAL_STATUS_ORDER,
  READY_STATUSES,
} from "../../materials/meta";

const ALTO_RISCO_HORIZON_DAYS = 30;

export interface MaterialRiskResult {
  level: MaterialRiskLevel;
  impactDays: number | null;
  slackDays: number | null;
}

export function calculateDeliverySlack(
  requiredDate: string | undefined,
  expectedDeliveryDate: string | undefined
): number | null {
  if (!requiredDate || !expectedDeliveryDate) return null;
  return diffDays(expectedDeliveryDate, requiredDate);
}

export function calculateMaterialRisk(material: EquipmentMaterial, todayISO: string): MaterialRiskResult {
  if (READY_STATUSES.includes(material.status) || material.status === "CANCELADO") {
    return { level: "SEM_RISCO", impactDays: null, slackDays: null };
  }

  const slack = calculateDeliverySlack(material.requiredDate, material.expectedDeliveryDate);
  if (slack !== null) {
    return slack < 0
      ? { level: "RISCO_CRONOGRAMA", impactDays: -slack, slackDays: null }
      : { level: "DENTRO_DO_PRAZO", impactDays: null, slackDays: slack };
  }

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

export function calculateMaterialReadiness(materials: EquipmentMaterial[]): MaterialReadiness {
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

export function getMaterialsByEquipment(materials: EquipmentMaterial[], equipmentId: string): EquipmentMaterial[] {
  return materials.filter((m) => m.equipmentId === equipmentId);
}

export function getMaterialsByActivity(materials: EquipmentMaterial[], activityId: string): EquipmentMaterial[] {
  return materials.filter((m) => m.activityId === activityId);
}

export interface MaterialNeedsBucket {
  key: "ATRASADOS" | "0-30" | "31-60" | "61-90" | "90+";
  label: string;
  items: EquipmentMaterial[];
  criticalCount: number;
}

const NEEDS_BUCKET_LABELS: Record<MaterialNeedsBucket["key"], string> = {
  ATRASADOS: "Atrasados",
  "0-30": "0–30 dias",
  "31-60": "31–60 dias",
  "61-90": "61–90 dias",
  "90+": "+90 dias",
};

export function getUpcomingMaterialNeeds(materials: EquipmentMaterial[], todayISO: string): MaterialNeedsBucket[] {
  const buckets: Record<MaterialNeedsBucket["key"], EquipmentMaterial[]> = {
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

export function sortMaterialsByPriority(materials: EquipmentMaterial[], todayISO: string): EquipmentMaterial[] {
  function tier(m: EquipmentMaterial): number {
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

export function sortMaterialsByColumn(
  materials: EquipmentMaterial[],
  key: EquipmentMaterialsSortKey,
  todayISO: string,
  equipmentTagById: Record<string, string>
): EquipmentMaterial[] {
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
    case "EQUIPAMENTO":
      arr.sort((a, b) => (equipmentTagById[a.equipmentId] ?? "").localeCompare(equipmentTagById[b.equipmentId] ?? ""));
      break;
    case "MATERIAL":
      arr.sort((a, b) => a.description.localeCompare(b.description));
      break;
  }
  return arr;
}

export interface MaterialsFilterOptions {
  quickFilter: EquipmentMaterialsQuickFilter;
  search: string;
  /** Equipment.id -> TAG, for TAG search — materials only store equipmentId. */
  equipmentTagById: Record<string, string>;
}

export function filterMaterials(materials: EquipmentMaterial[], opts: MaterialsFilterOptions, todayISO: string): EquipmentMaterial[] {
  const search = opts.search.trim().toLowerCase();

  return materials.filter((m) => {
    switch (opts.quickFilter) {
      case "U-260":
      case "U-270":
        if (m.processUnit !== opts.quickFilter) return false;
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
    const tag = (opts.equipmentTagById[m.equipmentId] ?? "").toLowerCase();
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

export function computeMaterialsKpis(materials: EquipmentMaterial[], todayISO: string): MaterialsKpis {
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
