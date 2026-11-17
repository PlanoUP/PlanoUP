// Service worker scoped to /brava/campo/* only (registered with that scope
// from OfflineServiceWorkerRegistrar). Lets the Fiscal's section of the
// painel open even with zero signal, as long as it was opened at least once
// before with some connectivity. Never intercepts non-GET requests — writes
// go through the app's own IndexedDB outbox (src/lib/brava/field/offline*),
// not through this file, so multi-step flows (upload photo, then post the
// entry) stay simple to reason about instead of being replayed by the SW.

const CACHE_NAME = "brava-campo-v1";

const CACHEABLE_API_PATHS = ["/api/tanks", "/api/auth/status", "/api/field-auth/status", "/api/field-daily-log", "/api/field-entries", "/api/action-plans"];

function isCacheable(url) {
  if (url.pathname.startsWith("/brava/campo")) return true;
  if (url.pathname.startsWith("/_next/")) return true;
  if (CACHEABLE_API_PATHS.includes(url.pathname)) return true;
  return false;
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (!isCacheable(url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await cache.match(req);
        if (cached) return cached;
        throw err;
      }
    })
  );
});
