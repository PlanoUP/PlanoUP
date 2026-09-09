import { getSql } from "./client";

async function ensureSettingsSchema(): Promise<void> {
  const sql = getSql();
  await sql.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

export async function getSetting(key: string): Promise<string | null> {
  await ensureSettingsSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT value FROM settings WHERE key = $1", [key]);
  return (rows[0]?.value as string | undefined) ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await ensureSettingsSchema();
  const sql = getSql();
  await sql.query(
    "INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, now()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now()",
    [key, value]
  );
}
