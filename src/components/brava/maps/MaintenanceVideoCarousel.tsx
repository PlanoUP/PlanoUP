"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, VideoOff } from "lucide-react";
import { cn } from "@/lib/brava/cn";

// Weekly video updates: each clip lives at a fixed path keyed only by TAG
// (public/videos/brava/tanques/<TAG>.mp4) — see the README in that folder.
// Replacing the file in place (same name) keeps the working tree and the
// deployed site from growing week over week; the repo's git HISTORY still
// keeps old blobs unless pruned separately, which is a different concern.
const VIDEO_DWELL_MS = 60_000; // ~1 min per clip, matching the real footage length
const MISSING_VIDEO_DWELL_MS = 6_000; // short dwell on a tag with no clip yet, so the carousel doesn't stall
const TRANSITION_MS = 350; // fade-to-black dip between two tanks' clips

function videoSrcForTag(tag: string): string {
  return `/videos/brava/tanques/${tag}.mp4`;
}

export default function MaintenanceVideoCarousel({ tags }: { tags: string[] }) {
  const [index, setIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [missing, setMissing] = useState(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the active index valid if the tag list changes size (map/area switch).
  useEffect(() => {
    if (index >= tags.length) {
      setIndex(0);
      setDisplayedIndex(0);
    }
  }, [tags.length, index]);

  function clearTimers() {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    advanceTimerRef.current = null;
    transitionTimerRef.current = null;
  }

  // Dip to black, swap the clip underneath while hidden, then fade back in —
  // a clean transition regardless of the two clips' actual content/timing.
  function goTo(next: number) {
    if (tags.length === 0) return;
    const target = ((next % tags.length) + tags.length) % tags.length;
    if (target === index) return;
    setTransitioning(true);
    setIndex(target);
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setDisplayedIndex(target);
      setTransitioning(false);
    }, TRANSITION_MS);
  }

  // Safety net: if a clip never fires onEnded (stalled load, longer/shorter
  // than expected runtime), still advance after the nominal clip length so
  // the carousel never gets stuck on one tank.
  useEffect(() => {
    clearTimers();
    setMissing(false);
    if (tags.length === 0) return;
    advanceTimerRef.current = setTimeout(() => goTo(index + 1), VIDEO_DWELL_MS);
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, tags.length]);

  useEffect(() => clearTimers, []);

  if (tags.length === 0) return null;
  const tag = tags[displayedIndex];
  if (!tag) return null;

  function handleEnded() {
    if (tags.length <= 1) return; // nothing else to advance to — let it loop in place
    goTo(index + 1);
  }

  function handleError() {
    setMissing(true);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => goTo(index + 1), MISSING_VIDEO_DWELL_MS);
  }

  return (
    <div className="absolute bottom-3 right-16 z-20 w-72 overflow-hidden rounded-brava-md border border-white/15 bg-black/70 shadow-brava-lg backdrop-blur-sm sm:w-80">
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
          <video
            key={tag}
            src={videoSrcForTag(tag)}
            autoPlay
            muted
            loop={tags.length <= 1}
            playsInline
            onEnded={handleEnded}
            onError={handleError}
            className="h-full w-full object-cover animate-video-fade-in"
          />
        )}

        {/* Fade-to-black dip, driven purely by CSS transition — covers the swap underneath. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-black transition-opacity ease-in-out",
            transitioning ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDuration: `${TRANSITION_MS}ms` }}
        />
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
