import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { FieldDailyLog } from "../brava/field/types";

function logId(tankId: string, date: string): string {
  return `${tankId}__${date}`;
}

export async function getFieldDailyLog(tankId: string, date: string): Promise<FieldDailyLog | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM field_daily_logs WHERE id = $1", [logId(tankId, date)]);
  return (rows[0]?.data as FieldDailyLog | undefined) ?? null;
}

export interface FieldDailyLogUpsertInput {
  tankId: string;
  tankTag: string;
  date: string;
  /** Any of these left undefined keeps the existing saved value — a true partial update, not a full overwrite. */
  petHorario1?: string | null;
  petHorario2?: string | null;
  efetivo?: string;
}

/** Upsert — PET horário and efetivo are edited in place throughout the day, not appended. */
export async function upsertFieldDailyLog(
  input: FieldDailyLogUpsertInput,
  updatedByName: string
): Promise<FieldDailyLog> {
  await ensureSchema();
  const existing = await getFieldDailyLog(input.tankId, input.date);
  const log: FieldDailyLog = {
    id: logId(input.tankId, input.date),
    tankId: input.tankId,
    tankTag: input.tankTag,
    date: input.date,
    petHorario1: input.petHorario1 ?? existing?.petHorario1 ?? null,
    petHorario2: input.petHorario2 ?? existing?.petHorario2 ?? null,
    efetivo: input.efetivo ?? existing?.efetivo ?? "",
    updatedAt: new Date().toISOString(),
    updatedByName,
  };
  const sql = getSql();
  await sql.query(
    "INSERT INTO field_daily_logs (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()",
    [log.id, JSON.stringify(log)]
  );
  return log;
}
