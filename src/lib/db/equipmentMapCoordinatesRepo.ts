import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { EquipmentMapCoordinateOverride, EquipmentMapCoordinateOverrideInput } from "../brava/units/maps/types";

function makeId(mapId: string, tag: string): string {
  return `${mapId}:${tag.toUpperCase()}`;
}

export async function listEquipmentMapCoordinates(): Promise<EquipmentMapCoordinateOverride[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM equipment_map_coordinates ORDER BY id");
  return rows.map((r: Record<string, unknown>) => r.data as EquipmentMapCoordinateOverride);
}

/** Upserts a single tag's calibrated position for a map — recalibrating an already-saved tag overwrites it. */
export async function upsertEquipmentMapCoordinate(
  input: EquipmentMapCoordinateOverrideInput
): Promise<EquipmentMapCoordinateOverride> {
  await ensureSchema();
  const sql = getSql();
  const id = makeId(input.mapId, input.tag);
  const now = new Date().toISOString();
  const existing = await sql.query("SELECT data FROM equipment_map_coordinates WHERE id = $1", [id]);
  const createdAt = (existing[0]?.data as EquipmentMapCoordinateOverride | undefined)?.createdAt ?? now;

  const coordinate: EquipmentMapCoordinateOverride = {
    id,
    mapId: input.mapId,
    tag: input.tag.toUpperCase(),
    x: input.x,
    y: input.y,
    createdAt,
    updatedAt: now,
  };

  await sql.query(
    "INSERT INTO equipment_map_coordinates (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()",
    [id, JSON.stringify(coordinate)]
  );
  return coordinate;
}

export async function deleteEquipmentMapCoordinate(id: string): Promise<void> {
  const sql = getSql();
  await sql.query("DELETE FROM equipment_map_coordinates WHERE id = $1", [id]);
}
