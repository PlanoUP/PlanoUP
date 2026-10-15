"use client";

import { useUnitsData } from "@/lib/brava/units/context";
import { filterEquipment } from "@/lib/brava/units/selectors";
import EquipmentCard from "./EquipmentCard";
import EquipmentFilterBar from "./EquipmentFilterBar";
import UnitFilterBar from "./UnitFilterBar";
import SectionHeading from "../SectionHeading";

export default function EquipmentControlGrid() {
  const { equipment, filter, unitView } = useUnitsData();
  const byStatusAndSearch = filterEquipment(equipment, filter);
  const byUnit = unitView === "TODAS" ? byStatusAndSearch : byStatusAndSearch.filter((e) => e.unit === unitView);
  const filtered = [...byUnit].sort((a, b) => a.tag.localeCompare(b.tag));

  return (
    <section id="equipment-control" className="scroll-mt-24">
      <div className="mb-4">
        <UnitFilterBar />
      </div>
      <SectionHeading
        eyebrow="Operação"
        title="Equipment Control"
        subtitle={`${filtered.length} de ${equipment.length} equipamentos`}
        actions={<EquipmentFilterBar />}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-brava-lg border border-dashed border-brava-border py-16 text-center">
          <p className="text-[13px] font-medium text-brava-text">Nenhum equipamento encontrado</p>
          <p className="text-[12px] text-brava-text-secondary">Ajuste a pesquisa ou os filtros aplicados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => (
            <EquipmentCard key={e.id} equipment={e} />
          ))}
        </div>
      )}
    </section>
  );
}
