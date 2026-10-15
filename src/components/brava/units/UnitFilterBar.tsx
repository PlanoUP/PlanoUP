"use client";

import { useUnitsData } from "@/lib/brava/units/context";
import { UnitView } from "@/lib/brava/units/types";
import { cn } from "@/lib/brava/cn";

const OPTIONS: { value: UnitView; label: string }[] = [
  { value: "TODAS", label: "Todas" },
  { value: "U-260", label: "U-260" },
  { value: "U-270", label: "U-270" },
];

export default function UnitFilterBar() {
  const { unitView, setUnitView } = useUnitsData();

  return (
    <div className="flex flex-wrap gap-1.5">
      {OPTIONS.map((opt) => {
        const active = unitView === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setUnitView(opt.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wide transition-colors",
              active
                ? "border-brava-blue bg-brava-blue text-brava-white"
                : "border-brava-border bg-brava-white text-brava-text-secondary hover:border-brava-blue/30 hover:text-brava-blue-dark"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
