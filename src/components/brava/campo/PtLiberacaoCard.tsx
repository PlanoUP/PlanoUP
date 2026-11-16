"use client";

import { useState } from "react";
import { Clock, Send } from "lucide-react";
import { TankWithDerived } from "@/lib/brava/types";
import { FieldEntry } from "@/lib/brava/field/types";

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function PtLiberacaoCard({
  tank,
  onSubmitted,
}: {
  tank: TankWithDerived;
  onSubmitted: (entry: FieldEntry) => void;
}) {
  const [horario, setHorario] = useState(nowHHMM());
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/field-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tankId: tank.id,
          activityId: null,
          progress: null,
          observacao: "",
          ocorrencia: false,
          materialDescricao: "",
          materialQuantidade: "",
          photos: [],
          ptHorario: horario,
        }),
      });
      if (!res.ok) throw new Error("Falha ao salvar o horário.");
      const body = await res.json();
      onSubmitted(body.entry);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar o horário.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-brava-lg border border-brava-border bg-brava-white p-4 shadow-brava-sm"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Clock className="h-4 w-4 shrink-0 text-brava-text-secondary" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-brava-text">Horário de liberação da PT</p>
          <input
            type="time"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="mt-1.5 w-full rounded-brava-sm border border-brava-border px-3 py-2 text-[14px] focus:border-brava-blue focus:outline-none"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-brava-sm bg-brava-blue px-3.5 py-2.5 text-[13px] font-bold text-brava-white disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {submitting ? "Salvando..." : "Registrar"}
      </button>
      {error && <p className="w-full text-[12px] font-semibold text-brava-danger">{error}</p>}
      {done && <p className="w-full text-[12px] font-semibold text-brava-success">PT liberada às {horario} ✓</p>}
    </form>
  );
}
