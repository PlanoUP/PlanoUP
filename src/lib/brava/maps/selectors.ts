import { TankWithDerived } from "../types";
import { ASSET_MAPS } from "./config";
import { AssetMapConfig, AssetMapId, MapFilterOption, MapHotspotCoordinate, MapQuickFilter } from "./types";

export function getAssetMap(mapId: AssetMapId): AssetMapConfig {
  const map = ASSET_MAPS.find((m) => m.id === mapId);
  if (!map) throw new Error(`Unknown asset map: ${mapId}`);
  return map;
}

/** Which map a given TAG belongs to, or null if it isn't on any map's roster yet. */
export function getMapByTank(tag: string): AssetMapConfig | null {
  const upper = tag.toUpperCase();
  return ASSET_MAPS.find((m) => m.tankIds.some((t) => t.toUpperCase() === upper)) ?? null;
}

/** The confirmed hotspot position for a TAG on a given map, or null if not yet calibrated. */
export function getTankCoordinates(mapId: AssetMapId, tag: string): MapHotspotCoordinate | null {
  const map = getAssetMap(mapId);
  const upper = tag.toUpperCase();
  return map.coordinates.find((c) => c.tag.toUpperCase() === upper) ?? null;
}

export interface MapTankEntry {
  tank: TankWithDerived | null;
  tag: string;
  coordinate: MapHotspotCoordinate | null;
}

/** Every tank on this map's roster, joined with live tank data and its coordinate (if calibrated). */
export function getTanksByMap(mapId: AssetMapId, tanks: TankWithDerived[]): MapTankEntry[] {
  const map = getAssetMap(mapId);
  const byTag = new Map(tanks.map((t) => [t.tag.toUpperCase(), t]));
  return map.tankIds.map((tag) => ({
    tag,
    tank: byTag.get(tag.toUpperCase()) ?? null,
    coordinate: getTankCoordinates(mapId, tag),
  }));
}

function matchesProduct(tank: TankWithDerived, needle: string): boolean {
  return tank.product.toLowerCase().includes(needle.toLowerCase());
}

export function matchesMapFilter(tank: TankWithDerived, filter: MapQuickFilter, filterOptions: MapFilterOption[]): boolean {
  switch (filter) {
    case "TODOS":
      return true;
    case "CRITICOS":
      return tank.derived.inspectionCriticality === "CRITICO";
    case "EM_MANUTENCAO":
      return tank.status === "EM_EXECUCAO" || tank.status === "ATRASADO" || tank.status === "CRITICO";
    case "INSPECAO_PROXIMA":
      return tank.derived.inspectionCriticality === "ALTA" || tank.derived.inspectionCriticality === "ATENCAO";
    default: {
      const opt = filterOptions.find((f) => f.value === filter);
      if (!opt) return true;
      if (opt.familyMatch) return tank.derived.family === opt.familyMatch;
      if (opt.productMatch) return matchesProduct(tank, opt.productMatch);
      return true;
    }
  }
}

export interface MapSummary {
  total: number;
  criticos: number;
  emManutencao: number;
  proximaInspecao: { tag: string; date: string } | null;
}

/** Executive summary card shown when switching areas — computed entirely from live tank data. */
export function getMapSummary(mapId: AssetMapId, tanks: TankWithDerived[]): MapSummary {
  const entries = getTanksByMap(mapId, tanks)
    .map((e) => e.tank)
    .filter((t): t is TankWithDerived => t !== null);

  const criticos = entries.filter((t) => t.derived.inspectionCriticality === "CRITICO").length;
  const emManutencao = entries.filter(
    (t) => t.status === "EM_EXECUCAO" || t.status === "ATRASADO" || t.status === "CRITICO"
  ).length;

  let proximaInspecao: MapSummary["proximaInspecao"] = null;
  let bestDays = Infinity;
  for (const t of entries) {
    if (!t.nextInternalInspection || t.derived.daysToInternalInspection === null) continue;
    if (t.derived.daysToInternalInspection < 0) continue;
    if (t.derived.daysToInternalInspection < bestDays) {
      bestDays = t.derived.daysToInternalInspection;
      proximaInspecao = { tag: t.tag, date: t.nextInternalInspection };
    }
  }

  return { total: entries.length, criticos, emManutencao, proximaInspecao };
}

/**
 * Locates a tank by partial TAG match (digits only, e.g. "41005" or "6313005")
 * across every map — used by the search box's "asset locator" behavior.
 */
export function findTankAcrossMaps(
  query: string,
  tanks: TankWithDerived[]
): { tank: TankWithDerived; mapId: AssetMapId } | null {
  const digits = query.replace(/\D/g, "");
  if (digits.length === 0) return null;

  for (const map of ASSET_MAPS) {
    for (const tag of map.tankIds) {
      const tankDigits = tag.replace(/\D/g, "");
      if (tankDigits.endsWith(digits) || tankDigits === digits) {
        const tank = tanks.find((t) => t.tag.toUpperCase() === tag.toUpperCase());
        if (tank) return { tank, mapId: map.id };
      }
    }
  }
  return null;
}
