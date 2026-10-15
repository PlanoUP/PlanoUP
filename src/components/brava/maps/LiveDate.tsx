"use client";

import { useEffect, useState } from "react";

function formatToday(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

/**
 * Shows today's date, refreshed once it actually changes — not a ticking
 * clock. Checking once a minute is only to catch the date rolling over past
 * midnight on a screen left open; only ever mounted client-side (inside a
 * fullscreen-only branch), so no hydration mismatch risk.
 */
export default function LiveDate({ className }: { className?: string }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(formatToday(new Date()));
    const id = setInterval(() => setLabel(formatToday(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!label) return null;

  return <span className={className}>{label}</span>;
}
