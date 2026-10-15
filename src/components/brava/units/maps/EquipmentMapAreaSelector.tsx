"use client";

import { EQUIPMENT_ASSET_MAPS } from "@/lib/brava/units/maps/config";
import { EquipmentMapId } from "@/lib/brava/units/maps/types";
import { cn } from "@/lib/brava/cn";

export default function EquipmentMapAreaSelector({
  activeMapId,
  onChange,
}: {
  activeMapId: EquipmentMapId;
  onChange: (id: EquipmentMapId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {EQUIPMENT_ASSET_MAPS.map((map) => {
        const active = map.id === activeMapId;
        return (
          <button
            key={map.id}
            type="button"
            onClick={() => onChange(map.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold uppercase tracking-wide transition-colors",
              active
                ? "border-brava-blue bg-brava-blue text-brava-white"
                : "border-brava-border bg-brava-white text-brava-text-secondary hover:border-brava-blue/30 hover:text-brava-text"
            )}
          >
            {map.name}
          </button>
        );
      })}
    </div>
  );
}
