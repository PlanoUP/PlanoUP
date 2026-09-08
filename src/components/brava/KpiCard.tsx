import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/brava/cn";

export default function KpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone = "neutral",
  hint,
  meter,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  tone?: "neutral" | "accent" | "warning" | "danger";
  hint?: string;
  /** 0-100: renders a thin underline meter beneath the value for emphasis stats. */
  meter?: number;
}) {
  const valueTone = {
    neutral: "text-brava-blue-dark",
    accent: "text-brava-blue-dark",
    warning: "text-brava-warning",
    danger: "text-brava-danger",
  }[tone];

  return (
    <div className="flex min-w-[132px] flex-1 flex-col gap-2 px-5 py-4 first:pl-0 last:pr-0 sm:px-6">
      <div className="flex items-center gap-2 text-brava-text-secondary">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="text-[10.5px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="flex items-baseline gap-1">
        <span className={cn("font-mono text-[28px] font-extrabold leading-none tracking-tight", valueTone)}>
          {value}
        </span>
        {suffix && <span className="text-sm font-medium text-brava-text-secondary">{suffix}</span>}
      </p>
      {typeof meter === "number" ? (
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-brava-border/70">
          <div
            className="h-full rounded-full bg-brava-accent transition-[width] duration-700 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, meter))}%` }}
          />
        </div>
      ) : (
        hint && <p className="truncate text-[11px] text-brava-text-secondary">{hint}</p>
      )}
    </div>
  );
}
