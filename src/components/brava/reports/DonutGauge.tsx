/**
 * SVG ring gauge shared by both slides — the big Previsto/Realizado donuts
 * on Slide 1 and the mini per-row donuts in Slide 2's table use the exact
 * same arc math, just at different sizes, so the two always read as the
 * same visual language.
 */
export default function DonutGauge({
  value,
  color,
  trackColor = "#E4E6EB",
  size = 140,
  strokeWidth = 14,
  showLabel = true,
  labelClassName,
}: {
  value: number;
  color: string;
  trackColor?: string;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  labelClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      {showLabel && (
        <span
          className={labelClassName ?? "absolute font-mono font-extrabold"}
          style={{ fontSize: size * 0.24, color }}
        >
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
