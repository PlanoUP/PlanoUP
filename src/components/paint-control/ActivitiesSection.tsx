"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { Activity, Priority, ActivityStatus } from "@/types/paint-control";
import { ACTIVITY_STATUSES, PRIORITIES } from "@/types/paint-control";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { isCritical, isOverdue, priorityComparator } from "@/lib/paint-control/calculations";
import { PRIORITY_LABELS } from "@/lib/paint-control/constants";
import { exportActivityToExcel } from "@/lib/paint-control/excelExport";
import SearchInput from "@/components/paint-control/SearchInput";
import ActivitiesTable from "@/components/paint-control/ActivitiesTable";
import ActivityFormPanel from "@/components/paint-control/ActivityFormPanel";
import ConfirmDialog from "@/components/paint-control/ConfirmDialog";
import type { NewActivityInput } from "@/lib/paint-control/store";

export default function ActivitiesSection({
  activities,
  showUnitColumn = false,
  showUnitFilter = false,
  defaultUnitId,
  newButtonLabel = "Novo Serviço de Pintura",
}: {
  activities: Activity[];
  showUnitColumn?: boolean;
  showUnitFilter?: boolean;
  defaultUnitId?: string;
  newButtonLabel?: string;
}) {
  const units = usePaintControlStore((s) => s.units);
  const responsibles = usePaintControlStore((s) => s.responsibles);
  const addActivity = usePaintControlStore((s) => s.addActivity);
  const updateActivity = usePaintControlStore((s) => s.updateActivity);
  const deleteActivity = usePaintControlStore((s) => s.deleteActivity);

  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "">("");
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [neededBefore, setNeededBefore] = useState("");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [onlyCritical, setOnlyCritical] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activities
      .filter((a) => {
        if (q && !`${a.tag} ${a.title} ${a.local}`.toLowerCase().includes(q)) return false;
        if (unitFilter && a.unitId !== unitFilter) return false;
        if (priorityFilter && a.priority !== priorityFilter) return false;
        if (statusFilter && a.status !== statusFilter) return false;
        if (responsibleFilter && a.responsibleId !== responsibleFilter) return false;
        if (neededBefore && (!a.neededDate || a.neededDate > neededBefore)) return false;
        if (onlyOverdue && !isOverdue(a)) return false;
        if (onlyCritical && !isCritical(a)) return false;
        return true;
      })
      .sort(priorityComparator);
  }, [
    activities,
    search,
    unitFilter,
    priorityFilter,
    statusFilter,
    responsibleFilter,
    neededBefore,
    onlyOverdue,
    onlyCritical,
  ]);

  function openCreate() {
    setEditingActivity(null);
    setFormOpen(true);
  }

  function openEdit(activity: Activity) {
    setEditingActivity(activity);
    setFormOpen(true);
  }

  function handleSubmit(payload: NewActivityInput) {
    if (editingActivity) {
      updateActivity(editingActivity.id, payload);
    } else {
      addActivity(payload);
    }
  }

  async function handleExport(activity: Activity) {
    const unit = units.find((u) => u.id === activity.unitId);
    if (!unit) return;
    const responsible = responsibles.find((r) => r.id === activity.responsibleId) ?? null;
    try {
      await exportActivityToExcel(activity, unit, responsible);
    } catch (error) {
      console.error("Falha ao exportar atividade para Excel", error);
    }
  }

  const selectClass =
    "rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 outline-none focus:border-slate-400";

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por TAG, serviço ou local..."
            className="lg:max-w-xs"
          />
          <button
            onClick={openCreate}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            {newButtonLabel}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showUnitFilter && (
            <select className={selectClass} value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)}>
              <option value="">Todas as unidades</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.tag}
                </option>
              ))}
            </select>
          )}
          <select
            className={selectClass}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | "")}
          >
            <option value="">Todas as prioridades</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ActivityStatus | "")}
          >
            <option value="">Todos os status</option>
            {ACTIVITY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={responsibleFilter}
            onChange={(e) => setResponsibleFilter(e.target.value)}
          >
            <option value="">Todos os responsáveis</option>
            {responsibles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            Necessária até
            <input
              type="date"
              className={selectClass}
              value={neededBefore}
              onChange={(e) => setNeededBefore(e.target.value)}
            />
          </label>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setOnlyCritical((v) => !v)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                onlyCritical
                  ? "border-slate-900 bg-slate-900 text-accent"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              Críticos
            </button>
            <button
              onClick={() => setOnlyOverdue((v) => !v)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                onlyOverdue
                  ? "border-rose-600 bg-rose-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              Atrasados
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ActivitiesTable
          activities={filtered}
          units={units}
          responsibles={responsibles}
          showUnitColumn={showUnitColumn}
          onEdit={openEdit}
          onRequestDelete={setDeletingActivity}
          onExport={handleExport}
        />
      </div>

      <ActivityFormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        activity={editingActivity}
        defaultUnitId={defaultUnitId}
        units={units}
        responsibles={responsibles}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deletingActivity)}
        title="Excluir serviço de pintura?"
        description={
          deletingActivity
            ? `Esta ação removerá "${deletingActivity.title || deletingActivity.tag}" permanentemente.`
            : undefined
        }
        confirmLabel="Excluir"
        danger
        onCancel={() => setDeletingActivity(null)}
        onConfirm={() => {
          if (deletingActivity) deleteActivity(deletingActivity.id);
          setDeletingActivity(null);
        }}
      />
    </div>
  );
}
