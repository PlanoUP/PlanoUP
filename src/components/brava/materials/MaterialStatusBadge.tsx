import { MaterialStatus } from "@/lib/brava/materials/types";
import { MATERIAL_STATUS_META } from "@/lib/brava/materials/meta";
import { cn } from "@/lib/brava/cn";

export default function MaterialStatusBadge({
  status,
  size = "md",
  className,
}: {
  status: MaterialStatus;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = MATERIAL_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-semibold uppercase tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        meta.badgeClass,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", meta.dotClass)} />
      {meta.label}
    </span>
  );
}
