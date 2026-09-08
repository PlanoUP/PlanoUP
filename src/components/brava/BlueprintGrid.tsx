/**
 * Purely decorative technical backdrop — a faint blueprint grid with
 * concentric rings and coordinate ticks. Used behind hero/feature panels to
 * signal "engineering" without competing with real data.
 */
export default function BlueprintGrid({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 480"
      className={className}
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="brava-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="640" height="480" fill="url(#brava-grid)" />
      <circle cx="520" cy="120" r="140" stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" />
      <circle cx="520" cy="120" r="90" stroke="currentColor" strokeOpacity="0.09" strokeWidth="1" />
      <circle cx="520" cy="120" r="44" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
      <path d="M0 400h640" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="2 6" />
      <path d="M96 0v480" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" strokeDasharray="2 6" />
      {[0, 1, 2, 3, 4].map((i) => (
        <text
          key={i}
          x={8}
          y={24 + i * 88}
          fontSize="9"
          fontFamily="ui-monospace, monospace"
          fill="currentColor"
          fillOpacity="0.18"
          letterSpacing="0.05em"
        >
          {String(i * 25).padStart(3, "0")}
        </text>
      ))}
    </svg>
  );
}
