import { createHash } from "crypto";
import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { FieldUser } from "../brava/field/types";

function genId(): string {
  return `fu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function hashFieldPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

async function saveFieldUser(user: FieldUser): Promise<void> {
  const sql = getSql();
  await sql.query(
    "INSERT INTO field_users (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()",
    [user.id, JSON.stringify(user)]
  );
}

export async function listFieldUsers(): Promise<FieldUser[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM field_users ORDER BY data->>'name'");
  return (rows as Record<string, unknown>[]).map((r) => r.data as FieldUser);
}

export async function getFieldUser(id: string): Promise<FieldUser | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM field_users WHERE id = $1", [id]);
  return (rows[0]?.data as FieldUser | undefined) ?? null;
}

export async function getFieldUserByUsername(username: string): Promise<FieldUser | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM field_users WHERE lower(data->>'username') = lower($1)", [username]);
  return (rows[0]?.data as FieldUser | undefined) ?? null;
}

/** Throws USERNAME_TAKEN if another field user already has this username (case-insensitive). */
export async function createFieldUser(input: { name: string; username: string; password: string }): Promise<FieldUser> {
  const existing = await getFieldUserByUsername(input.username);
  if (existing) throw new Error("USERNAME_TAKEN");

  const now = new Date().toISOString();
  const user: FieldUser = {
    id: genId(),
    name: input.name.trim(),
    username: input.username.trim().toLowerCase(),
    passwordHash: hashFieldPassword(input.password),
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  await saveFieldUser(user);
  return user;
}

export async function setFieldUserActive(id: string, active: boolean): Promise<FieldUser | null> {
  const user = await getFieldUser(id);
  if (!user) return null;
  const updated: FieldUser = { ...user, active, updatedAt: new Date().toISOString() };
  await saveFieldUser(updated);
  return updated;
}

export async function setFieldUserPassword(id: string, newPassword: string): Promise<FieldUser | null> {
  const user = await getFieldUser(id);
  if (!user) return null;
  const updated: FieldUser = { ...user, passwordHash: hashFieldPassword(newPassword), updatedAt: new Date().toISOString() };
  await saveFieldUser(updated);
  return updated;
}
