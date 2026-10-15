import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { Equipment } from "../brava/units/types";
import { EQUIPMENT_SEED } from "../brava/units/data/equipment";
import { recalculateSchedule } from "../brava/units/schedule-engine";

/** Mirrors tanksRepo.ts's ensureSeeded() exactly, for the equipment table. */
async function ensureSeeded(): Promise<void> {
  const sql = getSql();
  const rows = await sql.query("SELECT COUNT(*)::int AS count FROM equipment");
  if (rows[0].count >= EQUIPMENT_SEED.length) return;

  for (const e of EQUIPMENT_SEED) {
    await sql.query("INSERT INTO equipment (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING", [
      e.id,
      JSON.stringify(e),
    ]);
  }
}

export async function listEquipment(): Promise<Equipment[]> {
  await ensureSchema();
  await ensureSeeded();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM equipment ORDER BY id");
  return rows.map((r: Record<string, unknown>) => r.data as Equipment);
}

async function getEquipment(id: string): Promise<Equipment | null> {
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM equipment WHERE id = $1", [id]);
  return rows[0]?.data ?? null;
}

async function saveEquipment(e: Equipment): Promise<void> {
  const sql = getSql();
  await sql.query("UPDATE equipment SET data = $2, updated_at = now() WHERE id = $1", [e.id, JSON.stringify(e)]);
}

export async function updateEquipmentMeta(
  equipmentId: string,
  patch: Partial<Pick<Equipment, "status" | "notes" | "responsible">>
): Promise<Equipment | null> {
  await ensureSchema();
  const e = await getEquipment(equipmentId);
  if (!e) return null;
  const updated: Equipment = { ...e, ...patch };
  await saveEquipment(updated);
  return updated;
}

interface ActivityEdit {
  plannedStart?: string;
  durationDays?: number;
  progress?: number;
  actualStart?: string;
  actualEnd?: string;
}

export async function updateEquipmentActivity(
  equipmentId: string,
  activityId: string,
  edit: ActivityEdit
): Promise<Equipment | null> {
  await ensureSchema();
  const e = await getEquipment(equipmentId);
  if (!e) return null;

  let activities = e.activities;
  if (edit.plannedStart !== undefined || edit.durationDays !== undefined) {
    activities = recalculateSchedule(activities, activityId, {
      plannedStart: edit.plannedStart,
      durationDays: edit.durationDays,
    });
  }
  if (edit.progress !== undefined || edit.actualStart !== undefined || edit.actualEnd !== undefined) {
    activities = activities.map((a) =>
      a.id === activityId
        ? {
            ...a,
            progress: edit.progress ?? a.progress,
            actualStart: edit.actualStart ?? a.actualStart,
            actualEnd: edit.actualEnd ?? a.actualEnd,
            status:
              (edit.progress ?? a.progress) >= 100 ? "CONCLUIDO" : a.status === "FUTURO" ? "ATUAL" : a.status,
          }
        : a
    );
  }

  const updated: Equipment = { ...e, activities };
  await saveEquipment(updated);
  return updated;
}

export async function resetEquipmentToSeed(): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  for (const e of EQUIPMENT_SEED) {
    await sql.query(
      "INSERT INTO equipment (id, data, updated_at) VALUES ($1, $2, now()) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()",
      [e.id, JSON.stringify(e)]
    );
  }
}
