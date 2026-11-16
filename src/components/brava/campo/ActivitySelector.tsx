"use client";

import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { Activity } from "@/lib/brava/types";
import { cn } from "@/lib/brava/cn";

/** Lets a Fiscal pick which etapa to register against — not locked to "the current one" so progress for any stage can be logged. */
export default function ActivitySelector({
  activities,
  selectedId,
  onSelect,
}: {
  activities: Activity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const ordered = [...activities].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white p-3 shadow-brava-sm">
      <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-brava-text-secondary">Etapa</p>
      <div className="flex flex-col gap-1.5">
        {ordered.map((a) => {
          const active = a.id === selectedId;
          const Icon = a.status === "CONCLUIDO" ? CheckCircle2 : a.status === "ATUAL" || a.status === "ATRASADO" ? PlayCircle : Circle;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelect(a.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-brava-sm border px-3 py-2.5 text-left transition-colors",
                active ? "border-brava-blue bg-brava-blue/5" : "border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  a.status === "CONCLUIDO" && "text-brava-success",
                  (a.status === "ATUAL" || a.status === "ATRASADO") && "text-brava-blue",
                  a.status === "FUTURO" && "text-brava-text-secondary"
                )}
              />
              <span className={cn("flex-1 truncate text-[13.5px]", active ? "font-bold text-brava-text" : "text-brava-text")}>
                {a.name}
              </span>
              <span className="shrink-0 font-mono text-[12px] font-bold text-brava-text-secondary">{a.progress}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
