import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { MapCalloutOffsetOverride, MapCalloutOffsetOverrideInput } from "../brava/maps/types";

function makeId(mapId: string, tag: string): string {
  return `${mapId}:${tag.toUpperCase()}`;
}

// Backfill for rows saved before refWidth/refHeight existed — without a
// reference size, AssetMapExplorer can't rescale the offset for a different
// viewport (the bug the field was added to fix: a dragged callout losing
// track of its dot on a different monitor or window size), and permanently
// behaves as if scale were locked at 1. The real drag size was never
// recorded, so there's nothing to recover exactly; 1920x1080 — the most
// common desktop/monitor resolution — is used as a reasonable one-time
// reference so these already-placed callouts start tracking resizes
// correctly going forward instead of silently keeping the bug forever. A
// re-drag after this still overwrites it with the real size, same as usual.
const LEGACY_REF_WIDTH = 1920;
const LEGACY_REF_HEIGHT = 1080;

async function backfillLegacyRefSize(rows: MapCalloutOffsetOverride[]): Promise<MapCalloutOffsetOverride[]> {
  const sql = getSql();
  const result: MapCalloutOffsetOverride[] = [];
  for (const row of rows) {
    if (row.refWidth && row.refHeight) {
      result.push(row);
      continue;
    }
    const backfilled: MapCalloutOffsetOverride = { ...row, refWidth: LEGACY_REF_WIDTH, refHeight: LEGACY_REF_HEIGHT };
    await sql.query("UPDATE map_callout_offsets SET data = $2 WHERE id = $1", [row.id, JSON.stringify(backfilled)]);
    result.push(backfilled);
  }
  return result;
}

export async function listMapCalloutOffsets(): Promise<MapCalloutOffsetOverride[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM map_callout_offsets ORDER BY id");
  const offsets = rows.map((r: Record<string, unknown>) => r.data as MapCalloutOffsetOverride);
  return backfillLegacyRefSize(offsets);
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
    refWidth: input.refWidth,
    refHeight: input.refHeight,
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
