/**
 * Technical line-art silhouette of an industrial storage tank — the panel's
 * one recurring illustration motif, in "hero" (detailed) and "mini" (card
 * icon) variants. Pure decoration, no data.
 */
export default function TankIllustration({
  variant = "hero",
  className,
}: {
  variant?: "hero" | "mini";
  className?: string;
}) {
  if (variant === "mini") {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
        <ellipse cx="24" cy="14" rx="16" ry="4" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 14v18a16 4 0 0 0 32 0V14" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 22a16 4 0 0 0 32 0" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M8 28a16 4 0 0 0 32 0" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M24 10V4" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="24" cy="3" r="1.6" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 360 320" className={className} fill="none" aria-hidden>
      <ellipse cx="180" cy="88" rx="108" ry="22" stroke="currentColor" strokeWidth="1.6" />
      <path d="M72 88v148a108 22 0 0 0 216 0V88" stroke="currentColor" strokeWidth="1.6" />
      {[122, 156, 190, 224].map((y) => (
        <path key={y} d={`M72 ${y}a108 22 0 0 0 216 0`} stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" />
      ))}
      {/* Roof access + vent */}
      <path d="M180 66V24" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="180" cy="18" r="7" stroke="currentColor" strokeWidth="1.6" />
      {/* Ladder */}
      <path d="M270 108v128" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" />
      <path d="M258 108v128" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" />
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={i} d={`M258 ${118 + i * 12}h12`} stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
      ))}
      {/* Piping */}
      <path d="M72 200H36v70h44" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.4" />
      <circle cx="36" cy="240" r="4" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.2" />
      {/* Base line */}
      <path d="M48 258h264" stroke="currentColor" strokeWidth="1.6" />
      <path d="M60 258v14M300 258v14" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" />
    </svg>
  );
}
