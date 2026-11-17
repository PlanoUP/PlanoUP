import {
  PendingAction,
  PendingDailyLogPayload,
  PendingFieldEntryPayload,
  PendingActionPlanPayload,
  listPendingActions,
  removePendingAction,
  markPendingActionFailed,
} from "./offlineQueue";
import { notifyActionPlansChanged } from "./actionPlanBus";
import { fetchWithTimeout, isDefinitelyOffline } from "./offlineFetch";

let flushing = false;
let started = false;

async function uploadPhoto(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetchWithTimeout("/api/field-entries/photos", { method: "POST", body: formData }, 20000);
    if (!res.ok) return null;
    const body = await res.json();
    return body.url ?? null;
  } catch {
    return null;
  }
}

async function replayFieldEntry(payload: PendingFieldEntryPayload): Promise<void> {
  const photos: string[] = [];
  for (const file of payload.photoFiles) {
    const url = await uploadPhoto(file);
    if (url) photos.push(url);
  }
  const res = await fetchWithTimeout("/api/field-entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tankId: payload.tankId,
      activityName: payload.activityName,
      observacao: payload.observacao,
      ocorrencia: payload.ocorrencia,
      photos,
    }),
  });
  if (!res.ok) throw new Error(`field-entry replay failed: ${res.status}`);
}

async function replayDailyLog(payload: PendingDailyLogPayload): Promise<void> {
  const res = await fetchWithTimeout("/api/field-daily-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`daily-log replay failed: ${res.status}`);
}

async function replayActionPlan(payload: PendingActionPlanPayload): Promise<void> {
  const res = await fetchWithTimeout("/api/action-plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`action-plan replay failed: ${res.status}`);
  notifyActionPlansChanged();
}

async function replay(action: PendingAction): Promise<void> {
  if (action.kind === "field-entry") return replayFieldEntry(action.payload as PendingFieldEntryPayload);
  if (action.kind === "daily-log") return replayDailyLog(action.payload as PendingDailyLogPayload);
  return replayActionPlan(action.payload as PendingActionPlanPayload);
}

/** Replays every queued action in order, oldest first. Leaves an item in the queue (marked "failed") if it still can't go through — never drops a registro silently. */
export async function flushOfflineQueue(): Promise<void> {
  if (flushing || isDefinitelyOffline()) return;
  flushing = true;
  try {
    const items = await listPendingActions();
    for (const item of items) {
      try {
        await replay(item);
        await removePendingAction(item.id);
      } catch (err) {
        await markPendingActionFailed(item.id, err instanceof Error ? err.message : "Falha ao enviar.");
      }
    }
  } finally {
    flushing = false;
  }
}

/** Call once (e.g. from the Campo layout) — wires reconnect/visibility/periodic triggers. Safe to call multiple times, only arms once. */
export function startOfflineSync(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  flushOfflineQueue();
  window.addEventListener("online", () => flushOfflineQueue());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") flushOfflineQueue();
  });
  window.setInterval(() => flushOfflineQueue(), 25000);
}
