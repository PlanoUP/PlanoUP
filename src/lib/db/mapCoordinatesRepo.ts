import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { MapCoordinateOverride, MapCoordinateOverrideInput } from "../brava/maps/types";

function makeId(mapId: string, tag: string): string {
  return `${mapId}:${tag.toUpperCase()}`;
}

export async function listMapCoordinates(): Promise<MapCoordinateOverride[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM map_coordinates ORDER BY id");
  return rows.map((r: Record<string, unknown>) => r.data as MapCoordinateOverride);
}

/** Upserts a single tag's calibrated position for a map — recalibrating an already-saved tag overwrites it. */
export async function upsertMapCoordinate(input: MapCoordinateOverrideInput): Promise<MapCoordinateOverride> {
  await ensureSchema();
  const sql = getSql();
  const id = makeId(input.mapId, input.tag);
  const now = new Date().toISOString();
  const existing = await sql.query("SELECT data FROM map_coordinates WHERE id = $1", [id]);
  const createdAt = (existing[0]?.data as MapCoordinateOverride | undefined)?.createdAt ?? now;

  const coordinate: MapCoordinateOverride = {
    id,
    mapId: input.mapId,
    tag: input.tag.toUpperCase(),
    x: input.x,
    y: input.y,
    createdAt,
    updatedAt: now,
  };

  await sql.query(
    "INSERT INTO map_coordinates (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()",
    [id, JSON.stringify(coordinate)]
  );
  return coordinate;
}

export async function deleteMapCoordinate(id: string): Promise<void> {
  const sql = getSql();
  await sql.query("DELETE FROM map_coordinates WHERE id = $1", [id]);
}
