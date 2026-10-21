"use client";

import { usePathname } from "next/navigation";

// Map/dashboard routes are meant to run unattended on a TV for hours at a
// time (8h-22h, several days a week) with nobody editing anything there.
// Polling them every few seconds never lets the Neon compute endpoint go
// idle long enough to scale to zero, so it gets billed as continuously
// "awake" for the whole time the screen is on. Polling every 6 minutes
// leaves a gap past Neon's ~5 minute auto-suspend window, so the database
// can actually sleep between refreshes instead of running nonstop.
const DISPLAY_ROUTE_PREFIXES = ["/brava/mapa", "/brava/unidades/mapa"];
const DISPLAY_POLL_INTERVAL_MS = 360000;
const EDIT_POLL_INTERVAL_MS = 45000;

export function useBravaPollInterval(): number {
  const pathname = usePathname();
  const isDisplayRoute = DISPLAY_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`)
  );
  return isDisplayRoute ? DISPLAY_POLL_INTERVAL_MS : EDIT_POLL_INTERVAL_MS;
}
