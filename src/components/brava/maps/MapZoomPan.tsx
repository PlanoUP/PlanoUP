"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Minus, Maximize, RotateCcw } from "lucide-react";
import { cn } from "@/lib/brava/cn";
import MaintenanceVideoCarousel from "./MaintenanceVideoCarousel";
import FullscreenControlBar, { FullscreenSummary } from "./FullscreenControlBar";
import MaintenanceEventTicker from "./MaintenanceEventTicker";
import HudCorners from "./HudCorners";
import BlueprintGrid from "../BlueprintGrid";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const FOCUS_SCALE = 2.2;

export interface MapZoomPanHandle {
  /** Centers the viewport on a % point of the content and zooms in. */
  focusOn: (xPct: number, yPct: number) => void;
  reset: () => void;
}

/**
 * Owns the single transformable layer for the map — the base image and the
 * hotspot layer are both passed as children and therefore share the exact
 * same transform, so hotspots always track the image through zoom and pan.
 *
 * Fullscreen note: the Fullscreen API target (fullscreenRef) is a plain
 * wrapper, never the aspect-ratio box itself — the browser forces a
 * fullscreened element to width:100%/height:100% of the viewport, which
 * would override the box's own aspect-ratio and desync the hotspots'
 * percentage positions from where the (object-cover'd) image is actually
 * drawn. The wrapper centers the aspect-ratio box instead, sized via an
 * explicit min(vw, vh*ratio)/min(vh, vw/ratio) calc (see below) rather than
 * width/height:auto — the box's only normal-flow child is itself
 * position:absolute, so auto sizing has no content to size against and
 * collapses to zero. When fullscreen leaves black letterbox bars (the
 * screen's aspect ratio rarely matches the map image's), backgroundSrc — a
 * blurred, cover-cropped copy of the same image — fills them in behind the
 * precise foreground instead of leaving them black, without touching the
 * foreground's alignment.
 */
const MapZoomPan = forwardRef<
  MapZoomPanHandle,
  {
    aspectRatio: number;
    children: React.ReactNode;
    onCalibrationClick?: (xPct: number, yPct: number) => void;
    backgroundSrc?: string;
    /** Shown as a top-centered control bar only while in fullscreen — e.g. "PARADAS DE MANUTENÇÃO - TANQUES". Requires fullscreenSummary too. */
    fullscreenLabel?: string;
    fullscreenSummary?: FullscreenSummary;
    /** Scrolling ticker strip under the control bar, only while in fullscreen. */
    fullscreenTickerItems?: string[];
    /** TAGs cycled through the bottom-right maintenance video carousel, only while in fullscreen. */
    maintenanceVideoTags?: string[];
    /**
     * Reports the map's actual rendered CSS pixel size whenever it changes
     * (mount, fullscreen toggle, window resize) — callers that position
     * things in CSS px relative to the dots' own % position (callout boxes,
     * via computeCalloutLayout) need this instead of the image's native
     * file dimensions, since those two only coincide when the image
     * happens to render at exactly its native resolution.
     */
    onViewportSizeChange?: (size: { width: number; height: number }) => void;
    /** Reports the current zoom factor whenever it changes — callers dragging something inside the transformed layer (e.g. a callout box) need this to convert pointer-movement px into the layer's own (unscaled) coordinate space. */
    onScaleChange?: (scale: number) => void;
  }
