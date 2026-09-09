"use client";

import { ASSET_MAPS } from "@/lib/brava/maps/config";
import { AssetMapId } from "@/lib/brava/maps/types";
import { cn } from "@/lib/brava/cn";

export default function MapAreaSelector({
  activeMapId,
  onChange,
}: {
  activeMapId: AssetMapId;
  onChange: (id: AssetMapId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ASSET_MAPS.map((map) => {
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
