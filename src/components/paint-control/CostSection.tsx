"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { CostCategory, CostItem } from "@/types/paint-control";
import { COST_CATEGORIES } from "@/types/paint-control";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { exportCostItemToExcel } from "@/lib/paint-control/excelExport";
import SearchInput from "@/components/paint-control/SearchInput";
import CostTable from "@/components/paint-control/CostTable";
import CostFormPanel from "@/components/paint-control/CostFormPanel";
import ConfirmDialog from "@/components/paint-control/ConfirmDialog";
import type { NewCostItemInput } from "@/lib/paint-control/store";

export default function CostSection() {
  const items = usePaintControlStore((s) => s.costItems);
  const addCostItem = usePaintControlStore((s) => s.addCostItem);
  const updateCostItem = usePaintControlStore((s) => s.updateCostItem);
  const deleteCostItem = usePaintControlStore((s) => s.deleteCostItem);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CostCategory | "">("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CostItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<CostItem | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((item) => {
        if (q && !`${item.name} ${item.regime}`.toLowerCase().includes(q)) return false;
        if (categoryFilter && item.category !== categoryFilter) return false;
        return true;
      })
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }, [items, search, categoryFilter]);

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(item: CostItem) {
    setEditingItem(item);
    setFormOpen(true);
  }

  function handleSubmit(payload: NewCostItemInput) {
    if (editingItem) {
      updateCostItem(editingItem.id, payload);
    } else {
      addCostItem(payload);
    }
  }

  async function handleExport(item: CostItem) {
    try {
      await exportCostItemToExcel(item);
    } catch (error) {
      console.error("Falha ao exportar item de custo para Excel", error);
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
            placeholder="Buscar por item ou regime..."
            className="lg:max-w-xs"
          />
          <button
            onClick={openCreate}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Novo Item de Custo
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className={selectClass}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CostCategory | "")}
          >
            <option value="">Todas as categorias</option>
            {COST_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <CostTable
          items={filtered}
          onEdit={openEdit}
          onRequestDelete={setDeletingItem}
          onExport={handleExport}
        />
      </div>

      <CostFormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        item={editingItem}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deletingItem)}
        title="Excluir item de custo?"
        description={
          deletingItem ? `Esta ação removerá "${deletingItem.name}" permanentemente.` : undefined
        }
        confirmLabel="Excluir"
        danger
        onCancel={() => setDeletingItem(null)}
        onConfirm={() => {
          if (deletingItem) deleteCostItem(deletingItem.id);
          setDeletingItem(null);
        }}
      />
    </div>
  );
}
