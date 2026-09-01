"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Pencil, FileDown, Trash2, Check, History as HistoryIcon } from "lucide-react";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { useAuthStore } from "@/lib/paint-control/authStore";
import { EXECUTION_STEPS } from "@/types/paint-control";
import type { ActivityStatus } from "@/types/paint-control";
import { isOverdue } from "@/lib/paint-control/calculations";
import { formatArea, formatDate, formatDateTime } from "@/lib/paint-control/format";
import { exportActivityToExcel } from "@/lib/paint-control/excelExport";
import PriorityBadge from "@/components/paint-control/PriorityBadge";
import StatusBadge from "@/components/paint-control/StatusBadge";
import ProgressBar from "@/components/paint-control/ProgressBar";
import OverdueTag from "@/components/paint-control/OverdueTag";
import EmptyState from "@/components/paint-control/EmptyState";
import ActivityFormPanel from "@/components/paint-control/ActivityFormPanel";
import ConfirmDialog from "@/components/paint-control/ConfirmDialog";
import type { NewActivityInput } from "@/lib/paint-control/store";

const MILESTONES = ["Solicitado", "Programado", "Liberado", "Em Execução", "Inspeção", "Concluído"];

const MILESTONE_INDEX: Record<ActivityStatus, number> = {
  Backlog: 0,
  "Aguardando Programação": 0,
  Programado: 1,
  "Aguardando Liberação": 1,
  Liberado: 2,
  "Em Execução": 3,
  Paralisado: 3,
  "Em Inspeção": 4,
  Concluído: 5,
  Cancelado: -1,
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-sm text-slate-800">{value || <span className="text-slate-400">—</span>}</span>
    </div>
  );
}

