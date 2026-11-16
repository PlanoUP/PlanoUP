import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { ActionPlan } from "../brava/field/actionPlan";

function genId(): string {
  return `ap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listActionPlans(opts?: { onlyActive?: boolean }): Promise<ActionPlan[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = opts?.onlyActive
    ? await sql.query(
        "SELECT data FROM field_action_plans WHERE (data->>'resolved')::boolean = false ORDER BY data->>'createdAt' DESC"
      )
    : await sql.query("SELECT data FROM field_action_plans ORDER BY data->>'createdAt' DESC");
  return (rows as Record<string, unknown>[]).map((r) => r.data as ActionPlan);
}

export async function createActionPlan(input: {
  tankId: string;
  tankTag: string;
  description: string;
  createdByUserId: string;
  createdByName: string;
}): Promise<ActionPlan> {
  await ensureSchema();
  const now = new Date().toISOString();
  const plan: ActionPlan = {
    id: genId(),
    tankId: input.tankId,
    tankTag: input.tankTag,
    description: input.description.trim(),
    createdByUserId: input.createdByUserId,
    createdByName: input.createdByName,
    createdAt: now,
    resolved: false,
    resolvedAt: null,
    resolvedByName: null,
  };
  const sql = getSql();
  await sql.query("INSERT INTO field_action_plans (id, data) VALUES ($1, $2)", [plan.id, JSON.stringify(plan)]);
  return plan;
}

export async function resolveActionPlan(id: string, resolvedByName: string): Promise<ActionPlan | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM field_action_plans WHERE id = $1", [id]);
  const existing = rows[0]?.data as ActionPlan | undefined;
  if (!existing) return null;
  const updated: ActionPlan = {
    ...existing,
    resolved: true,
    resolvedAt: new Date().toISOString(),
    resolvedByName,
  };
  await sql.query("UPDATE field_action_plans SET data = $2, updated_at = now() WHERE id = $1", [id, JSON.stringify(updated)]);
  return updated;
}
