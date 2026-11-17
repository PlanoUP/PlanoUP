"use client";

import { useEffect } from "react";
import { startOfflineSync } from "@/lib/brava/field/offlineSync";

/** Mounted once from the Campo layout — registers the Campo-scoped service worker (app shell cache for zero-signal opens) and arms the offline outbox's reconnect/visibility/periodic sync triggers. */
export default function OfflineServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw-campo.js", { scope: "/brava/campo/" }).catch(() => {
        // best-effort — without it Campo just behaves as before (no offline app-shell), the IndexedDB outbox still works
      });
    }
    startOfflineSync();
  }, []);

  return null;
}
