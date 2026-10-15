import { EquipmentWithDerived } from "../types";
import { EQUIPMENT_ASSET_MAPS } from "./config";
import {
  EquipmentAssetMapConfig,
  EquipmentMapId,
  EquipmentMapCoordinateOverride,
  EquipmentMapFilterOption,
  EquipmentMapHotspotCoordinate,
  EquipmentMapQuickFilter,
} from "./types";

export function getEquipmentAssetMap(mapId: EquipmentMapId): EquipmentAssetMapConfig {
  const map = EQUIPMENT_ASSET_MAPS.find((m) => m.id === mapId);
  if (!map) throw new Error(`Unknown equipment asset map: ${mapId}`);
  return map;
}

/**
 * Which map a given TAG belongs to, or null if it isn't on any map's
 * roster yet. Prefers a map where the tag already has a calibrated
 * coordinate over one where it doesn't (e.g. "Visão Geral" before its
 * equipment is calibrated).
 */
export function getMapByEquipment(
  tag: string,
  overrides: EquipmentMapCoordinateOverride[] = []
): EquipmentAssetMapConfig | null {
  const upper = tag.toUpperCase();
  const candidates = EQUIPMENT_ASSET_MAPS.filter((m) => m.equipmentIds.some((t) => t.toUpperCase() === upper));
  if (candidates.length === 0) return null;
  const calibrated = candidates.find((m) => getEquipmentCoordinates(m.id, tag, overrides) !== null);
  return calibrated ?? candidates[0];
}

/**
 * The confirmed hotspot position for a TAG on a given map, or null if not
 * yet calibrated. A live-calibrated override always wins over a hardcoded
 * config entry for the same map+tag.
 */
export function getEquipmentCoordinates(
  mapId: EquipmentMapId,
  tag: string,
  overrides: EquipmentMapCoordinateOverride[] = []
): EquipmentMapHotspotCoordinate | null {
  const upper = tag.toUpperCase();
  const override = overrides.find((o) => o.mapId === mapId && o.tag.toUpperCase() === upper);
  if (override) return { tag: override.tag, x: override.x, y: override.y };
  const map = getEquipmentAssetMap(mapId);
  return map.coordinates.find((c) => c.tag.toUpperCase() === upper) ?? null;
}

export interface MapEquipmentEntry {
  equipment: EquipmentWithDerived | null;
  tag: string;
  coordinate: EquipmentMapHotspotCoordinate | null;
}

/** Every equipment item on this map's roster, joined with live data and its coordinate (if calibrated). */
export function getEquipmentByMap(
  mapId: EquipmentMapId,
  equipment: EquipmentWithDerived[],
  overrides: EquipmentMapCoordinateOverride[] = []
): MapEquipmentEntry[] {
  const map = getEquipmentAssetMap(mapId);
  const byTag = new Map(equipment.map((e) => [e.tag.toUpperCase(), e]));
  return map.equipmentIds.map((tag) => ({
    tag,
    equipment: byTag.get(tag.toUpperCase()) ?? null,
    coordinate: getEquipmentCoordinates(mapId, tag, overrides),
  }));
}

export function matchesEquipmentMapFilter(
  equipment: EquipmentWithDerived,
  filter: EquipmentMapQuickFilter,
  filterOptions: EquipmentMapFilterOption[]
): boolean {
  switch (filter) {
    case "TODOS":
      return true;
    case "CRITICOS":
      return equipment.status === "CRITICO";
    case "EM_MANUTENCAO":
      return equipment.status === "EM_EXECUCAO" || equipment.status === "ATRASADO" || equipment.status === "CRITICO";
    default: {
      const opt = filterOptions.find((f) => f.value === filter);
      if (!opt) return true;
      if (opt.equipmentTypeMatch) return equipment.equipmentType === opt.equipmentTypeMatch;
      return true;
    }
  }
}

export interface MapSummary {
  total: number;
  criticos: number;
  emManutencao: number;
}

/** Executive summary card shown when switching areas — computed entirely from live equipment data. */
export function getEquipmentMapSummary(mapId: EquipmentMapId, equipment: EquipmentWithDerived[]): MapSummary {
  const entries = getEquipmentByMap(mapId, equipment)
    .map((e) => e.equipment)
    .filter((e): e is EquipmentWithDerived => e !== null);

  const criticos = entries.filter((e) => e.status === "CRITICO").length;
  const emManutencao = entries.filter(
    (e) => e.status === "EM_EXECUCAO" || e.status === "ATRASADO" || e.status === "CRITICO"
  ).length;

  return { total: entries.length, criticos, emManutencao };
}

/**
 * Locates an equipment item by partial TAG match across every map — used
 * by the search box's "asset locator" behavior. Same calibrated-first
 * preference as getMapByEquipment.
 */
export function findEquipmentAcrossMaps(
  query: string,
  equipment: EquipmentWithDerived[],
  overrides: EquipmentMapCoordinateOverride[] = []
): { equipment: EquipmentWithDerived; mapId: EquipmentMapId } | null {
  const needle = query.trim().toUpperCase();
  if (needle.length === 0) return null;

  function search(requireCalibrated: boolean) {
    for (const map of EQUIPMENT_ASSET_MAPS) {
      for (const tag of map.equipmentIds) {
        if (tag.toUpperCase().includes(needle)) {
          if (requireCalibrated && getEquipmentCoordinates(map.id, tag, overrides) === null) {
            continue;
          }
          const found = equipment.find((e) => e.tag.toUpperCase() === tag.toUpperCase());
          if (found) return { equipment: found, mapId: map.id };
        }
      }
    }
    return null;
  }

  return search(true) ?? search(false);
}
