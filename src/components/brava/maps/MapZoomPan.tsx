"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Plus, Minus, Maximize, RotateCcw } from "lucide-react";
import { cn } from "@/lib/brava/cn";

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
 */
const MapZoomPan = forwardRef<
  MapZoomPanHandle,
  { aspectRatio: number; children: React.ReactNode; onCalibrationClick?: (xPct: number, yPct: number) => void }
>(function MapZoomPan({ aspectRatio, children, onCalibrationClick }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
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

    function toggleFullscreen() {
      const el = containerRef.current;
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
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-brava-lg border border-brava-border bg-brava-bg"
        style={{ aspectRatio: String(aspectRatio) }}
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

        <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1 rounded-brava-md border border-brava-border bg-brava-white/95 p-1 shadow-brava-md backdrop-blur">
          <ZoomButton icon={Plus} label="Ampliar" onClick={() => zoomBy(1.4)} />
          <ZoomButton icon={Minus} label="Reduzir" onClick={() => zoomBy(1 / 1.4)} />
          <ZoomButton icon={RotateCcw} label="Reset" onClick={reset} />
          <ZoomButton icon={Maximize} label="Tela cheia" onClick={toggleFullscreen} />
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
