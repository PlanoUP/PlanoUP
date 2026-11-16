"use client";

import { useEffect, useState } from "react";
import { Clock, Users, Send } from "lucide-react";
import { TankWithDerived } from "@/lib/brava/types";
import { FieldDailyLog } from "@/lib/brava/field/types";
import { todayISO } from "@/lib/brava/date-utils";

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Pinned at the top of Campo's registration flow — PT número/horário and efetivo for today, one record per tank+day (last write wins). */
export default function DailyLogHeaderCard({ tank }: { tank: TankWithDerived }) {
  const [ptNumero, setPtNumero] = useState("");
  const [ptHorario, setPtHorario] = useState(nowHHMM());
  const [efetivo, setEfetivo] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/field-daily-log?tankId=${encodeURIComponent(tank.id)}&date=${todayISO()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        const log = body.log as FieldDailyLog | null;
        if (log) {
          setPtNumero(log.ptNumero);
          if (log.ptHorario) setPtHorario(log.ptHorario);
          setEfetivo(log.efetivo);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tank.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/field-daily-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tankId: tank.id, date: todayISO(), ptNumero, ptHorario, efetivo }),
      });
      if (!res.ok) throw new Error("Falha ao salvar.");
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
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
