import { getSql } from "./client";

/**
 * Each domain object (Tank, Material) is stored as a single JSONB row keyed
 * by its own id — the exact same shape already used in memory (and, until
 * this migration, in localStorage). This keeps every existing pure function
 * (schedule-engine, materials/calculations, etc.) working unchanged: the
 * only thing that moved is WHERE the object lives between reads/writes.
 *
 * CREATE TABLE IF NOT EXISTS is cheap and idempotent, so calling this at the
 * top of every API route is safe — there is no separate migration step to
 * remember to run.
 */
export async function ensureSchema(): Promise<void> {
  const sql = getSql();
  await sql.query(`
    CREATE TABLE IF NOT EXISTS tanks (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await sql.query(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}
