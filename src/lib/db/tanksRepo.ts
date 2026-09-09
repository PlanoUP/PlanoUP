import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { Tank } from "../brava/types";
import { TANKS_SEED } from "../brava/data/tanks";
import { recalculateSchedule } from "../brava/schedule-engine";

/**
 * Inserts any TANKS_SEED tank whose id isn't in the table yet, and never
 * touches a row that already exists — so a first-ever run seeds the whole
 * fleet, a later code change that adds new tanks to TANKS_SEED picks those
 * up automatically, and no live edit a user already made is ever overwritten.
 * Skips the per-row upserts entirely once counts already match, since that's
 * the steady-state case hit on every poll.
 */
async function ensureSeeded(): Promise<void> {
  const sql = getSql();
  const rows = await sql.query("SELECT COUNT(*)::int AS count FROM tanks");
  if (rows[0].count >= TANKS_SEED.length) return;

  for (const tank of TANKS_SEED) {
    await sql.query("INSERT INTO tanks (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING", [
      tank.id,
      JSON.stringify(tank),
    ]);
  }
}

export async function listTanks(): Promise<Tank[]> {
  await ensureSchema();
  await ensureSeeded();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM tanks ORDER BY id");
  return rows.map((r: Record<string, unknown>) => r.data as Tank);
}

async function getTank(id: string): Promise<Tank | null> {
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM tanks WHERE id = $1", [id]);
  return rows[0]?.data ?? null;
}

async function saveTank(tank: Tank): Promise<void> {
  const sql = getSql();
  await sql.query("UPDATE tanks SET data = $2, updated_at = now() WHERE id = $1", [
    tank.id,
    JSON.stringify(tank),
  ]);
}

export async function updateTankMeta(
  tankId: string,
  patch: Partial<Pick<Tank, "status" | "notes" | "responsible">>
): Promise<Tank | null> {
  await ensureSchema();
  const tank = await getTank(tankId);
  if (!tank) return null;
  const updated: Tank = { ...tank, ...patch };
  await saveTank(updated);
  return updated;
}

interface ActivityEdit {
  plannedStart?: string;
  durationDays?: number;
  progress?: number;
  actualStart?: string;
  actualEnd?: string;
}

/** Mirrors the exact reducer logic the client used to run itself against localStorage. */
export async function updateTankActivity(
  tankId: string,
  activityId: string,
  edit: ActivityEdit
): Promise<Tank | null> {
  await ensureSchema();
  const tank = await getTank(tankId);
  if (!tank) return null;

  let activities = tank.activities;
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

  const updated: Tank = { ...tank, activities };
  await saveTank(updated);
  return updated;
}

export async function resetTanksToSeed(): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  for (const tank of TANKS_SEED) {
    await sql.query(
      "INSERT INTO tanks (id, data, updated_at) VALUES ($1, $2, now()) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()",
      [tank.id, JSON.stringify(tank)]
    );
  }
}
