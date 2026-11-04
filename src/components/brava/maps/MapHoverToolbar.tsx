"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/brava/cn";

/**
 * The map's own chrome (area tabs, search/filters, action buttons) tucked
 * behind a hover-reveal panel so the map itself can fill the whole screen
 * by default — mirrors the always-on-screen "kiosk" pattern this page is
 * meant for. Hover opens it for a mouse; the handle also toggles on click/tap
 * so it's reachable on the tablets the field crew actually carries (a
 * touchscreen has no hover state at all, so a click fallback isn't optional).
 */
export default function MapHoverToolbar({ exitHref, children }: { exitHref: string; children: React.ReactNode }) {
  // Two separate flags rather than one toggled boolean: a mouse that
  // approaches the handle fires onMouseEnter (hovering it open) a beat
  // before any click lands, so a single "click toggles open" boolean would
  // immediately re-close itself on that same click. Hover only previews;
  // a click pins it open regardless of hover, which is also what a
  // touchscreen needs — it has no hover state to begin with.
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovering || pinned;

  return (
    <div
      className="absolute inset-x-0 top-0 z-40 flex flex-col items-center"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className={cn(
          "w-full overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
          open ? "max-h-[70vh] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col gap-3 bg-black/75 px-6 py-4 text-white shadow-brava-lg backdrop-blur-md sm:px-10">
          <Link
            href={exitHref}
            className="inline-flex w-fit items-center gap-1.5 rounded-brava-sm border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white/80 transition-colors hover:border-white/30 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Link>
          {children}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPinned((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Fechar menu do mapa" : "Abrir menu do mapa"}
        className="flex items-center gap-1.5 rounded-b-brava-sm border border-t-0 border-white/15 bg-black/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/80 shadow-brava-md backdrop-blur-sm transition-colors hover:text-white"
      >
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        Menu
      </button>
    </div>
  );
}
