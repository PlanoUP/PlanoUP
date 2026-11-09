"use client";

import { Plus, X } from "lucide-react";
import { ReportHighlight } from "@/lib/brava/reports/types";

const MAX_ITEMS = 3;

function genId(): string {
  return `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Up to 3 free-text bullets — the one thing no calculation over tank data
 * can produce (what happened this week, what's blocking, what needs a
 * decision). Read-only once the report is closed, so a frozen week's
 * narrative can't quietly change later.
 */
export default function EditableList({
  items,
  onChange,
  editable,
  placeholder,
}: {
  items: ReportHighlight[];
  onChange: (items: ReportHighlight[]) => void;
  editable: boolean;
  placeholder: string;
}) {
  function updateText(id: string, text: string) {
    onChange(items.map((it) => (it.id === id ? { ...it, text } : it)));
  }
  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }
  function add() {
    if (items.length >= MAX_ITEMS) return;
    onChange([...items, { id: genId(), text: "" }]);
  }

  if (!editable && items.length === 0) {
    return <p className="text-[15px] italic text-[color:var(--rp-gray)]">Nenhum item registrado.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-2">
          <span className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-[color:var(--rp-blue)]" />
          {editable ? (
            <>
              <textarea
                value={item.text}
                onChange={(e) => updateText(item.id, e.target.value)}
                placeholder={placeholder}
                rows={2}
                className="w-full resize-none bg-transparent text-[16px] leading-snug text-[color:var(--rp-ink)] outline-none placeholder:text-[color:var(--rp-gray)]"
              />
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Remover"
                className="mt-0.5 shrink-0 text-[color:var(--rp-gray)] hover:text-[color:var(--rp-danger)]"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <p className="text-[16px] leading-snug text-[color:var(--rp-ink)]">{item.text || "—"}</p>
          )}
        </div>
      ))}
      {editable && items.length < MAX_ITEMS && (
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 self-start text-[13px] font-semibold text-[color:var(--rp-blue)] hover:opacity-70"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </button>
      )}
    </div>
  );
}
