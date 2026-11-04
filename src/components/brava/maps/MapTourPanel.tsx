"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play, ImageOff, ArrowUpRight, CalendarRange } from "lucide-react";
import { TankWithDerived } from "@/lib/brava/types";
import { STATUS_META } from "@/lib/brava/status-meta";
import { getTankTourPhotoSrc } from "@/lib/brava/photos";
import { cn } from "@/lib/brava/cn";

// Driven by AssetMapExplorer's own tourIndex — this component only renders
// whatever tank is current and reports when it's done sitting on it; it
// doesn't own the index or the map zoom, so the two always stay in lockstep.
const VIDEO_DWELL_MS = 60_000; // ~1 min, matching the real footage length
const PHOTO_DWELL_MS = 8_000; // a still photo doesn't need a full minute
const NO_MEDIA_DWELL_MS = 6_000; // short, so the tour doesn't stall on a tank with nothing yet
const CLOSE_MS = 300;
const OPEN_MS = 340;

function videoSrcForTag(tag: string): string {
  return `/videos/brava/tanques/${tag}.mp4`;
}

type MediaState = "video" | "photo" | "none";

export default function MapTourPanel({
  tags,
  activeIndex,
  tanksByTag,
  playing,
  onAdvance,
  onPrev,
  onNext,
  onTogglePlay,
}: {
  tags: string[];
  activeIndex: number;
  tanksByTag: Map<string, TankWithDerived>;
  /** Whether it's auto-cycling to the next tank on its own, or paused sitting on the current one. */
  playing: boolean;
  /** Called once the current tank has had its turn (clip ended, dwell elapsed) — advance the shared index. */
  onAdvance: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
}) {
  const [displayedIndex, setDisplayedIndex] = useState(activeIndex);
  const [collapsed, setCollapsed] = useState(true);
  const [media, setMedia] = useState<MediaState>("video");
  const [clipProgress, setClipProgress] = useState(0);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setCollapsed(false), 20);
    return () => clearTimeout(t);
  }, []);

  function clearDwellTimer() {
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    dwellTimerRef.current = null;
  }

  function clearTransitionTimer() {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = null;
  }

  // Fold shut, swap the displayed tank underneath while hidden, unfurl back
  // open — a transition on the panel itself, not just a cut inside the media.
  useEffect(() => {
    if (activeIndex === displayedIndex) return;
    setCollapsed(true);
    clearTransitionTimer();
    transitionTimerRef.current = setTimeout(() => {
      setDisplayedIndex(activeIndex);
      setMedia("video");
      setCollapsed(false);
    }, CLOSE_MS);
    return clearTransitionTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // Safety net: whatever's showing (video, photo, or nothing) still advances
  // on its own nominal dwell even if a media event never fires — but only
  // while actually playing; paused just sits on the current tank.
  useEffect(() => {
    clearDwellTimer();
    if (!playing || tags.length === 0) return;
    const dwell = media === "video" ? VIDEO_DWELL_MS : media === "photo" ? PHOTO_DWELL_MS : NO_MEDIA_DWELL_MS;
    dwellTimerRef.current = setTimeout(onAdvance, dwell);
    return clearDwellTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedIndex, media, tags.length, playing]);

  useEffect(() => () => {
    clearDwellTimer();
    clearTransitionTimer();
  }, []);

  useEffect(() => {
    setClipProgress(0);
  }, [displayedIndex, media]);

  if (tags.length === 0) return null;
  const tag = tags[displayedIndex];
  if (!tag) return null;
  const tank = tanksByTag.get(tag) ?? null;
  const statusMeta = tank ? STATUS_META[tank.status] : null;

  function handleTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
    const el = e.currentTarget;
    if (el.duration > 0) setClipProgress((el.currentTime / el.duration) * 100);
  }

  function handleVideoEnded() {
    if (!playing || tags.length <= 1) return; // paused, or nothing else to cycle to — let it loop in place
    onAdvance();
  }

  function handleVideoError() {
    setMedia("photo");
  }

  function handlePhotoError() {
    setMedia("none");
  }

  return (
    <div
      className={cn(
        "absolute bottom-3 right-16 z-20 w-80 origin-bottom overflow-hidden rounded-brava-md border border-brava-border bg-brava-white shadow-brava-lg ease-in-out sm:w-96",
        collapsed ? "scale-x-90 scale-y-0 opacity-0" : "scale-x-100 scale-y-100 opacity-100"
      )}
      style={{ transitionProperty: "transform, opacity", transitionDuration: `${collapsed ? CLOSE_MS : OPEN_MS}ms` }}
    >
      <div key={tag} className="flex items-center justify-between gap-2 border-b border-brava-border px-3 py-2 animate-video-caption-in">
        <span className="truncate font-mono text-[12px] font-bold text-brava-blue-dark">{tag}</span>
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[10.5px] font-semibold text-brava-text-secondary">
            {displayedIndex + 1}/{tags.length}
          </span>
          <button
            type="button"
            onClick={onTogglePlay}
            title={playing ? "Pausar apresentação" : "Retomar apresentação"}
            aria-label={playing ? "Pausar apresentação" : "Retomar apresentação"}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-brava-sm text-brava-text-secondary transition-colors hover:bg-brava-bg hover:text-brava-blue"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {media === "none" ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/70 animate-video-fade-in">
            {statusMeta ? (
              <>
                <span className={cn("h-2.5 w-2.5 rounded-full", statusMeta.dotClass)} />
                <p className="text-[11px] font-semibold text-white">{statusMeta.label}</p>
                {tank && (
                  <p className="font-mono text-[18px] font-extrabold text-white">{tank.derived.progress}%</p>
                )}
              </>
            ) : (
              <>
                <ImageOff className="h-6 w-6" strokeWidth={1.5} />
                <p className="text-[10.5px] font-medium">Sem mídia disponível</p>
              </>
            )}
          </div>
        ) : media === "photo" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={tag}
            src={getTankTourPhotoSrc(tag)}
            alt={tag}
            onError={handlePhotoError}
            className="h-full w-full object-cover animate-video-fade-in"
          />
        ) : (
          <>
            <video
              key={tag}
              src={videoSrcForTag(tag)}
              autoPlay
              muted
              loop={tags.length <= 1 || !playing}
              playsInline
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              onTimeUpdate={handleTimeUpdate}
              className="h-full w-full object-cover animate-video-fade-in"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
              <div
                className="h-full bg-brava-accent transition-[width] duration-150 ease-linear"
                style={{ width: `${Math.max(0, Math.min(100, clipProgress))}%` }}
              />
            </div>
          </>
        )}
      </div>

      {tags.length > 1 && (
        <div className="flex items-center justify-between border-b border-brava-border px-1.5 py-1">
          <CarouselButton icon={ChevronLeft} label="Anterior" onClick={onPrev} />
          <div className="flex gap-1">
            {tags.map((t, i) => (
              <span
                key={t}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-300",
                  i === displayedIndex ? "w-3.5 bg-brava-blue" : "bg-brava-border"
                )}
              />
            ))}
          </div>
          <CarouselButton icon={ChevronRight} label="Próximo" onClick={onNext} />
        </div>
      )}

      {tank && (
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-brava-text">
              {statusMeta && <span className={cn("h-1.5 w-1.5 rounded-full", statusMeta.dotClass)} />}
              {statusMeta?.label ?? tank.status}
            </span>
            <span className="font-mono text-[14px] font-extrabold text-brava-blue-dark">{tank.derived.progress}%</span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <Link
              href={`/brava/tanques/${encodeURIComponent(tag)}`}
              className="flex items-center justify-center gap-1 rounded-brava-sm bg-brava-blue px-2 py-1.5 text-[11.5px] font-semibold text-brava-white transition-colors hover:bg-brava-blue-dark"
            >
              Ver mais detalhes
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Link
              href={`/brava/tanques/${encodeURIComponent(tag)}?tab=PLANEJAMENTO`}
              className="flex items-center justify-center gap-1 rounded-brava-sm border border-brava-border px-2 py-1.5 text-[11.5px] font-semibold text-brava-text-secondary transition-colors hover:border-brava-blue/30 hover:text-brava-blue-dark"
            >
              <CalendarRange className="h-3 w-3" />
              Ver cronograma
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CarouselButton({
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
      title={label}
      aria-label={label}
      className="flex h-6 w-6 items-center justify-center rounded-brava-sm text-brava-text-secondary transition-colors hover:bg-brava-bg hover:text-brava-blue"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
    </button>
  );
}
