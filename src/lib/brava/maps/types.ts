// Interactive Asset Map domain — a navigation layer over the existing tank
// data, never a source of truth of its own. Coordinates are positioned
// manually (see MAP BASE image + calibration mode) and reference tanks only
// by their real TAG; nothing here duplicates status/criticality/dates,
// which always come from lib/brava/selectors.ts + lib/brava/inspection.ts.

export type AssetMapId = "410-6313" | "270" | "1222";

export type MapQuickFilter =
  | "TODOS"
  | "CRITICOS"
  | "EM_MANUTENCAO"
  | "INSPECAO_PROXIMA"
  | string; // area-specific extra filters (family or product), see AssetMapConfig.filters

export interface MapFilterOption {
  value: string;
  label: string;
  /** Substring match against Tank.product — omitted for the family-based 410/6313 filters. */
  productMatch?: string;
  /** Exact match against TankDerived.family — used only by the 410/6313 map. */
  familyMatch?: "410" | "6313";
}

/** A hotspot with a confirmed, manually-measured position on the map image. */
export interface MapHotspotCoordinate {
  tag: string;
  x: number; // 0-100, % of the map image width
  y: number; // 0-100, % of the map image height
}

export interface AssetMapConfig {
  id: AssetMapId;
  name: string;
  shortLabel: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  /** Full intended roster for this area — may include tags with no confirmed coordinate yet. */
  tankIds: string[];
  coordinates: MapHotspotCoordinate[];
  filters: MapFilterOption[];
}
