"use client";

import { useBravaData } from "@/lib/brava/context";
import { filterTanks } from "@/lib/brava/selectors";
import TankCard from "./TankCard";
import FilterBar from "./FilterBar";
import SectionHeading from "./SectionHeading";

const TANK_CONTROL_STATUS_OPTIONS = ["TODOS", "EM_EXECUCAO", "PROGRAMADO"] as const;
// Lower order number sorts first: tanks already being worked on are more
// immediately relevant than ones merely scheduled.
const STATUS_SORT_ORDER: Record<string, number> = { EM_EXECUCAO: 0, ATRASADO: 0, CRITICO: 0, PROGRAMADO: 1 };

export default function TankControlGrid() {
  const { tanks, filter } = useBravaData();
  // Tank Control only tracks tanks with a real, confirmed maintenance plan
  // this cycle — CONCLUIDO (done, has its own dashboard page) and
  // SEM_PROJETO (no confirmed plan, just an inspection-inventory record)
  // don't belong in active progress control.
  const activeTanks = tanks.filter((t) => t.status !== "CONCLUIDO" && t.status !== "SEM_PROJETO");
  const filtered = filterTanks(activeTanks, filter)
    .slice()
    .sort((a, b) => {
      const byStatus = (STATUS_SORT_ORDER[a.status] ?? 1) - (STATUS_SORT_ORDER[b.status] ?? 1);
      return byStatus !== 0 ? byStatus : a.tag.localeCompare(b.tag);
    });

  return (
    <section id="tank-control" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Operação"
        title="Tank Control"
        subtitle={`${filtered.length} de ${activeTanks.length} tanques em manutenção · status e avanço atuais`}
        actions={<FilterBar statusOptions={[...TANK_CONTROL_STATUS_OPTIONS]} />}
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
