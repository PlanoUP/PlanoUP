// Tiny in-memory pub/sub so ActionPlanBanner (polled on mount) refetches
// immediately after a create/resolve elsewhere on the page, without a
// websocket — same "good enough" realtime as the rest of this painel.
type Listener = () => void;
const listeners = new Set<Listener>();

export function notifyActionPlansChanged(): void {
  listeners.forEach((fn) => fn());
}

export function subscribeActionPlansChanged(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
