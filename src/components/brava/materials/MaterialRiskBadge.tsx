import { MaterialRiskResult } from "@/lib/brava/materials/calculations";
import { formatMaterialRiskDetail } from "@/lib/brava/materials/calculations";
import { MATERIAL_RISK_META } from "@/lib/brava/materials/meta";
import { cn } from "@/lib/brava/cn";

export default function MaterialRiskBadge({
  result,
  size = "md",
  showDetail = true,
  className,
}: {
  result: MaterialRiskResult;
  size?: "sm" | "md";
  showDetail?: boolean;
  className?: string;
}) {
  const meta = MATERIAL_RISK_META[result.level];
  const detail = showDetail ? formatMaterialRiskDetail(result) : "";
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
      {detail && <span className="font-normal normal-case opacity-80">· {detail}</span>}
    </span>
  );
}
