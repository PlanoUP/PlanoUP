import { dbAdd, dbGetAll, dbDelete, OUTBOX_STORE } from "./offlineDb";
import { FieldEntry } from "./types";

export type PendingKind = "field-entry" | "daily-log" | "action-plan";

export interface PendingFieldEntryPayload {
  tankId: string;
  ptNumero: string;
  ptHorario: string;
  activityName: string;
  observacao: string;
  ocorrencia: boolean;
  photoFiles: File[];
}

export interface PendingDailyLogPayload {
  tankId: string;
  date: string;
  petHorario1: string;
  petHorario2: string;
  efetivo: string;
}

export interface PendingActionPlanPayload {
  tankId: string;
  tankTag: string;
  description: string;
}

export interface PendingAction {
  id: string;
  kind: PendingKind;
  tankTag: string;
  createdAt: string;
  status: "pending" | "failed";
  lastError?: string;
  payload: PendingFieldEntryPayload | PendingDailyLogPayload | PendingActionPlanPayload;
}

function genId(): string {
  return `pend-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type Listener = () => void;
const listeners = new Set<Listener>();
function notify() {
  listeners.forEach((fn) => fn());
}
export function subscribeOfflineQueueChanged(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function enqueuePendingAction(
  kind: PendingKind,
  tankTag: string,
  payload: PendingAction["payload"]
): Promise<PendingAction> {
  const action: PendingAction = {
    id: genId(),
    kind,
    tankTag,
    createdAt: new Date().toISOString(),
    status: "pending",
    payload,
  };
  await dbAdd(OUTBOX_STORE, action);
  notify();
  return action;
}

export async function listPendingActions(): Promise<PendingAction[]> {
  const items = await dbGetAll<PendingAction>(OUTBOX_STORE);
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function listPendingActionsForTank(tankId: string): Promise<PendingAction[]> {
  const all = await listPendingActions();
  return all.filter((a) => "tankId" in a.payload && a.payload.tankId === tankId);
}

export async function removePendingAction(id: string): Promise<void> {
  await dbDelete(OUTBOX_STORE, id);
  notify();
}

export async function markPendingActionFailed(id: string, error: string): Promise<void> {
  const items = await listPendingActions();
  const item = items.find((a) => a.id === id);
  if (!item) return;
  await dbAdd(OUTBOX_STORE, { ...item, status: "failed", lastError: error });
  notify();
}

/** Renders a queued-but-unsent "field-entry" action as a FieldEntry for History — photos aren't shown (no URL yet), just marked pending. */
export function pendingFieldEntryToDisplay(action: PendingAction): FieldEntry | null {
  if (action.kind !== "field-entry") return null;
  const p = action.payload as PendingFieldEntryPayload;
  return {
    id: action.id,
    tankId: p.tankId,
    tankTag: action.tankTag,
    date: action.createdAt.slice(0, 10),
    ptNumero: p.ptNumero,
    ptHorario: p.ptHorario || null,
    activityName: p.activityName,
    userId: "local",
    userName: action.status === "failed" ? "Falhou ao enviar — vai tentar de novo" : "Aguardando envio",
    observacao: p.observacao,
    ocorrencia: p.ocorrencia,
    photos: [],
    createdAt: action.createdAt,
    pendingSync: true,
  };
}
