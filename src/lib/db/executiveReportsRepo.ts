import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { ExecutiveReportDraftInput, ExecutiveReportSnapshot, ReportScope } from "../brava/reports/types";

function makeId(scope: ReportScope, weekStartISO: string): string {
  return `${scope}:${weekStartISO}`;
}

export async function listReports(scope?: ReportScope): Promise<ExecutiveReportSnapshot[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = scope
    ? await sql.query("SELECT data FROM executive_reports WHERE data->>'scope' = $1 ORDER BY id DESC", [scope])
    : await sql.query("SELECT data FROM executive_reports ORDER BY id DESC");
  return rows.map((r: Record<string, unknown>) => r.data as ExecutiveReportSnapshot);
}

export async function getReport(id: string): Promise<ExecutiveReportSnapshot | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM executive_reports WHERE id = $1", [id]);
  return (rows[0]?.data as ExecutiveReportSnapshot) ?? null;
}

/**
 * Creates or updates a DRAFT's narrative fields only (id derives from
 * scope+week). The computed fields (kpis, physicalProgress, financial,
 * tankMatrix, milestones) are deliberately NOT written here — a draft is
 * always served with those freshly computed from live tank/cost data by
 * the API route, never trusted from what's at rest. Refuses to touch a
 * report that's already closed, so an accidental draft save can never
 * silently overwrite a frozen week's historical record.
 */
export async function upsertDraft(input: ExecutiveReportDraftInput): Promise<ExecutiveReportSnapshot> {
  await ensureSchema();
  const id = makeId(input.scope, input.weekStartISO);
  const existing = await getReport(id);
  if (existing?.closedAt) {
    throw new Error("REPORT_ALREADY_CLOSED");
  }

  const now = new Date().toISOString();
  const snapshot: ExecutiveReportSnapshot = {
    id,
    scope: input.scope,
    weekStartISO: input.weekStartISO,
    cutoffDateISO: input.cutoffDateISO,
    closedAt: null,
    kpis: existing?.kpis ?? { total: 0, emManutencao: 0, programados: 0, concluidos: 0, atencaoOuCritico: 0, inspecoesVencidas: 0 },
    physicalProgress: existing?.physicalProgress ?? { previsto: 0, realizado: 0, desvioPP: 0, deltaSemanaAnterior: null },
    financial: existing?.financial ?? { hasData: false, orcado: 0, realizado: 0, saldo: 0, tanksWithData: 0, tanksInScope: 0, lines: [] },
    tankMatrix: existing?.tankMatrix ?? [],
    milestones: existing?.milestones ?? [],
    avancosSemana: input.avancosSemana,
    riscos: input.riscos,
    decisoes: input.decisoes,
    criticalPoints: input.criticalPoints,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const sql = getSql();
  await sql.query(
    "INSERT INTO executive_reports (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()",
    [id, JSON.stringify(snapshot)]
  );
  return snapshot;
}

/**
 * Freezes a report: the caller (the API route) computes the full snapshot
 * from live data at this exact moment and passes it whole — this function
 * just enforces that a closed report can never be closed again or
 * overwritten, which is what makes a closed week an actual historical
 * record instead of just another draft.
 */
export async function closeReport(snapshot: ExecutiveReportSnapshot): Promise<ExecutiveReportSnapshot> {
  await ensureSchema();
  const existing = await getReport(snapshot.id);
  if (existing?.closedAt) {
    throw new Error("REPORT_ALREADY_CLOSED");
  }

  const now = new Date().toISOString();
  const closed: ExecutiveReportSnapshot = { ...snapshot, closedAt: now, updatedAt: now };
  const sql = getSql();
  await sql.query(
    "INSERT INTO executive_reports (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()",
    [closed.id, JSON.stringify(closed)]
  );
  return closed;
}
