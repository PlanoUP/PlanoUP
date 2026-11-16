"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { PRESET_FIELD_ACTIVITIES } from "@/lib/brava/field/types";
import { cn } from "@/lib/brava/cn";

/** Lets a Fiscal pick which activity just happened — from the quick presets, a custom one typed earlier today, or a brand new one via "+ Adicionar atividade". */
export default function ActivitySelector({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (label: string) => void;
}) {
  const [customLabels, setCustomLabels] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const chips: string[] = [...PRESET_FIELD_ACTIVITIES, ...customLabels];

  function confirmCustom() {
    const label = draft.trim();
    if (!label) {
      setAdding(false);
      return;
    }
    if (!chips.includes(label)) setCustomLabels((prev) => [...prev, label]);
    onSelect(label);
    setDraft("");
    setAdding(false);
  }

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white p-3 shadow-brava-sm">
      <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-brava-text-secondary">Etapa</p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((label) => {
          const active = label === selected;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
                active
                  ? "border-brava-blue bg-brava-blue text-brava-white"
                  : "border-brava-border bg-brava-white text-brava-text-secondary"
              )}
            >
              {active && <Check className="h-3 w-3 shrink-0" />}
              {label}
            </button>
          );
        })}

        {adding ? (
          <div className="flex w-full items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmCustom();
                }
              }}
              autoFocus
              placeholder="Nome da atividade"
              className="min-w-0 flex-1 rounded-brava-sm border border-brava-border px-3 py-1.5 text-[13px] focus:border-brava-blue focus:outline-none"
            />
            <button
              type="button"
              onClick={confirmCustom}
              className="shrink-0 rounded-brava-sm bg-brava-blue px-3 py-1.5 text-[12px] font-bold text-brava-white"
            >
              OK
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-brava-border px-3 py-1.5 text-[12.5px] font-semibold text-brava-text-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar atividade
          </button>
        )}
      </div>
    </div>
  );
}
