"use client";

import { useEffect, useRef, useState } from "react";

const SLIDE_WIDTH = 1920;
const SLIDE_HEIGHT = 1080;

/**
 * Locked 16:9 (1920x1080) canvas that scales down to fit its column width —
 * never reflows internally. Keeps every slide pixel-identical to what PDF
 * export will capture later, and gives the report its own fixed palette
 * (the exact hex values the user specified) independent from the app's own
 * --brava-* tokens, which the rest of the dashboard keeps using unchanged.
 */
export default function SlideFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setScale(width / SLIDE_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="w-full" style={{ height: SLIDE_HEIGHT * scale }}>
      <div
        data-report-slide={label}
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          // Locked report palette — see SLIDE 01/02 spec. Scoped here, not
          // merged into brava-tokens.css, so the rest of the app keeps its
          // own --brava-blue (#201475) unchanged.
          ["--rp-blue" as string]: "#1A0572",
          ["--rp-accent" as string]: "#D2F51E",
          ["--rp-white" as string]: "#FFFFFF",
          ["--rp-ink" as string]: "#101828",
          ["--rp-gray" as string]: "#667085",
          ["--rp-gray-bg" as string]: "#F4F5F7",
          ["--rp-line" as string]: "#E4E6EB",
          ["--rp-danger" as string]: "#C0152F",
          ["--rp-amber" as string]: "#B54708",
        }}
        className="overflow-hidden bg-[color:var(--rp-white)] text-[color:var(--rp-ink)] shadow-[0_8px_30px_rgba(16,24,40,0.12)]"
      >
        {children}
      </div>
    </div>
  );
}
