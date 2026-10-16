"use client";

import { useState } from "react";
import { Tank } from "@/lib/brava/types";
import { formatLong } from "@/lib/brava/date-utils";
import { useBravaData } from "@/lib/brava/context";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import { cn } from "@/lib/brava/cn";
import { FileText, Pencil, Check } from "lucide-react";

export default function TankNotes({ tank }: { tank: Tank }) {
  const { updateTankMeta } = useBravaData();
  const { requireEditor } = useEditAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tank.notes ?? "");

  if (!editing && !tank.notes && !tank.nextInternalInspection) return null;

  function toggleEditing() {
    if (!editing) {
      if (!requireEditor()) return;
      setDraft(tank.notes ?? "");
      setEditing(true);
      return;
    }
    updateTankMeta(tank.id, { notes: draft.trim() || undefined });
    setEditing(false);
  }

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white p-6 shadow-brava-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-brava-blue-dark">
          <FileText className="h-4 w-4" strokeWidth={1.75} />
          <h2 className="text-[14px] font-semibold tracking-tight">Observações</h2>
        </div>
        <button
          type="button"
          onClick={toggleEditing}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-brava-sm border px-2.5 py-1 text-[11px] font-semibold transition-colors",
            editing
              ? "border-brava-blue bg-brava-blue text-brava-white"
              : "border-brava-border bg-brava-white text-brava-blue hover:border-brava-blue/40 hover:bg-brava-bg"
          )}
        >
          {editing ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
          {editing ? "Salvar" : "Editar"}
        </button>
      </div>

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={10}
          autoFocus
          placeholder="Escopo e observações do tanque..."
          className="mt-3 w-full rounded-brava-sm border border-brava-border px-3 py-2 text-[13.5px] leading-relaxed text-brava-text focus:border-brava-blue focus:outline-none"
        />
      ) : (
        tank.notes && (
          <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-brava-text">{tank.notes}</p>
        )
      )}

      {tank.nextInternalInspection && (
        <p className="mt-2 text-[12px] text-brava-text-secondary">
          Próxima inspeção interna: <span className="font-medium text-brava-text">{formatLong(tank.nextInternalInspection)}</span>
        </p>
      )}
    </div>
  );
}
