/**
 * fetch with a hard timeout — on weak/flaky signal a request can hang
 * instead of failing outright, which would otherwise leave the Fiscal
 * staring at "Enviando..." forever. A timeout is treated the same as a
 * network error by callers: fall back to the offline queue.
 */
export async function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Fast, cheap pre-check — `navigator.onLine` can be a false positive (e.g. wifi with no internet) but a false negative (reporting offline while actually online) basically never happens, so it's safe to skip straight to queueing on it. */
export function isDefinitelyOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}
