import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/brava/cn";

export default function KpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  tone?: "neutral" | "accent" | "warning" | "danger";
  hint?: string;
}) {
  const toneClass = {
    neutral: "text-brava-blue",
    accent: "text-brava-blue-dark",
    warning: "text-brava-warning",
    danger: "text-brava-danger",
  }[tone];

  return (
    <div className="flex items-center gap-3 rounded-brava-md border border-brava-border bg-brava-white px-4 py-3.5 shadow-brava-sm transition-shadow hover:shadow-brava-md">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-brava-sm bg-brava-bg",
          toneClass
        )}
      >
        <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] font-medium uppercase leading-tight tracking-wide text-brava-text-secondary">
          {label}
        </p>
        <p className="flex items-baseline gap-1">
          <span className="text-xl font-semibold leading-tight text-brava-text">{value}</span>
          {suffix && <span className="text-xs text-brava-text-secondary">{suffix}</span>}
        </p>
        {hint && <p className="truncate text-[11px] text-brava-text-secondary">{hint}</p>}
      </div>
    </div>
  );
}
