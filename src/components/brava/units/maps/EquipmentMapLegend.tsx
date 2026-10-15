"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { STATUS_META } from "@/lib/brava/status-meta";
import { EquipmentStatus } from "@/lib/brava/units/types";
import { cn } from "@/lib/brava/cn";

const ORDER: EquipmentStatus[] = ["CRITICO", "ATRASADO", "EM_EXECUCAO", "PROGRAMADO", "CONCLUIDO", "SEM_PROJETO"];

export default function EquipmentMapLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute right-3 top-3 z-20 w-max rounded-brava-md border border-brava-border bg-brava-white/95 shadow-brava-md backdrop-blur">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-[10.5px] font-bold uppercase tracking-wide text-brava-text-secondary"
      >
        Status
        {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </button>
      {!collapsed && (
        <div className="space-y-1.5 border-t border-brava-border px-3 py-2.5">
          {ORDER.map((s) => {
            const meta = STATUS_META[s];
            return (
              <div key={s} className="flex items-center gap-2 text-[11px] text-brava-text">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", meta.dotClass)} />
                {meta.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
