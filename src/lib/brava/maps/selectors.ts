import { TankWithDerived } from "../types";
import { ASSET_MAPS } from "./config";
import { AssetMapConfig, AssetMapId, MapCoordinateOverride, MapFilterOption, MapHotspotCoordinate, MapQuickFilter } from "./types";

export function getAssetMap(mapId: AssetMapId): AssetMapConfig {
  const map = ASSET_MAPS.find((m) => m.id === mapId);
  if (!map) throw new Error(`Unknown asset map: ${mapId}`);
  return map;
}

/**
 * Which map a given TAG belongs to, or null if it isn't on any map's
 * roster yet. Prefers a map where the tag already has a calibrated
 * coordinate over one where it doesn't (e.g. "Visão Geral" before its
 * tanks are calibrated) — deep links and the search auto-jump should land
 * somewhere the tank's hotspot actually renders, regardless of array order.
 */
export function getMapByTank(tag: string, overrides: MapCoordinateOverride[] = []): AssetMapConfig | null {
  const upper = tag.toUpperCase();
  const candidates = ASSET_MAPS.filter((m) => m.tankIds.some((t) => t.toUpperCase() === upper));
  if (candidates.length === 0) return null;
  const calibrated = candidates.find((m) => getTankCoordinates(m.id, tag, overrides) !== null);
  return calibrated ?? candidates[0];
}

/**
 * The confirmed hotspot position for a TAG on a given map, or null if not
 * yet calibrated. A live-calibrated override (saved via Modo de Calibração,
 * persisted to the database) always wins over a hardcoded config entry for
 * the same map+tag, so a recalibration takes effect immediately.
 */
export function getTankCoordinates(
  mapId: AssetMapId,
  tag: string,
  overrides: MapCoordinateOverride[] = []
): MapHotspotCoordinate | null {
  const upper = tag.toUpperCase();
  const override = overrides.find((o) => o.mapId === mapId && o.tag.toUpperCase() === upper);
  if (override) return { tag: override.tag, x: override.x, y: override.y };
  const map = getAssetMap(mapId);
  return map.coordinates.find((c) => c.tag.toUpperCase() === upper) ?? null;
}

export interface MapTankEntry {
  tank: TankWithDerived | null;
  tag: string;
  coordinate: MapHotspotCoordinate | null;
}

/** Every tank on this map's roster, joined with live tank data and its coordinate (if calibrated). */
export function getTanksByMap(
  mapId: AssetMapId,
  tanks: TankWithDerived[],
  overrides: MapCoordinateOverride[] = []
): MapTankEntry[] {
  const map = getAssetMap(mapId);
  const byTag = new Map(tanks.map((t) => [t.tag.toUpperCase(), t]));
  return map.tankIds.map((tag) => ({
    tag,
    tank: byTag.get(tag.toUpperCase()) ?? null,
    coordinate: getTankCoordinates(mapId, tag, overrides),
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
 * Same calibrated-first preference as getMapByTank, so a match on an
 * uncalibrated map (like "Visão Geral" before it's filled in) never wins
 * over one where the hotspot actually shows.
 */
export function findTankAcrossMaps(
  query: string,
  tanks: TankWithDerived[],
  overrides: MapCoordinateOverride[] = []
): { tank: TankWithDerived; mapId: AssetMapId } | null {
  const digits = query.replace(/\D/g, "");
  if (digits.length === 0) return null;

  function search(requireCalibrated: boolean) {
    for (const map of ASSET_MAPS) {
      for (const tag of map.tankIds) {
        const tankDigits = tag.replace(/\D/g, "");
        if (tankDigits.endsWith(digits) || tankDigits === digits) {
          if (requireCalibrated && getTankCoordinates(map.id, tag, overrides) === null) {
            continue;
          }
          const tank = tanks.find((t) => t.tag.toUpperCase() === tag.toUpperCase());
          if (tank) return { tank, mapId: map.id };
        }
      }
    }
    return null;
  }

  return search(true) ?? search(false);
}
