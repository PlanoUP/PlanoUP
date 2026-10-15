"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "@/components/brava/PageHeader";
import { useUnitsData } from "@/lib/brava/units/context";
import { useEquipmentMaterialsData } from "@/lib/brava/units/materials/context";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import { EquipmentMaterial, EquipmentMaterialsQuickFilter, EquipmentMaterialsSortKey } from "@/lib/brava/units/materials/types";
import { filterMaterials, sortMaterialsByColumn } from "@/lib/brava/units/materials/calculations";
import EquipmentMaterialsKpiRow from "@/components/brava/units/materials/EquipmentMaterialsKpiRow";
import EquipmentMaterialsFilterBar from "@/components/brava/units/materials/EquipmentMaterialsFilterBar";
import EquipmentMaterialsTable from "@/components/brava/units/materials/EquipmentMaterialsTable";
import UpcomingEquipmentMaterialNeeds from "@/components/brava/units/materials/UpcomingEquipmentMaterialNeeds";
import EquipmentMaterialsAtRisk from "@/components/brava/units/materials/EquipmentMaterialsAtRisk";
import EquipmentMaterialFormDrawer from "@/components/brava/units/materials/EquipmentMaterialFormDrawer";
import EquipmentMaterialDetailDrawer from "@/components/brava/units/materials/EquipmentMaterialDetailDrawer";

export default function EquipmentMaterialsPage() {
  const { equipment, today } = useUnitsData();
  const { materials } = useEquipmentMaterialsData();
  const { requireEditor } = useEditAuth();

  const [quickFilter, setQuickFilter] = useState<EquipmentMaterialsQuickFilter>("TODOS");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<EquipmentMaterialsSortKey>("PADRAO");

  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<EquipmentMaterial | undefined>(undefined);
  const [viewingMaterial, setViewingMaterial] = useState<EquipmentMaterial | null>(null);

  const equipmentTagById = useMemo(() => Object.fromEntries(equipment.map((e) => [e.id, e.tag])), [equipment]);

  const filtered = useMemo(
    () => filterMaterials(materials, { quickFilter, search, equipmentTagById }, today),
    [materials, quickFilter, search, equipmentTagById, today]
  );
  const sorted = useMemo(
    () => sortMaterialsByColumn(filtered, sortKey, today, equipmentTagById),
    [filtered, sortKey, today, equipmentTagById]
  );

  function openCreate() {
    if (!requireEditor()) return;
    setEditingMaterial(undefined);
    setFormOpen(true);
  }

  function openEdit(m: EquipmentMaterial) {
    if (!requireEditor()) return;
    setEditingMaterial(m);
    setFormOpen(true);
  }

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Unidades de Processo", href: "/brava/unidades" }, { label: "Materiais" }]}
        title="Material Control"
        subtitle="Central de controle de materiais das paradas — integrada ao planejamento de cada equipamento"
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
        <EquipmentMaterialsKpiRow />
        <UpcomingEquipmentMaterialNeeds materials={materials} today={today} />
        <EquipmentMaterialsAtRisk materials={materials} />

        <div>
          <EquipmentMaterialsFilterBar
            quickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
            search={search}
            onSearchChange={setSearch}
          />
          <div className="mt-4">
            <EquipmentMaterialsTable
              materials={sorted}
              sortKey={sortKey}
              onSortKeyChange={setSortKey}
              onView={setViewingMaterial}
              onEdit={openEdit}
            />
          </div>
        </div>
      </div>

      <EquipmentMaterialFormDrawer open={formOpen} onClose={() => setFormOpen(false)} material={editingMaterial} />
      <EquipmentMaterialDetailDrawer open={!!viewingMaterial} onClose={() => setViewingMaterial(null)} material={viewingMaterial} />
    </>
  );
}
