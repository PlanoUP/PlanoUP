"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play, X, Maximize } from "lucide-react";
import AssetMapExplorer from "@/components/brava/maps/AssetMapExplorer";
import AttentionPanel from "@/components/brava/AttentionPanel";
import DeadlinesPanel from "@/components/brava/DeadlinesPanel";
import PresentationSummarySlide from "@/components/brava/PresentationSummarySlide";
import LiveClock from "@/components/brava/maps/LiveClock";
import LiveDate from "@/components/brava/maps/LiveDate";
import { cn } from "@/lib/brava/cn";

const SLIDES = [
  { key: "resumo", label: "Resumo" },
  { key: "mapa", label: "Mapa" },
  { key: "atencao", label: "Atenção" },
  { key: "vencimentos", label: "Vencimentos" },
] as const;

const SLIDE_DWELL_MS = 30_000;

/**
 * A fixed, full-viewport overlay rather than relying on the real Fullscreen
 * API by default — /brava/layout.tsx always renders the Sidebar/MobileTopBar
 * around any page's children, and a nested layout can't remove an ancestor
 * layout's own markup. Covering it with position:fixed is what actually
 * takes over the screen the moment this page opens; the "Tela cheia" button
 * below is an extra, for also hiding the browser's own chrome on a TV.
 */
export default function ApresentacaoPage() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  function goTo(i: number) {
    setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }

  useEffect(() => {
    clearTimer();
    if (!playing) return;
    timerRef.current = setTimeout(() => goTo(index + 1), SLIDE_DWELL_MS);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing]);

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  }

  const Slide = SLIDES[index];

  return (
    <div ref={containerRef} className="brava-tv fixed inset-0 z-[100] flex flex-col font-brava">
      <header className="flex items-center justify-between border-b border-brava-border px-6 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-brava-sm bg-brava-accent">
            <span className="font-mono text-[15px] font-extrabold leading-none text-brava-blue-dark">B</span>
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-extrabold tracking-tight text-brava-blue-dark">BRAVA ENERGIA</p>
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-brava-text-secondary">
              Shutdown Control — Apresentação
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LiveDate className="hidden text-[11px] font-semibold uppercase tracking-wide text-brava-text-secondary sm:inline" />
          <LiveClock className="font-mono text-[13px] font-bold tabular-nums text-brava-accent" />
          <Link
            href="/brava"
            aria-label="Fechar apresentação"
            className="rounded-brava-sm border border-brava-border p-1.5 text-brava-text-secondary transition-colors hover:border-brava-blue/40 hover:text-brava-blue-dark"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <nav className="flex items-center justify-center gap-2 border-b border-brava-border px-6 py-2.5 sm:px-10">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => goTo(i)}
            className={cn(
              "rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors",
              i === index
                ? "bg-brava-accent text-brava-blue-dark"
                : "text-brava-text-secondary hover:text-brava-blue-dark"
            )}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-10 sm:py-8">
        {Slide.key === "resumo" && <PresentationSummarySlide />}
        {Slide.key === "mapa" && <AssetMapExplorer autoStartTour />}
        {Slide.key === "atencao" && <AttentionPanel />}
        {Slide.key === "vencimentos" && <DeadlinesPanel limit={14} />}
      </main>

      <div className="flex items-center justify-center gap-3 border-t border-brava-border px-6 py-3 sm:px-10">
        <NavButton icon={ChevronLeft} label="Anterior" onClick={() => goTo(index - 1)} />
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          aria-label={playing ? "Pausar" : "Retomar"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-brava-border text-brava-text-secondary transition-colors hover:border-brava-blue/40 hover:text-brava-blue-dark"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <NavButton icon={ChevronRight} label="Próximo" onClick={() => goTo(index + 1)} />
        <button
          type="button"
          onClick={toggleFullscreen}
          className="ml-4 inline-flex items-center gap-1.5 rounded-brava-sm border border-brava-border px-3 py-1.5 text-[11px] font-semibold text-brava-text-secondary transition-colors hover:border-brava-blue/40 hover:text-brava-blue-dark"
        >
          <Maximize className="h-3.5 w-3.5" />
          Tela cheia
        </button>
      </div>
    </div>
  );
}

function NavButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof ChevronLeft;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-brava-border text-brava-text-secondary transition-colors hover:border-brava-blue/40 hover:text-brava-blue-dark"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
