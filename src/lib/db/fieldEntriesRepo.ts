import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { FieldEntry } from "../brava/field/types";

function genId(): string {
  return `fe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listFieldEntries(tankId?: string): Promise<FieldEntry[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = tankId
    ? await sql.query("SELECT data FROM field_entries WHERE data->>'tankId' = $1 ORDER BY data->>'createdAt' DESC", [tankId])
    : await sql.query("SELECT data FROM field_entries ORDER BY data->>'createdAt' DESC");
  return (rows as Record<string, unknown>[]).map((r) => r.data as FieldEntry);
}

export async function createFieldEntry(entry: Omit<FieldEntry, "id" | "createdAt">): Promise<FieldEntry> {
  await ensureSchema();
  const full: FieldEntry = { ...entry, id: genId(), createdAt: new Date().toISOString() };
  const sql = getSql();
  await sql.query("INSERT INTO field_entries (id, data) VALUES ($1, $2)", [full.id, JSON.stringify(full)]);
  return full;
}
