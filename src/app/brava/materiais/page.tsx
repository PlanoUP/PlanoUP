"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "@/components/brava/PageHeader";
import { useBravaData } from "@/lib/brava/context";
import { useMaterialsData } from "@/lib/brava/materials/context";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import { Material, MaterialsQuickFilter, MaterialsSortKey } from "@/lib/brava/materials/types";
import { filterMaterials, sortMaterialsByColumn } from "@/lib/brava/materials/calculations";
import MaterialsKpiRow from "@/components/brava/materials/MaterialsKpiRow";
import MaterialsFilterBar from "@/components/brava/materials/MaterialsFilterBar";
import MaterialsTable from "@/components/brava/materials/MaterialsTable";
import UpcomingMaterialNeeds from "@/components/brava/materials/UpcomingMaterialNeeds";
import MaterialsAtRisk from "@/components/brava/materials/MaterialsAtRisk";
import MaterialFormDrawer from "@/components/brava/materials/MaterialFormDrawer";
import MaterialDetailDrawer from "@/components/brava/materials/MaterialDetailDrawer";

export default function MaterialsPage() {
  const { tanks, today } = useBravaData();
  const { materials } = useMaterialsData();
  const { requireEditor } = useEditAuth();

  const [quickFilter, setQuickFilter] = useState<MaterialsQuickFilter>("TODOS");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<MaterialsSortKey>("PADRAO");

  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | undefined>(undefined);
  const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null);

  const tankTagById = useMemo(() => Object.fromEntries(tanks.map((t) => [t.id, t.tag])), [tanks]);

  const filtered = useMemo(
    () => filterMaterials(materials, { quickFilter, search, tankTagById }, today),
    [materials, quickFilter, search, tankTagById, today]
  );
  const sorted = useMemo(
    () => sortMaterialsByColumn(filtered, sortKey, today, tankTagById),
    [filtered, sortKey, today, tankTagById]
  );

  function openCreate() {
    if (!requireEditor()) return;
    setEditingMaterial(undefined);
    setFormOpen(true);
  }

  function openEdit(m: Material) {
    if (!requireEditor()) return;
    setEditingMaterial(m);
    setFormOpen(true);
  }

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Visão Geral", href: "/brava" }, { label: "Materiais" }]}
        title="Material Control"
        subtitle="Central de controle de materiais das manutenções — integrada ao planejamento de cada tanque"
        actions={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-brava-sm bg-brava-blue px-3.5 py-2 text-[12.5px] font-semibold text-brava-white transition-colors hover:bg-brava-blue-dark"
          >
            <Plus className="h-3.5 w-3.5" />
            Cadastrar Material
          </button>
        }
      />

      <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
        <MaterialsKpiRow />
        <UpcomingMaterialNeeds materials={materials} today={today} />
        <MaterialsAtRisk materials={materials} />

        <div>
          <MaterialsFilterBar
            quickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
            search={search}
            onSearchChange={setSearch}
          />
          <div className="mt-4">
            <MaterialsTable
              materials={sorted}
              sortKey={sortKey}
              onSortKeyChange={setSortKey}
              onView={setViewingMaterial}
              onEdit={openEdit}
            />
          </div>
        </div>
      </div>

      <MaterialFormDrawer open={formOpen} onClose={() => setFormOpen(false)} material={editingMaterial} />
      <MaterialDetailDrawer open={!!viewingMaterial} onClose={() => setViewingMaterial(null)} material={viewingMaterial} />
    </>
  );
}
