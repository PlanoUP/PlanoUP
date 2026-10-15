// Interactive Asset Map domain for equipment (Shutdown Control — Unidades).
// Mirrors lib/brava/maps/types.ts (AssetMapConfig), but keyed by process
// unit instead of tankage area, and with no inspection axis (equipment has
// no inspection-date data — see lib/brava/units/types.ts). "CRITICOS" here
// means Equipment.status === "CRITICO" (schedule criticality), the closest
// equivalent available for a domain with no separate inspection criticality.

import { EquipmentType } from "../types";

export type EquipmentMapId = "geral" | "U-260" | "U-270";

export type EquipmentMapQuickFilter = "TODOS" | "CRITICOS" | "EM_MANUTENCAO" | string;

export interface EquipmentMapFilterOption {
  value: string;
  label: string;
  /** Exact match against Equipment.equipmentType — the per-area extra filters. */
  equipmentTypeMatch?: EquipmentType;
}

/** A hotspot with a confirmed, manually-measured position on the map image. */
export interface EquipmentMapHotspotCoordinate {
  tag: string;
  x: number; // 0-100, % of the map image width
  y: number; // 0-100, % of the map image height
}

/**
 * A coordinate calibrated live, in production, via the Modo de Calibração
 * panel — persisted to the database so it takes effect immediately for
 * everyone, with no code change or redeploy. Takes priority over a
 * hardcoded entry in EquipmentAssetMapConfig.coordinates for the same map+tag.
 */
export interface EquipmentMapCoordinateOverride {
  id: string; // `${mapId}:${TAG}`
  mapId: EquipmentMapId;
  tag: string;
  x: number;
  y: number;
  createdAt: string;
  updatedAt: string;
}

export type EquipmentMapCoordinateOverrideInput = Pick<EquipmentMapCoordinateOverride, "mapId" | "tag" | "x" | "y">;

export interface EquipmentAssetMapConfig {
  id: EquipmentMapId;
  name: string;
  shortLabel: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  /** Full intended roster for this area — may include tags with no confirmed coordinate yet. */
  equipmentIds: string[];
  coordinates: EquipmentMapHotspotCoordinate[];
  filters: EquipmentMapFilterOption[];
}
