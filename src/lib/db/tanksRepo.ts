import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { Activity, Tank } from "../brava/types";
import { TANKS_SEED } from "../brava/data/tanks";
import { recalculateSchedule, deriveActivityStatus, deriveTankStatus } from "../brava/schedule-engine";
import { todayISO } from "../brava/date-utils";

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

const PLACEHOLDER = "A definir";

/**
 * Fills in real area/product/tankType for tanks that were seeded before that
 * data was known (buildNoProject defaults to "A definir"), and promotes a
 * tank out of "Sem Projeto" once TANKS_SEED gives it a real maintenance
 * project (launched via a code update, same as every other seed change).
 *
 * Both only touch a row still at its original placeholder baseline — a real
 * value set later (seed update or live edit) is never overwritten — and are
 * self-terminating: once promoted/filled in, the row no longer matches and
 * this never fires for it again. A promoted tank has no activities or
 * progress of its own yet to lose, so adopting the seed's record wholesale
 * (keeping only its own notes, in case someone already added any) is safe.
 */
async function reconcilePlaceholderMetadata(): Promise<void> {
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM tanks");
  const seedById = new Map(TANKS_SEED.map((t) => [t.id, t]));
  for (const row of rows as Record<string, unknown>[]) {
    const tank = row.data as Tank;
    const seed = seedById.get(tank.id);
    if (!seed) continue;

    if (tank.status === "SEM_PROJETO" && seed.status !== "SEM_PROJETO") {
      await saveTank({ ...seed, notes: tank.notes ?? seed.notes });
      continue;
    }

    // A tank the seed backfilled into the historical "concluded campaign"
    // after it was first seeded at the (now stale) "Programado" baseline —
    // e.g. TQ-41005, whose activities already carry real per-stage progress
    // and completion dates, just under the wrong top-level status. Only the
    // status field is corrected; activities are left alone since they're
    // already accurate.
    if (tank.status === "PROGRAMADO" && seed.status === "CONCLUIDO") {
      await saveTank({ ...tank, status: "CONCLUIDO" });
      continue;
    }

    const patch: Partial<Pick<Tank, "area" | "product" | "tankType">> = {};
    if (tank.area === PLACEHOLDER && seed.area !== PLACEHOLDER) patch.area = seed.area;
    if (tank.product === PLACEHOLDER && seed.product !== PLACEHOLDER) patch.product = seed.product;
    if (tank.tankType === PLACEHOLDER && seed.tankType !== PLACEHOLDER) patch.tankType = seed.tankType;
    if (Object.keys(patch).length > 0) {
      await saveTank({ ...tank, ...patch });
    }
  }
}

export async function listTanks(): Promise<Tank[]> {
  await ensureSchema();
  await ensureSeeded();
  await reconcilePlaceholderMetadata();
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

/**
 * A `status` in the patch is a request, not a direct write: it's run
 * through deriveTankStatus (CRITICO/SEM_PROJETO excepted, see there) so it
 * can't end up contradicting what the activities actually say — e.g.
 * picking CONCLUIDO here only sticks if every activity really is, which is
 * also what makes this call idempotent-safe against a stale/delayed
 * duplicate landing after a later edit (resetTankExecution, another
 * activity edit) already moved the tank on: it reconciles instead of
 * blindly clobbering whatever's there.
 */
export async function updateTankMeta(
  tankId: string,
  patch: Partial<Pick<Tank, "status" | "notes" | "responsible">>
): Promise<Tank | null> {
  await ensureSchema();
  const tank = await getTank(tankId);
  if (!tank) return null;
  const status = patch.status !== undefined ? deriveTankStatus(tank.activities, patch.status, todayISO()) : tank.status;
  const updated: Tank = { ...tank, ...patch, status };
  await saveTank(updated);
  return updated;
}

interface ActivityEdit {
  plannedStart?: string;
  durationDays?: number;
  progress?: number;
  /** An empty string explicitly clears the field — omitting it leaves the stored value untouched. */
  actualStart?: string;
  actualEnd?: string;
}

/**
 * Mirrors the exact reducer logic the client used to run itself against
 * localStorage, plus a final pass that re-derives every activity's status
 * (and the tank's own) from the resulting dates/progress — see
 * deriveActivityStatus/deriveTankStatus. Runs on every edit, not just ones
 * that touch progress/actual dates, because shifting an upstream activity's
 * planned dates (recalculateSchedule) can push a downstream one's planned
 * end across "today", flipping it between ATUAL and ATRASADO.
 */
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
            actualStart: edit.actualStart !== undefined ? edit.actualStart || undefined : a.actualStart,
            actualEnd: edit.actualEnd !== undefined ? edit.actualEnd || undefined : a.actualEnd,
          }
        : a
    );
  }

  const today = todayISO();
  activities = activities.map((a) => ({ ...a, status: deriveActivityStatus(a, today) }));
  const status = deriveTankStatus(activities, tank.status, today);

  const updated: Tank = { ...tank, status, activities };
  await saveTank(updated);
  return updated;
}

/**
 * Clears every activity's real-execution data (dates + progress) back to a
 * clean not-yet-started state, re-captures baseline from the CURRENT
 * planned dates, then re-derives status from scratch — the one-click fix
 * for a tank whose plan was edited into a new window while its old
 * execution data (a leftover CONCLUIDO/real dates from a previous cycle)
 * was left behind.
 *
 * Re-capturing baseline matters just as much as clearing the real dates:
 * baseline is normally never touched after it's first set (it's the fixed
 * reference deviation is measured against), but a tank being redone years
 * later for a genuinely new cycle needs a new reference too — otherwise
 * "Desvio" keeps comparing the new plan against the OLD cycle's baseline
 * (a multi-year gap that reads as a wild deviation), and the Gantt's time
 * axis has to stretch to cover both, cramming years of month labels into a
 * fixed-width chart until they're unreadable.
 */
export async function resetTankExecution(tankId: string): Promise<Tank | null> {
  await ensureSchema();
  const tank = await getTank(tankId);
  if (!tank) return null;

  const today = todayISO();
  const activities = tank.activities.map((a) => {
    const reset: Activity = {
      ...a,
      progress: 0,
      actualStart: undefined,
      actualEnd: undefined,
      baselineStart: a.plannedStart,
      baselineEnd: a.plannedEnd,
    };
    return { ...reset, status: deriveActivityStatus(reset, today) };
  });
  const status = deriveTankStatus(activities, tank.status, today);

  const updated: Tank = { ...tank, status, activities };
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
