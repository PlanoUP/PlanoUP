// "Plano de Ação" — a critical impediment a Fiscal flags against a tank from
// the field (e.g. an access blocker, a safety stop) that surfaces as a
// standing alert across the whole painel until an editor resolves it. Unlike
// FieldEntry (an append-only log), this has a lifecycle: open → resolved.

export interface ActionPlan {
  id: string;
  tankId: string;
  tankTag: string;
  description: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  resolvedByName: string | null;
}

export interface ActionPlanInput {
  tankId: string;
  tankTag: string;
  description: string;
}
