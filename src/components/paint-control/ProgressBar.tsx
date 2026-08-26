export default function ProgressBar({
  value,
  size = "md",
  showLabel = true,
}: {
  value: number;
  size?: "sm" | "md";
  showLabel?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const height = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-full ${height} rounded-full bg-slate-100 overflow-hidden`}>
        <div
          className={`${height} rounded-full bg-accent transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-700 w-9 text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
}
