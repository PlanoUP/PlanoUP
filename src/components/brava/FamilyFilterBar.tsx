"use client";

import { useBravaData } from "@/lib/brava/context";
import { FamilyView } from "@/lib/brava/types";
import { cn } from "@/lib/brava/cn";

const OPTIONS: { value: FamilyView; label: string }[] = [
  { value: "CRITICIDADE", label: "Criticidade" },
  { value: "410", label: "410" },
  { value: "6313", label: "6313" },
  { value: "270", label: "270" },
];

/** The four primary quick filters: mixed-by-criticality, or one tancagem family at a time. */
export default function FamilyFilterBar() {
  const { familyView, setFamilyView } = useBravaData();

  return (
    <div className="flex flex-wrap gap-1.5">
      {OPTIONS.map((opt) => {
        const active = familyView === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setFamilyView(opt.value)}
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
