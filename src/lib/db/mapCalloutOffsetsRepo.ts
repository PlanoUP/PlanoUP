import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { MapCalloutOffsetOverride, MapCalloutOffsetOverrideInput } from "../brava/maps/types";

function makeId(mapId: string, tag: string): string {
  return `${mapId}:${tag.toUpperCase()}`;
}

export async function listMapCalloutOffsets(): Promise<MapCalloutOffsetOverride[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM map_callout_offsets ORDER BY id");
  return rows.map((r: Record<string, unknown>) => r.data as MapCalloutOffsetOverride);
}

/** Upserts a single tag's dragged callout position for a map — dragging an already-saved tag overwrites it. */
export async function upsertMapCalloutOffset(input: MapCalloutOffsetOverrideInput): Promise<MapCalloutOffsetOverride> {
  await ensureSchema();
  const sql = getSql();
  const id = makeId(input.mapId, input.tag);
  const now = new Date().toISOString();
  const existing = await sql.query("SELECT data FROM map_callout_offsets WHERE id = $1", [id]);
  const createdAt = (existing[0]?.data as MapCalloutOffsetOverride | undefined)?.createdAt ?? now;

  const offset: MapCalloutOffsetOverride = {
    id,
    mapId: input.mapId,
    tag: input.tag.toUpperCase(),
    dx: input.dx,
    dy: input.dy,
    createdAt,
    updatedAt: now,
  };

  await sql.query(
    "INSERT INTO map_callout_offsets (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()",
    [id, JSON.stringify(offset)]
  );
  return offset;
}

export async function deleteMapCalloutOffset(id: string): Promise<void> {
  const sql = getSql();
  await sql.query("DELETE FROM map_callout_offsets WHERE id = $1", [id]);
}
