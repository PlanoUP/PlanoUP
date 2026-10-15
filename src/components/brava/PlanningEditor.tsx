"use client";

import { useState } from "react";
import { Pencil, Check, RotateCcw, Eraser } from "lucide-react";
import { ActivityStatus, Tank, TankStatus } from "@/lib/brava/types";
import { useBravaData } from "@/lib/brava/context";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import { formatShort } from "@/lib/brava/date-utils";
import { STATUS_META } from "@/lib/brava/status-meta";
import { cn } from "@/lib/brava/cn";

const STATUS_OPTIONS: TankStatus[] = [
  "SEM_PROJETO",
  "PROGRAMADO",
  "EM_EXECUCAO",
  "ATRASADO",
  "CRITICO",
  "CONCLUIDO",
];

const ACTIVITY_STATUS_LABEL: Record<ActivityStatus, string> = {
  CONCLUIDO: "Concluído",
  ATUAL: "Em andamento",
  FUTURO: "Futuro",
  ATRASADO: "Atrasado",
};

const ACTIVITY_STATUS_COLOR: Record<ActivityStatus, string> = {
  CONCLUIDO: "text-brava-success",
  ATUAL: "text-brava-blue",
  FUTURO: "text-brava-text-secondary",
  ATRASADO: "text-brava-warning",
};

