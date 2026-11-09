"use client";

import { Calendar, RefreshCw, Pencil, Check, Lock, History } from "lucide-react";
import { ReportScope } from "@/lib/brava/reports/types";
import { cn } from "@/lib/brava/cn";

export default function ReportsControlBar({
  scopes,
  scope,
  onScopeChange,
  weekStartISO,
  onWeekStartChange,
  cutoffDateISO,
  onCutoffDateChange,
  onResetCutoffToToday,
  editing,
  onToggleEdit,
  closedAt,
  onCloseWeek,
  closing,
  historyOpen,
  onToggleHistory,
}: {
  scopes: { value: ReportScope; label: string }[];
  scope: ReportScope;
  onScopeChange: (s: ReportScope) => void;
  weekStartISO: string;
  onWeekStartChange: (iso: string) => void;
  cutoffDateISO: string;
  onCutoffDateChange: (iso: string) => void;
  onResetCutoffToToday: () => void;
  editing: boolean;
  onToggleEdit: () => void;
  closedAt: string | null;
  onCloseWeek: () => void;
  closing: boolean;
  historyOpen: boolean;
  onToggleHistory: () => void;
}) {
  const isClosed = closedAt !== null;

  return (
    <div className="flex flex-col gap-3 rounded-brava-md border border-brava-border bg-brava-white p-4 shadow-brava-sm sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brava-text-secondary">Escopo</span>
          <select
            value={scope}
            onChange={(e) => onScopeChange(e.target.value)}
            className="rounded-brava-sm border border-brava-border bg-brava-white px-2.5 py-1.5 text-[13px] text-brava-text focus:border-brava-blue focus:outline-none"
          >
            {scopes.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brava-text-secondary">Semana de referência</span>
          <input
            type="date"
            value={weekStartISO}
            onChange={(e) => onWeekStartChange(e.target.value)}
            disabled={isClosed}
            className="rounded-brava-sm border border-brava-border bg-brava-white px-2.5 py-1.5 text-[13px] text-brava-text focus:border-brava-blue focus:outline-none disabled:bg-brava-bg disabled:text-brava-text-secondary"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brava-text-secondary">Data de corte</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-brava-text-secondary" />
            <input
              type="date"
              value={cutoffDateISO}
              onChange={(e) => onCutoffDateChange(e.target.value)}
              disabled={isClosed}
              className="rounded-brava-sm border border-brava-border bg-brava-white px-2.5 py-1.5 text-[13px] text-brava-text focus:border-brava-blue focus:outline-none disabled:bg-brava-bg disabled:text-brava-text-secondary"
            />
          </div>
        </label>

        {!isClosed && (
          <button
            type="button"
            onClick={onResetCutoffToToday}
            className="inline-flex items-center gap-1.5 rounded-brava-sm border border-brava-border bg-brava-white px-2.5 py-1.5 text-[12px] font-semibold text-brava-text-secondary hover:border-brava-blue/40 hover:text-brava-blue-dark"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar dados
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleHistory}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-brava-sm border px-2.5 py-1.5 text-[12px] font-semibold transition-colors",
            historyOpen
              ? "border-brava-blue bg-brava-blue text-brava-white"
              : "border-brava-border bg-brava-white text-brava-text-secondary hover:border-brava-blue/40 hover:text-brava-blue-dark"
          )}
        >
          <History className="h-3.5 w-3.5" />
          Histórico
        </button>

        {isClosed ? (
          <span className="inline-flex items-center gap-1.5 rounded-brava-sm border border-brava-border bg-brava-bg px-2.5 py-1.5 text-[12px] font-semibold text-brava-text-secondary">
            <Lock className="h-3.5 w-3.5" />
            Semana fechada
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggleEdit}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-brava-sm border px-2.5 py-1.5 text-[12px] font-semibold transition-colors",
                editing
                  ? "border-brava-blue bg-brava-blue text-brava-white"
                  : "border-brava-border bg-brava-white text-brava-blue hover:border-brava-blue/40 hover:bg-brava-bg"
              )}
            >
              {editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
              {editing ? "Concluir edição" : "Editar narrativa"}
            </button>
            <button
              type="button"
              onClick={onCloseWeek}
              disabled={closing}
              className="inline-flex items-center gap-1.5 rounded-brava-sm bg-brava-blue px-3 py-1.5 text-[12px] font-semibold text-brava-white transition-colors hover:bg-brava-blue-dark disabled:opacity-60"
            >
              <Lock className="h-3.5 w-3.5" />
              {closing ? "Fechando..." : "Fechar semana"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
