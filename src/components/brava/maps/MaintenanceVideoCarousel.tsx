"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, VideoOff, VolumeX } from "lucide-react";
import { cn } from "@/lib/brava/cn";

// Weekly video updates: each clip lives at a fixed path keyed only by TAG
// (public/videos/brava/tanques/<TAG>.mp4) — see the README in that folder.
// Replacing the file in place (same name) keeps the working tree and the
// deployed site from growing week over week; the repo's git HISTORY still
// keeps old blobs unless pruned separately, which is a different concern.
const VIDEO_DWELL_MS = 60_000; // ~1 min per clip, matching the real footage length
const MISSING_VIDEO_DWELL_MS = 6_000; // short dwell on a tag with no clip yet, so the carousel doesn't stall
const CLOSE_MS = 300; // the panel folding shut before the next tank's clip loads underneath
const OPEN_MS = 340; // unfurling back open once it has

function videoSrcForTag(tag: string): string {
  return `/videos/brava/tanques/${tag}.mp4`;
}

export default function MaintenanceVideoCarousel({ tags }: { tags: string[] }) {
  const [index, setIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  // Drives the whole panel's fold shut/open animation — true while the next
  // tank's clip is being swapped in underneath, hidden from view.
  const [collapsed, setCollapsed] = useState(true);
  const [missing, setMissing] = useState(false);
  const [clipProgress, setClipProgress] = useState(0);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Entrance: the panel mounts folded shut, then opens — so appearing in
  // fullscreen reads as "sliding in" rather than popping in abruptly.
  useEffect(() => {
    const t = setTimeout(() => setCollapsed(false), 20);
    return () => clearTimeout(t);
  }, []);

  // Keep the active index valid if the tag list changes size (map/area switch).
  useEffect(() => {
    if (index >= tags.length) {
      setIndex(0);
      setDisplayedIndex(0);
    }
  }, [tags.length, index]);

  // Kept separate from the transition timer on purpose: this one gets
  // reset every time `index` changes (see the effect below), and clearing
  // both together there used to cancel the reopen timer `goTo` had just
  // scheduled — the panel would fold shut and never come back.
  function clearAdvanceTimer() {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = null;
  }

  function clearTransitionTimer() {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = null;
  }

  // Fold the panel shut, swap the clip underneath while it's hidden, then
  // unfurl it back open on the next tank — a transition on the carousel
  // itself, not just a cut inside the video.
  function goTo(next: number) {
    if (tags.length === 0) return;
    const target = ((next % tags.length) + tags.length) % tags.length;
    if (target === index) return;
    setCollapsed(true);
    setIndex(target);
    clearTransitionTimer();
    transitionTimerRef.current = setTimeout(() => {
      setDisplayedIndex(target);
      setCollapsed(false);
    }, CLOSE_MS);
  }

  // Safety net: if a clip never fires onEnded (stalled load, longer/shorter
  // than expected runtime), still advance after the nominal clip length so
  // the carousel never gets stuck on one tank.
  useEffect(() => {
    clearAdvanceTimer();
    setMissing(false);
    if (tags.length === 0) return;
    advanceTimerRef.current = setTimeout(() => goTo(index + 1), VIDEO_DWELL_MS);
    return clearAdvanceTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, tags.length]);

  useEffect(() => {
    return () => {
      clearAdvanceTimer();
      clearTransitionTimer();
    };
  }, []);

  // Reset the clip progress bar whenever the displayed tank changes (the
  // <video> element itself remounts via key={tag}, but this is our own
  // piece of state and wouldn't otherwise reset).
  useEffect(() => {
    setClipProgress(0);
  }, [displayedIndex]);

  if (tags.length === 0) return null;
  const tag = tags[displayedIndex];
  if (!tag) return null;

  function handleTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
    const el = e.currentTarget;
    if (el.duration > 0) setClipProgress((el.currentTime / el.duration) * 100);
  }

  function handleEnded() {
    if (tags.length <= 1) return; // nothing else to advance to — let it loop in place
    goTo(index + 1);
  }

  function handleError() {
    setMissing(true);
    clearAdvanceTimer();
    advanceTimerRef.current = setTimeout(() => goTo(index + 1), MISSING_VIDEO_DWELL_MS);
  }

  return (
    <div
      className={cn(
        "absolute bottom-3 right-16 z-20 w-72 origin-bottom overflow-hidden rounded-brava-md border border-white/15 bg-black/70 shadow-brava-lg backdrop-blur-sm ease-in-out sm:w-80",
        collapsed ? "scale-x-90 scale-y-0 opacity-0" : "scale-x-100 scale-y-100 opacity-100"
      )}
      style={{ transitionProperty: "transform, opacity", transitionDuration: `${collapsed ? CLOSE_MS : OPEN_MS}ms` }}
    >
      <div key={tag} className="flex items-center justify-between gap-2 px-3 py-1.5 animate-video-caption-in">
        <span className="truncate font-mono text-[11px] font-bold text-white">{tag}</span>
        <span className="shrink-0 text-[10px] font-semibold text-white/60">
          {displayedIndex + 1}/{tags.length}
        </span>
      </div>

      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {missing ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-white/60 animate-video-fade-in">
            <VideoOff className="h-6 w-6" strokeWidth={1.5} />
            <p className="text-[10.5px] font-medium">Vídeo não disponível</p>
          </div>
        ) : (
          <>
            <video
              key={tag}
              src={videoSrcForTag(tag)}
              autoPlay
              muted
              loop={tags.length <= 1}
              playsInline
              onEnded={handleEnded}
              onError={handleError}
              onTimeUpdate={handleTimeUpdate}
              className="h-full w-full object-cover animate-video-fade-in"
            />
            <span
              title="Áudio desativado"
              className="pointer-events-none absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white/80"
            >
              <VolumeX className="h-3 w-3" strokeWidth={2} />
            </span>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
              <div
                className="h-full bg-brava-accent transition-[width] duration-150 ease-linear"
                style={{ width: `${Math.max(0, Math.min(100, clipProgress))}%` }}
              />
            </div>
          </>
        )}
      </div>

      {tags.length > 1 && (
        <div className="flex items-center justify-between px-1.5 py-1">
          <CarouselButton icon={ChevronLeft} label="Anterior" onClick={() => goTo(index - 1)} />
          <div className="flex gap-1">
            {tags.map((t, i) => (
              <span
                key={t}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-300",
                  i === displayedIndex ? "w-3.5 bg-white" : "bg-white/30"
                )}
              />
            ))}
          </div>
          <CarouselButton icon={ChevronRight} label="Próximo" onClick={() => goTo(index + 1)} />
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
      className="flex h-6 w-6 items-center justify-center rounded-brava-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
    </button>
  );
}
