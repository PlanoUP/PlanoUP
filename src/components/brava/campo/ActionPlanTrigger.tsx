"use client";

import { useState } from "react";
import { AlertOctagon, Send } from "lucide-react";
import { TankWithDerived } from "@/lib/brava/types";
import { notifyActionPlansChanged } from "@/lib/brava/field/actionPlanBus";
import { cn } from "@/lib/brava/cn";
import { fetchWithTimeout, isDefinitelyOffline } from "@/lib/brava/field/offlineFetch";
import { enqueuePendingAction } from "@/lib/brava/field/offlineQueue";
import { flushOfflineQueue } from "@/lib/brava/field/offlineSync";

/** Lets a Fiscal flag a critical impediment on this tank — it immediately shows up as a standing alert across the whole painel (ActionPlanBanner), until an editor resolves it. */
export default function ActionPlanTrigger({ tank }: { tank: TankWithDerived }) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);

  async function queueOffline() {
    await enqueuePendingAction("action-plan", tank.tag, { tankId: tank.id, tankTag: tank.tag, description });
    setDescription("");
    setOpen(false);
    setQueuedMessage("Salvo no aparelho — será acionado assim que a internet voltar ✓");
    window.setTimeout(() => setQueuedMessage(null), 3000);
    flushOfflineQueue();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    setError(null);

    if (isDefinitelyOffline()) {
      await queueOffline();
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetchWithTimeout("/api/action-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tankId: tank.id, tankTag: tank.tag, description }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || "Falha ao acionar o plano de ação.");
      notifyActionPlansChanged();
      setDescription("");
      setOpen(false);
      setDone(true);
      window.setTimeout(() => setDone(false), 2500);
    } catch (err) {
      if (err instanceof TypeError || (err instanceof DOMException && err.name === "AbortError")) {
        await queueOffline();
      } else {
        setError(err instanceof Error ? err.message : "Falha ao acionar o plano de ação.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-2 rounded-brava-lg border-2 border-brava-danger-border bg-brava-danger-bg py-3 text-[13.5px] font-bold text-brava-danger active:bg-brava-danger/15"
        >
          <AlertOctagon className="h-4.5 w-4.5" />
          Acionar Plano de Ação
        </button>
        {done && <p className="text-center text-[12px] font-semibold text-brava-success">Plano de ação acionado ✓</p>}
        {queuedMessage && <p className="text-center text-[12px] font-semibold text-brava-warning">{queuedMessage}</p>}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2.5 rounded-brava-lg border-2 border-brava-danger-border bg-brava-danger-bg p-4"
    >
      <p className="flex items-center gap-1.5 text-[13px] font-bold text-brava-danger">
        <AlertOctagon className="h-4 w-4" />
        Qual é o impedimento?
      </p>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        autoFocus
        rows={3}
        placeholder="Descreva o que está impedindo o avanço — isso vai aparecer em destaque para todo mundo que abrir o painel."
        className="w-full rounded-brava-sm border border-brava-danger-border bg-brava-white px-3 py-2.5 text-[14px] focus:outline-none"
      />
      {error && <p className="text-[12px] font-semibold text-brava-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-brava-sm border border-brava-border bg-brava-white py-2.5 text-[13px] font-semibold text-brava-text-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || !description.trim()}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-brava-sm bg-brava-danger py-2.5 text-[13px] font-bold text-brava-white",
            (submitting || !description.trim()) && "opacity-60"
          )}
        >
          <Send className="h-4 w-4" />
          {submitting ? "Acionando..." : "Acionar"}
        </button>
      </div>
    </form>
  );
}