export default function ActivityDetailPage({ params }: { params: { activityId: string } }) {
  const router = useRouter();
  const units = usePaintControlStore((s) => s.units);
  const activities = usePaintControlStore((s) => s.activities);
  const responsibles = usePaintControlStore((s) => s.responsibles);
  const history = usePaintControlStore((s) => s.history);
  const updateActivity = usePaintControlStore((s) => s.updateActivity);
  const deleteActivity = usePaintControlStore((s) => s.deleteActivity);
  const requireEditor = useAuthStore((s) => s.requireEditor);

  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const activity = activities.find((a) => a.id === params.activityId);
  const unit = activity ? units.find((u) => u.id === activity.unitId) : undefined;
  const responsible = activity?.responsibleId
    ? responsibles.find((r) => r.id === activity.responsibleId)
    : null;

  const activityHistory = useMemo(
    () =>
      history
        .filter((h) => h.activityId === params.activityId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [history, params.activityId]
  );

  if (!activity || !unit) {
    return (
      <EmptyState
        title="Serviço não encontrado"
        description="Este serviço pode ter sido excluído. Volte para a lista de atividades."
        action={
          <Link
            href="/paint-control-ati/atividades"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-accent hover:bg-slate-800"
          >
            Voltar para Atividades
          </Link>
        }
      />
    );
  }

  const overdue = isOverdue(activity);
  const milestoneIndex = MILESTONE_INDEX[activity.status];

  function handleSubmit(payload: NewActivityInput) {
    updateActivity(activity!.id, payload);
  }

  async function handleExport() {
    if (!activity || !unit) return;
    try {
      await exportActivityToExcel(activity, unit, responsible ?? null);
    } catch (error) {
      console.error("Falha ao exportar atividade para Excel", error);
    }
  }

  function handleDelete() {
    deleteActivity(activity!.id);
    router.push(`/paint-control-ati/unidades/${unit!.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <Link href="/paint-control-ati" className="hover:text-slate-600">
          ATI
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/paint-control-ati/unidades/${unit.id}`} className="hover:text-slate-600">
          {unit.tag}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-600">{activity.tag || "Serviço"}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {activity.tag || "Sem TAG"} · {unit.tag}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
            {activity.title || "Sem título"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PriorityBadge priority={activity.priority} />
            <StatusBadge status={activity.status} />
            {overdue && <OverdueTag />}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => {
              if (!requireEditor()) return;
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" />
            Exportar Excel
          </button>
          <button
            onClick={() => {
              if (!requireEditor()) return;
              setConfirmDelete(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Avanço físico</span>
          <span className="text-sm font-bold text-slate-900">{activity.progress}%</span>
        </div>
        <ProgressBar value={activity.progress} showLabel={false} />

        {activity.status === "Cancelado" ? (
          <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            Este serviço foi cancelado e não segue a linha do tempo padrão.
          </p>
        ) : (
          <div className="mt-6 flex items-center">
            {MILESTONES.map((milestone, i) => {
              const reached = i <= milestoneIndex;
              const isLast = i === MILESTONES.length - 1;
              return (
                <div key={milestone} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        reached
                          ? "border-slate-900 bg-slate-900 text-accent"
                          : "border-slate-200 bg-white text-slate-300"
                      }`}
                    >
                      {reached ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span
                      className={`text-center text-[11px] font-semibold ${
                        reached ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {milestone}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={`mx-1.5 h-0.5 flex-1 rounded ${i < milestoneIndex ? "bg-slate-900" : "bg-slate-200"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-1 text-sm font-bold text-slate-900">Informações do Serviço</h2>
          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0">
            <div className="flex flex-col divide-y divide-slate-100">
              <InfoRow label="Unidade" value={`${unit.tag} — ${unit.name}`} />
              <InfoRow label="Local / Área" value={activity.local} />
              <InfoRow label="Responsável" value={responsible?.name} />
              <InfoRow label="Área estimada" value={formatArea(activity.estimatedAreaM2)} />
              <InfoRow label="Data de solicitação" value={formatDate(activity.requestDate)} />
              <InfoRow label="Data necessária" value={formatDate(activity.neededDate)} />
              <InfoRow label="Data programada" value={formatDate(activity.programmedDate)} />
              <InfoRow label="Data de início real" value={formatDate(activity.actualStartDate)} />
              <InfoRow label="Data prevista de término" value={formatDate(activity.expectedEndDate)} />
              <InfoRow label="Data real de término" value={formatDate(activity.actualEndDate)} />
            </div>
            <div className="flex flex-col divide-y divide-slate-100 sm:pl-5">
              <InfoRow label="Tipo de superfície" value={activity.surfaceType} />
              <InfoRow label="Preparação de superfície" value={activity.surfacePreparation} />
              <InfoRow label="Sistema de pintura" value={activity.paintSystem} />
              <InfoRow label="Primer" value={activity.primer} />
              <InfoRow label="Tinta intermediária" value={activity.intermediateCoat} />
              <InfoRow label="Acabamento" value={activity.finishCoat} />
              <InfoRow label="Quantidade de demãos" value={activity.coatsCount ?? undefined} />
              <InfoRow label="OS" value={activity.workOrder} />
              <InfoRow label="Nota" value={activity.note} />
              <InfoRow label="Referência" value={activity.reference} />
            </div>
          </div>

          {activity.description && (
            <div className="mt-2 border-t border-slate-100 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Descrição</p>
              <p className="mt-1 text-sm text-slate-700">{activity.description}</p>
            </div>
          )}
          {activity.technicalNotes && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Observações técnicas
              </p>
              <p className="mt-1 text-sm text-slate-700">{activity.technicalNotes}</p>
            </div>
          )}
          {activity.impediment && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Impedimento</p>
              <p className="mt-0.5 text-sm text-amber-800">{activity.impediment}</p>
            </div>
          )}
          {activity.generalNotes && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Observações gerais
              </p>
              <p className="mt-1 text-sm text-slate-700">{activity.generalNotes}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-900">Etapas de Execução</h2>
            <ul className="flex flex-col gap-2.5">
              {EXECUTION_STEPS.map((step) => {
                const done = activity.completedSteps.includes(step.key);
                return (
                  <li key={step.key} className="flex items-center gap-2.5">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        done ? "bg-accent text-slate-900" : "bg-slate-100 text-slate-300"
                      }`}
                    >
                      {done && <Check className="h-3 w-3" />}
                    </span>
                    <span className={`text-sm ${done ? "text-slate-800" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <HistoryIcon className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900">Histórico</h2>
            </div>
            {activityHistory.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum registro de alteração ainda.</p>
            ) : (
              <ul className="flex flex-col gap-3.5">
                {activityHistory.map((entry) => (
                  <li key={entry.id} className="text-sm">
                    <p className="text-[11px] font-semibold text-slate-400">
                      {formatDateTime(entry.createdAt)}
                    </p>
                    <p className="mt-0.5 text-slate-700">{entry.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ActivityFormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        activity={activity}
        units={units}
        responsibles={responsibles}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir serviço de pintura?"
        description={`Esta ação removerá "${activity.title || activity.tag}" permanentemente.`}
        confirmLabel="Excluir"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
