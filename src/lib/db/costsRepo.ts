import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { CostEntry, CostEntryInput } from "../brava/costs/types";
import { SEED_COST_ENTRIES } from "../brava/costs/seed";

function genId(): string {
  return `cost-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Populates the CAPEX sheet once, the first time the table is empty — mirrors how the
 *  local-storage-only phase of this app shipped with seed data baked in, just moved
 *  server-side now that there's a real database. Safe to call on every list: no-ops once seeded. */
async function ensureSeeded(): Promise<void> {
  const sql = getSql();
  const [{ count }] = await sql.query("SELECT COUNT(*)::int AS count FROM cost_entries");
  if (count > 0) return;

  const now = new Date().toISOString();
  for (const input of SEED_COST_ENTRIES) {
    const entry: CostEntry = { ...input, id: genId(), createdAt: now, updatedAt: now };
    await sql.query("INSERT INTO cost_entries (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING", [
      entry.id,
      JSON.stringify(entry),
    ]);
  }
}

export async function listCosts(): Promise<CostEntry[]> {
  await ensureSchema();
  await ensureSeeded();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM cost_entries ORDER BY id");
  return rows.map((r: Record<string, unknown>) => r.data as CostEntry);
}

async function getCost(id: string): Promise<CostEntry | null> {
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM cost_entries WHERE id = $1", [id]);
  return rows[0]?.data ?? null;
}

async function saveCost(entry: CostEntry): Promise<void> {
  const sql = getSql();
  await sql.query(
    "INSERT INTO cost_entries (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()",
    [entry.id, JSON.stringify(entry)]
  );
}

export async function createCost(input: CostEntryInput): Promise<CostEntry> {
  await ensureSchema();
  const now = new Date().toISOString();
  const entry: CostEntry = { ...input, id: genId(), createdAt: now, updatedAt: now };
  await saveCost(entry);
  return entry;
}

export async function updateCost(id: string, patch: Partial<CostEntryInput>): Promise<CostEntry | null> {
  await ensureSchema();
  const entry = await getCost(id);
  if (!entry) return null;
  const updated: CostEntry = { ...entry, ...patch, updatedAt: new Date().toISOString() };
  await saveCost(updated);
  return updated;
}

export async function deleteCost(id: string): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql.query("DELETE FROM cost_entries WHERE id = $1", [id]);
}
