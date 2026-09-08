"use client";

import { useState } from "react";
import { Pencil, Check, RotateCcw } from "lucide-react";
import { Tank, TankStatus } from "@/lib/brava/types";
import { useBravaData } from "@/lib/brava/context";
import { formatShort } from "@/lib/brava/date-utils";
import { STATUS_META } from "@/lib/brava/status-meta";
import { cn } from "@/lib/brava/cn";

const STATUS_OPTIONS: TankStatus[] = ["PROGRAMADO", "EM_EXECUCAO", "ATRASADO", "CRITICO", "CONCLUIDO"];

export default function PlanningEditor({ tank }: { tank: Tank }) {
  const { updateActivity, updateTankMeta } = useBravaData();
  const [editing, setEditing] = useState(false);
  const [savedPulse, setSavedPulse] = useState(false);
  const ordered = [...tank.activities].sort((a, b) => a.order - b.order);

  function flashSaved() {
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 1200);
  }

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brava-border px-6 py-4">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight text-brava-blue-dark">
            Planejamento das Atividades
          </h2>
          <p className="text-[12px] text-brava-text-secondary">
            {editing
              ? "Altere datas, durações ou avanço — o cronograma é recalculado automaticamente."
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
            onClick={() => setEditing((v) => !v)}
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
              <th className="px-3 py-2.5 font-medium">Avanço</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
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
        <div className="flex items-center justify-between border-t border-brava-border px-6 py-3 text-[11px] text-brava-text-secondary">
          <span className="flex items-center gap-1.5">
            <RotateCcw className="h-3 w-3" />
            As dependências entre atividades recalculam automaticamente as datas seguintes.
          </span>
        </div>
      )}
    </div>
  );
}

function ActivityStatusTag({ status }: { status: string }) {
  const map: Record<string, string> = {
    CONCLUIDO: "text-brava-success",
    ATUAL: "text-brava-blue",
    FUTURO: "text-brava-text-secondary",
    ATRASADO: "text-brava-warning",
  };
  const labels: Record<string, string> = {
    CONCLUIDO: "Concluído",
    ATUAL: "Em andamento",
    FUTURO: "Futuro",
    ATRASADO: "Atrasado",
  };
  return <span className={cn("text-[11.5px] font-medium", map[status])}>{labels[status] ?? status}</span>;
}
