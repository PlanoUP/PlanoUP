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

/**
 * One-time fill-in of "realizado" (actual spend) for the 2026 period, from
 * the "Relatório de Acompanhamento de Tanques" (rev. 13, corte 21/10/2026) —
 * the CAPEX sheet itself only ever had "orçado" (budget), realizado stayed
 * null until this real figure became available. Only touches an entry
 * still at null, so it's self-terminating (a later real edit, even to 0,
 * is never overwritten) and never touches any other period's entries.
 */
const OCT_2026_CAPEX_REALIZADO: { tag: string; period: CostEntry["period"]; realizado: number }[] = [
  { tag: "TQ-41005", period: "2026", realizado: 2.86 },
  { tag: "TQ-6313004", period: "2026", realizado: 0.38 },
  { tag: "TQ-1222-36", period: "2026", realizado: 0.68 },
  { tag: "TQ-1222-33", period: "2026", realizado: 2.59 },
  { tag: "TQ-1222-25", period: "2026", realizado: 0.74 },
];

async function reconcileOctober2026CapexRealizado(): Promise<void> {
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM cost_entries WHERE data->>'realizado' IS NULL");
  for (const row of rows as Record<string, unknown>[]) {
    const entry = row.data as CostEntry;
    const match = OCT_2026_CAPEX_REALIZADO.find((m) => m.tag === entry.tag && m.period === entry.period);
    if (!match) continue;
    await saveCost({ ...entry, realizado: match.realizado });
  }
}

export async function listCosts(): Promise<CostEntry[]> {
  await ensureSchema();
  await ensureSeeded();
  await reconcileOctober2026CapexRealizado();
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
