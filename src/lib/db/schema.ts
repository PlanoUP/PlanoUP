import { getSql } from "./client";

const TABLES = [
  "tanks",
  "materials",
  "cost_entries",
  "map_coordinates",
  "map_callout_offsets",
  "equipment",
  "equipment_materials",
  "equipment_cost_entries",
  "equipment_map_coordinates",
];

/** Postgres error codes that mean "the table exists now" — the exact outcome CREATE TABLE IF NOT EXISTS was asked for. */
const BENIGN_RACE_CODES = new Set([
  "42P07", // duplicate_table
  "23505", // unique_violation — IF NOT EXISTS isn't atomic: two concurrent
  //           CREATE TABLEs for a brand-new table can both pass the
  //           existence check and then race on pg_type's catalog index.
]);

/**
 * Each domain object (Tank, Material) is stored as a single JSONB row keyed
 * by its own id — the exact same shape already used in memory (and, until
 * this migration, in localStorage). This keeps every existing pure function
 * (schedule-engine, materials/calculations, etc.) working unchanged: the
 * only thing that moved is WHERE the object lives between reads/writes.
 *
 * CREATE TABLE IF NOT EXISTS is cheap and idempotent, so calling this at the
 * top of every API route is safe — there is no separate migration step to
 * remember to run. Each statement tolerates the benign race above, which is
 * otherwise most likely to surface right after a deploy adds a brand-new
 * table and several polling clients hit it in the same instant.
 */
export async function ensureSchema(): Promise<void> {
  const sql = getSql();
  for (const table of TABLES) {
    try {
      await sql.query(`
        CREATE TABLE IF NOT EXISTS ${table} (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      if (!code || !BENIGN_RACE_CODES.has(code)) throw err;
    }
  }
}
