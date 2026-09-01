"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { Priority, ActivityStatus, RevitalizationItem } from "@/types/paint-control";
import { ACTIVITY_STATUSES, PRIORITIES } from "@/types/paint-control";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { useAuthStore } from "@/lib/paint-control/authStore";
import { isOverdue, priorityComparator } from "@/lib/paint-control/calculations";
import { PRIORITY_LABELS } from "@/lib/paint-control/constants";
import { exportRevitalizationToExcel } from "@/lib/paint-control/excelExport";
import SearchInput from "@/components/paint-control/SearchInput";
import RevitalizationTable from "@/components/paint-control/RevitalizationTable";
import RevitalizationFormPanel from "@/components/paint-control/RevitalizationFormPanel";
import ConfirmDialog from "@/components/paint-control/ConfirmDialog";
import type { NewRevitalizationInput } from "@/lib/paint-control/store";

export default function RevitalizationSection() {
  const items = usePaintControlStore((s) => s.revitalizationItems);
  const responsibles = usePaintControlStore((s) => s.responsibles);
  const addRevitalizationItem = usePaintControlStore((s) => s.addRevitalizationItem);
  const updateRevitalizationItem = usePaintControlStore((s) => s.updateRevitalizationItem);
  const deleteRevitalizationItem = usePaintControlStore((s) => s.deleteRevitalizationItem);
  const requireEditor = useAuthStore((s) => s.requireEditor);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | "">("");
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RevitalizationItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<RevitalizationItem | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((item) => {
        if (q && !`${item.area} ${item.title}`.toLowerCase().includes(q)) return false;
        if (priorityFilter && item.priority !== priorityFilter) return false;
        if (statusFilter && item.status !== statusFilter) return false;
        if (responsibleFilter && item.responsibleId !== responsibleFilter) return false;
        if (onlyOverdue && !isOverdue(item)) return false;
        return true;
      })
      .sort(priorityComparator);
  }, [items, search, priorityFilter, statusFilter, responsibleFilter, onlyOverdue]);

  function openCreate() {
    if (!requireEditor()) return;
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(item: RevitalizationItem) {
    if (!requireEditor()) return;
    setEditingItem(item);
    setFormOpen(true);
  }

  function requestDelete(item: RevitalizationItem) {
    if (!requireEditor()) return;
    setDeletingItem(item);
  }

  function handleSubmit(payload: NewRevitalizationInput) {
    if (editingItem) {
      updateRevitalizationItem(editingItem.id, payload);
    } else {
      addRevitalizationItem(payload);
    }
  }

  async function handleExport(item: RevitalizationItem) {
    const responsible = responsibles.find((r) => r.id === item.responsibleId) ?? null;
    try {
      await exportRevitalizationToExcel(item, responsible);
    } catch (error) {
      console.error("Falha ao exportar item de revitalização para Excel", error);
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
            placeholder="Buscar por área ou serviço..."
            className="lg:max-w-xs"
          />
          <button
            onClick={openCreate}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Novo Item de Revitalização
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <div className="ml-auto">
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
        <RevitalizationTable
          items={filtered}
          responsibles={responsibles}
          onEdit={openEdit}
          onRequestDelete={requestDelete}
          onExport={handleExport}
        />
      </div>

      <RevitalizationFormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        item={editingItem}
        responsibles={responsibles}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deletingItem)}
        title="Excluir item de revitalização?"
        description={
          deletingItem
            ? `Esta ação removerá "${deletingItem.title || deletingItem.area}" permanentemente.`
            : undefined
        }
        confirmLabel="Excluir"
        danger
        onCancel={() => setDeletingItem(null)}
        onConfirm={() => {
          if (deletingItem) deleteRevitalizationItem(deletingItem.id);
          setDeletingItem(null);
        }}
      />
    </div>
  );
}
