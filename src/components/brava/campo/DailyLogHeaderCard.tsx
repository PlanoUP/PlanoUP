"use client";

import { useEffect, useState } from "react";
import { Clock, Users, Send } from "lucide-react";
import { TankWithDerived } from "@/lib/brava/types";
import { FieldDailyLog } from "@/lib/brava/field/types";
import { todayISO } from "@/lib/brava/date-utils";
import { fetchWithTimeout, isDefinitelyOffline } from "@/lib/brava/field/offlineFetch";
import {
  enqueuePendingAction,
  listPendingActionsForTank,
  PendingAction,
  PendingDailyLogPayload,
} from "@/lib/brava/field/offlineQueue";
import { flushOfflineQueue } from "@/lib/brava/field/offlineSync";

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Pinned at the top of Campo's registration flow — PT número/horário and efetivo for today, one record per tank+day (last write wins). */
export default function DailyLogHeaderCard({ tank }: { tank: TankWithDerived }) {
  const [ptNumero, setPtNumero] = useState("");
  const [ptHorario, setPtHorario] = useState(nowHHMM());
  const [petHorario1, setPetHorario1] = useState("");
  const [petHorario2, setPetHorario2] = useState("");
  const [efetivo, setEfetivo] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetchWithTimeout(`/api/field-daily-log?tankId=${encodeURIComponent(tank.id)}&date=${todayISO()}`, {
          cache: "no-store",
        });
        const body = await res.json();
        const log = body.log as FieldDailyLog | null;
        if (log && !cancelled) {
          setPtNumero(log.ptNumero);
          if (log.ptHorario) setPtHorario(log.ptHorario);
          if (log.petHorario1) setPetHorario1(log.petHorario1);
          if (log.petHorario2) setPetHorario2(log.petHorario2);
          setEfetivo(log.efetivo);
        }
      } catch {
        // offline on first load — fields stay blank/defaulted below from the outbox, if anything was queued already
      }
      try {
        const pending = await listPendingActionsForTank(tank.id);
        const queuedDailyLog = pending.find((a) => a.kind === "daily-log") as PendingAction | undefined;
        if (queuedDailyLog && !cancelled) {
          const p = queuedDailyLog.payload as PendingDailyLogPayload;
          setPtNumero(p.ptNumero);
          setPtHorario(p.ptHorario);
          setPetHorario1(p.petHorario1 ?? "");
          setPetHorario2(p.petHorario2 ?? "");
          setEfetivo(p.efetivo);
        }
      } catch {
        // IndexedDB unavailable — nothing to overlay, carry on with whatever the server returned
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [tank.id]);

  async function queueOffline() {
    await enqueuePendingAction("daily-log", tank.tag, {
      tankId: tank.id,
      date: todayISO(),
      ptNumero,
      ptHorario,
      petHorario1,
      petHorario2,
      efetivo,
    });
    setDone(true);
    window.setTimeout(() => setDone(false), 3000);
    flushOfflineQueue();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (isDefinitelyOffline()) {
      await queueOffline();
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetchWithTimeout("/api/field-daily-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tankId: tank.id, date: todayISO(), ptNumero, ptHorario, petHorario1, petHorario2, efetivo }),
      });
      if (!res.ok) throw new Error("Falha ao salvar.");
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch (err) {
      if (err instanceof TypeError || (err instanceof DOMException && err.name === "AbortError")) {
        await queueOffline();
      } else {
        setError(err instanceof Error ? err.message : "Falha ao salvar.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <form onSubmit={handleSubmit} className="rounded-brava-lg border-2 border-brava-blue/30 bg-brava-white p-4 shadow-brava-sm">
      <div className="flex items-center gap-2.5">
        <Clock className="h-4 w-4 shrink-0 text-brava-blue" />
        <p className="text-[13px] font-bold text-brava-text">Liberação da PT</p>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-wide text-brava-text-secondary">
            Número da PT
          </label>
          <input
            value={ptNumero}
            onChange={(e) => setPtNumero(e.target.value)}
            placeholder="ex: PT-00123"
            className="mt-1 w-full rounded-brava-sm border border-brava-border px-3 py-2 text-[14px] focus:border-brava-blue focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-wide text-brava-text-secondary">
            Horário de liberação
          </label>
          <input
            type="time"
            value={ptHorario}
            onChange={(e) => setPtHorario(e.target.value)}
            className="mt-1 w-full rounded-brava-sm border border-brava-border px-3 py-2 text-[14px] focus:border-brava-blue focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2.5 border-t border-brava-border pt-3">
        <Clock className="h-4 w-4 shrink-0 text-brava-blue" />
        <p className="text-[13px] font-bold text-brava-text">Liberação de PET</p>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-wide text-brava-text-secondary">
            Horário 1
          </label>
          <input
            type="time"
            value={petHorario1}
            onChange={(e) => setPetHorario1(e.target.value)}
            className="mt-1 w-full rounded-brava-sm border border-brava-border px-3 py-2 text-[14px] focus:border-brava-blue focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-wide text-brava-text-secondary">
            Horário 2
          </label>
          <input
            type="time"
            value={petHorario2}
            onChange={(e) => setPetHorario2(e.target.value)}
            className="mt-1 w-full rounded-brava-sm border border-brava-border px-3 py-2 text-[14px] focus:border-brava-blue focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2.5 border-t border-brava-border pt-3">
        <Users className="h-4 w-4 shrink-0 text-brava-text-secondary" />
        <p className="text-[13px] font-bold text-brava-text">Efetivo</p>
      </div>
      <input
        value={efetivo}
        onChange={(e) => setEfetivo(e.target.value)}
        placeholder="Quem está em campo hoje — ex: 4 pessoas, equipe Mecânica"
        className="mt-1.5 w-full rounded-brava-sm border border-brava-border px-3 py-2 text-[14px] focus:border-brava-blue focus:outline-none"
      />

      {error && <p className="mt-2 text-[12px] font-semibold text-brava-danger">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-brava-sm bg-brava-blue py-2.5 text-[13px] font-bold text-brava-white disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {submitting ? "Salvando..." : "Salvar"}
      </button>
      {done && <p className="mt-1.5 text-center text-[12px] font-semibold text-brava-success">Salvo ✓</p>}
    </form>
  );
}