>(function MapZoomPan(
  {
    aspectRatio,
    children,
    onCalibrationClick,
    backgroundSrc,
    fullscreenLabel,
    fullscreenSummary,
    fullscreenTickerItems,
    maintenanceVideoTags,
    onViewportSizeChange,
    onScaleChange,
  },
  ref
) {
    const fullscreenRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
    const downPointRef = useRef<{ x: number; y: number } | null>(null);
    const [dragging, setDragging] = useState(false);

    function reset() {
      setScale(1);
      setPan({ x: 0, y: 0 });
    }

    function clampScale(next: number) {
      return Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
    }

    function zoomBy(factor: number) {
      setScale((s) => clampScale(s * factor));
    }

    function focusOn(xPct: number, yPct: number) {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const targetScale = FOCUS_SCALE;
      const pointX = (xPct / 100) * w;
      const pointY = (yPct / 100) * h;
      setScale(targetScale);
      setPan({ x: w / 2 - targetScale * pointX, y: h / 2 - targetScale * pointY });
    }

    useImperativeHandle(ref, () => ({ focusOn, reset }));

    // The container's pixel size changes when entering/exiting fullscreen,
    // which would otherwise leave any existing pan/zoom pointing at the
    // wrong spot (computed against the old size) — reset so the view
    // always starts aligned on the new size.
    useEffect(() => {
      function onFullscreenChange() {
        setIsFullscreen(document.fullscreenElement === fullscreenRef.current);
        reset();
      }
      document.addEventListener("fullscreenchange", onFullscreenChange);
      return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reports the container's actual rendered size on every change (mount,
    // fullscreen toggle, window resize) — covers normal embed, fullscreen,
    // and anything in between without needing to special-case any of them.
    useEffect(() => {
      const el = containerRef.current;
      if (!el || !onViewportSizeChange) return;
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) onViewportSizeChange({ width, height });
      });
      observer.observe(el);
      return () => observer.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onViewportSizeChange]);

    useEffect(() => {
      onScaleChange?.(scale);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scale, onScaleChange]);

    function toggleFullscreen() {
      const el = fullscreenRef.current;
      if (!el) return;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        el.requestFullscreen?.();
      }
    }

    function onPointerDown(e: React.PointerEvent) {
      downPointRef.current = { x: e.clientX, y: e.clientY };
      if (scale <= 1) return;
      dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: React.PointerEvent) {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
    }

    function onPointerUp(e: React.PointerEvent) {
      const down = downPointRef.current;
      dragRef.current = null;
      setDragging(false);
      downPointRef.current = null;

      if (!down || !onCalibrationClick) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      if (moved > 5) return;

      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const contentX = (relX - pan.x) / scale;
      const contentY = (relY - pan.y) / scale;
      onCalibrationClick((contentX / rect.width) * 100, (contentY / rect.height) * 100);
    }

    return (
      <div
        ref={fullscreenRef}
        className={cn(isFullscreen && "relative flex h-full w-full items-center justify-center bg-black")}
      >
        {isFullscreen && backgroundSrc && (
          <Image
            src={backgroundSrc}
            alt=""
            fill
            sizes="100vw"
            aria-hidden
            className="scale-110 object-cover opacity-50 blur-2xl"
          />
        )}
        {isFullscreen && <HudCorners />}
        {isFullscreen && fullscreenLabel && fullscreenSummary && (
          <FullscreenControlBar title={fullscreenLabel} summary={fullscreenSummary} />
        )}
        {isFullscreen && fullscreenTickerItems && <MaintenanceEventTicker items={fullscreenTickerItems} />}
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-brava-lg border border-brava-border bg-brava-bg"
          style={
            isFullscreen
              ? {
                  // containerRef's only normal-flow child is position:absolute
                  // (the transform layer below), which contributes nothing to
                  // an auto-sized box — width/height:auto here would collapse
                  // to 0. Compute the exact "contain" size explicitly instead:
                  // whichever of these two is smaller is the true fit, and the
                  // other works out to match (see MapZoomPan's own math).
                  width: `min(100vw, calc(100vh * ${aspectRatio}))`,
                  height: `min(100vh, calc(100vw / ${aspectRatio}))`,
                }
              : { aspectRatio: String(aspectRatio), width: "100%" }
          }
        >
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            className={cn("absolute inset-0", scale > 1 && (dragging ? "cursor-grabbing" : "cursor-grab"))}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: "0 0",
              transition: dragging ? "none" : "transform 300ms ease-out",
            }}
          >
            {children}
          </div>

          {isFullscreen && (
            <BlueprintGrid className="pointer-events-none absolute inset-0 h-full w-full text-white opacity-[0.07]" />
          )}

          <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1 rounded-brava-md border border-brava-border bg-brava-white/95 p-1 shadow-brava-md backdrop-blur">
            <ZoomButton icon={Plus} label="Ampliar" onClick={() => zoomBy(1.4)} />
            <ZoomButton icon={Minus} label="Reduzir" onClick={() => zoomBy(1 / 1.4)} />
            <ZoomButton icon={RotateCcw} label="Reset" onClick={reset} />
            <ZoomButton icon={Maximize} label="Tela cheia" onClick={toggleFullscreen} />
          </div>

          {isFullscreen && maintenanceVideoTags && maintenanceVideoTags.length > 0 && (
            <MaintenanceVideoCarousel tags={maintenanceVideoTags} />
          )}
        </div>
      </div>
    );
  }
);

export default MapZoomPan;

function ZoomButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-brava-sm text-brava-text-secondary transition-colors hover:bg-brava-bg hover:text-brava-blue"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}
