"use client";

import { useBravaData } from "@/lib/brava/context";
import { filterTanks } from "@/lib/brava/selectors";
import TankCard from "./TankCard";
import FilterBar from "./FilterBar";
import SectionHeading from "./SectionHeading";

export default function TankControlGrid() {
  const { tanks, filter } = useBravaData();
  const filtered = filterTanks(tanks, filter);

  return (
    <section id="tank-control" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Operação"
        title="Tank Control"
        subtitle={`${filtered.length} de ${tanks.length} tanques`}
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