export default function PlanningEditor({ tank }: { tank: Tank }) {
  const { updateActivity, updateTankMeta, resetTankExecution } = useBravaData();
  const { requireEditor } = useEditAuth();
  const [editing, setEditing] = useState(false);
  const [savedPulse, setSavedPulse] = useState(false);
  const ordered = [...tank.activities].sort((a, b) => a.order - b.order);

  function flashSaved() {
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 1200);
  }

  function handleResetExecution() {
    const ok = window.confirm(
      "Limpar início/término real e avanço de TODAS as atividades deste tanque, voltando o status para Programado? " +
        "Também recaptura a baseline a partir das datas planejadas atuais (para um novo ciclo de manutenção, " +
        "não faz sentido medir desvio contra o ciclo anterior) — as datas planejadas em si não mudam."
    );
    if (!ok) return;
    resetTankExecution(tank.id);
    flashSaved();
  }

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brava-border px-6 py-5 sm:px-7">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brava-blue">Edição</p>
          <h2 className="text-[17px] font-bold tracking-tight text-brava-blue-dark sm:text-[19px]">
            Planejamento das Atividades
          </h2>
          <p className="mt-1 text-[13px] text-brava-text-secondary">
            {editing
              ? "Altere datas, durações, datas reais ou avanço — cronograma e status (da etapa e do tanque) são recalculados automaticamente."
              : "Sequência de atividades e dependências do tanque."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedPulse && (
            <span className="flex items-center gap-1 text-[12px] font-medium text-brava-success">
              <Check className="h-3.5 w-3.5" /> Atualizado
            </span>
          )}
          {editing && (
            <select
              value={tank.status}
              onChange={(e) => {
                updateTankMeta(tank.id, { status: e.target.value as TankStatus });
                flashSaved();
              }}
              className="rounded-brava-sm border border-brava-border bg-brava-white px-2 py-1.5 text-[12px] text-brava-text focus:border-brava-blue focus:outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => {
              if (!editing && !requireEditor()) return;
              setEditing((v) => !v);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-brava-sm border px-3 py-1.5 text-[12px] font-semibold transition-colors",
              editing
                ? "border-brava-blue bg-brava-blue text-brava-white"
                : "border-brava-border bg-brava-white text-brava-blue hover:border-brava-blue/40 hover:bg-brava-bg"
            )}
          >
            {editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            {editing ? "Concluir Edição" : "Editar Planejamento"}
          </button>
        </div>
      </div>

      <div className="brava-scrollbar overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-brava-border text-left text-[10.5px] uppercase tracking-wide text-brava-text-secondary">
              <th className="px-6 py-2.5 font-medium">Atividade</th>
              <th className="px-3 py-2.5 font-medium">Início Planejado</th>
              <th className="px-3 py-2.5 font-medium">Duração</th>
              <th className="px-3 py-2.5 font-medium">Término Planejado</th>
              <th className="px-3 py-2.5 font-medium">Início Real</th>
              <th className="px-3 py-2.5 font-medium">Término Real</th>
              <th className="px-3 py-2.5 font-medium">Avanço</th>
              <th className="px-3 py-2.5 font-medium">Status (automático)</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((activity) => (
              <tr key={activity.id} className="border-b border-brava-border/70 last:border-0">
                <td className="px-6 py-2.5 font-medium text-brava-text">
                  {activity.name}
                  {activity.isMilestone && (
                    <span className="ml-1.5 rounded-full bg-brava-blue/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-brava-blue">
                      Marco
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {editing ? (
                    <input
                      type="date"
                      value={activity.plannedStart}
                      onChange={(e) => {
                        updateActivity(tank.id, activity.id, { plannedStart: e.target.value });
                        flashSaved();
                      }}
                      className="w-[136px] rounded-brava-sm border border-brava-border px-1.5 py-1 text-[12px] focus:border-brava-blue focus:outline-none"
                    />
                  ) : (
                    formatShort(activity.plannedStart)
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {editing ? (
                    <input
                      type="number"
                      min={1}
                      value={activity.durationDays}
                      onChange={(e) => {
                        updateActivity(tank.id, activity.id, {
                          durationDays: Number(e.target.value) || 1,
                        });
                        flashSaved();
                      }}
                      className="w-16 rounded-brava-sm border border-brava-border px-1.5 py-1 text-[12px] focus:border-brava-blue focus:outline-none"
                    />
                  ) : (
                    `${activity.durationDays}d`
                  )}
                </td>
                <td className="px-3 py-2.5 text-brava-text-secondary">{formatShort(activity.plannedEnd)}</td>
                <td className="px-3 py-2.5">
                  {editing ? (
                    <input
                      type="date"
                      value={activity.actualStart ?? ""}
                      onChange={(e) => {
                        // An emptied date input sends "" — the server treats that as an explicit clear, not a no-op.
                        updateActivity(tank.id, activity.id, { actualStart: e.target.value });
                        flashSaved();
                      }}
                      className="w-[136px] rounded-brava-sm border border-brava-border px-1.5 py-1 text-[12px] focus:border-brava-blue focus:outline-none"
                    />
                  ) : (
                    activity.actualStart ? formatShort(activity.actualStart) : "—"
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {editing ? (
                    <input
                      type="date"
                      value={activity.actualEnd ?? ""}
                      onChange={(e) => {
                        updateActivity(tank.id, activity.id, { actualEnd: e.target.value });
                        flashSaved();
                      }}
                      className="w-[136px] rounded-brava-sm border border-brava-border px-1.5 py-1 text-[12px] focus:border-brava-blue focus:outline-none"
                    />
                  ) : (
                    activity.actualEnd ? formatShort(activity.actualEnd) : "—"
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {editing ? (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={activity.progress}
                      onChange={(e) => {
                        updateActivity(tank.id, activity.id, {
                          progress: Math.max(0, Math.min(100, Number(e.target.value))),
                        });
                        flashSaved();
                      }}
                      className="w-16 rounded-brava-sm border border-brava-border px-1.5 py-1 text-[12px] focus:border-brava-blue focus:outline-none"
                    />
                  ) : (
                    `${activity.progress}%`
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <ActivityStatusTag status={activity.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brava-border px-6 py-3 text-[11px] text-brava-text-secondary">
          <span className="flex items-center gap-1.5">
            <RotateCcw className="h-3 w-3" />
            As dependências entre atividades recalculam automaticamente as datas seguintes.
          </span>
          <button
            type="button"
            onClick={handleResetExecution}
            className="flex items-center gap-1.5 rounded-brava-sm border border-brava-border px-2.5 py-1.5 text-[11px] font-semibold text-brava-text-secondary transition-colors hover:border-brava-danger/40 hover:text-brava-danger"
          >
            <Eraser className="h-3.5 w-3.5" />
            Resetar Execução (voltar para Programado)
          </button>
        </div>
      )}
    </div>
  );
}

function ActivityStatusTag({ status }: { status: ActivityStatus }) {
  return (
    <span className={cn("text-[11.5px] font-medium", ACTIVITY_STATUS_COLOR[status])}>
      {ACTIVITY_STATUS_LABEL[status] ?? status}
    </span>
  );
}
