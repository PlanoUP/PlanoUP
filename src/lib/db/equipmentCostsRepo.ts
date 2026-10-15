import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { EquipmentCostEntry, EquipmentCostEntryInput } from "../brava/units/costs/types";

function genId(): string {
  return `eqcost-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listEquipmentCosts(): Promise<EquipmentCostEntry[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM equipment_cost_entries ORDER BY id");
  return rows.map((r: Record<string, unknown>) => r.data as EquipmentCostEntry);
}

async function getEquipmentCost(id: string): Promise<EquipmentCostEntry | null> {
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM equipment_cost_entries WHERE id = $1", [id]);
  return rows[0]?.data ?? null;
}

async function saveEquipmentCost(entry: EquipmentCostEntry): Promise<void> {
  const sql = getSql();
  await sql.query(
    "INSERT INTO equipment_cost_entries (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()",
    [entry.id, JSON.stringify(entry)]
  );
}

export async function createEquipmentCost(input: EquipmentCostEntryInput): Promise<EquipmentCostEntry> {
  await ensureSchema();
  const now = new Date().toISOString();
  const entry: EquipmentCostEntry = { ...input, id: genId(), createdAt: now, updatedAt: now };
  await saveEquipmentCost(entry);
  return entry;
}

export async function updateEquipmentCost(
  id: string,
  patch: Partial<EquipmentCostEntryInput>
): Promise<EquipmentCostEntry | null> {
  await ensureSchema();
  const entry = await getEquipmentCost(id);
  if (!entry) return null;
  const updated: EquipmentCostEntry = { ...entry, ...patch, updatedAt: new Date().toISOString() };
  await saveEquipmentCost(updated);
  return updated;
}

export async function deleteEquipmentCost(id: string): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql.query("DELETE FROM equipment_cost_entries WHERE id = $1", [id]);
}
