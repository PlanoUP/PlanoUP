"use client";

import { useBravaData } from "@/lib/brava/context";
import { filterTanks } from "@/lib/brava/selectors";
import { sortByInspectionPriority } from "@/lib/brava/inspection";
import TankCard from "./TankCard";
import FilterBar from "./FilterBar";
import FamilyFilterBar from "./FamilyFilterBar";
import SectionHeading from "./SectionHeading";

const FAMILY_TITLES: Record<string, string> = {
  CRITICIDADE: "Tank Control — Criticidade das Inspeções",
  "410": "Tancagem 410",
  "6313": "Tancagem 6313",
  "270": "Tancagem 270",
};

export default function TankControlGrid() {
  const { tanks, filter, familyView } = useBravaData();
  const byStatusAndSearch = filterTanks(tanks, filter);
  const byFamily =
    familyView === "CRITICIDADE"
      ? byStatusAndSearch
      : byStatusAndSearch.filter((t) => t.derived.family === familyView);
  const filtered = sortByInspectionPriority(byFamily);

  return (
    <section id="tank-control" className="scroll-mt-24">
      <div className="mb-4">
        <FamilyFilterBar />
      </div>
      <SectionHeading
        eyebrow="Operação"
        title={FAMILY_TITLES[familyView]}
        subtitle={`${filtered.length} de ${tanks.length} tanques · ordenado pela próxima inspeção interna`}
        actions={<FilterBar />}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-brava-lg border border-dashed border-brava-border py-16 text-center">
          <p className="text-[13px] font-medium text-brava-text">Nenhum tanque encontrado</p>
          <p className="text-[12px] text-brava-text-secondary">Ajuste a pesquisa ou os filtros aplicados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tank) => (
            <TankCard key={tank.id} tank={tank} />
          ))}
        </div>
      )}
    </section>
  );
}
