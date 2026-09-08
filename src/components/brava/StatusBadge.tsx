import { TankStatus } from "@/lib/brava/types";
import { STATUS_META } from "@/lib/brava/status-meta";
import { cn } from "@/lib/brava/cn";

export default function StatusBadge({
  status,
  size = "md",
}: {
  status: TankStatus;
  size?: "sm" | "md";
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        meta.badgeClass
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotClass)} />
      {meta.label}
    </span>
  );
}
