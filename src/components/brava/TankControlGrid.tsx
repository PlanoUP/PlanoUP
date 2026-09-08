"use client";

import { useBravaData } from "@/lib/brava/context";
import { filterTanks } from "@/lib/brava/selectors";
import TankCard from "./TankCard";
import FilterBar from "./FilterBar";

export default function TankControlGrid() {
  const { tanks, filter } = useBravaData();
  const filtered = filterTanks(tanks, filter);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-brava-blue-dark">
            Tank Control
          </h2>
          <p className="text-[12px] text-brava-text-secondary">
            {filtered.length} de {tanks.length} tanques
          </p>
        </div>

        <FilterBar />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-brava-md border border-dashed border-brava-border py-16 text-center">
          <p className="text-[13px] font-medium text-brava-text">Nenhum tanque encontrado</p>
          <p className="text-[12px] text-brava-text-secondary">Ajuste a pesquisa ou os filtros aplicados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tank) => (
            <TankCard key={tank.id} tank={tank} />
          ))}
        </div>
      )}
    </section>
  );
}
