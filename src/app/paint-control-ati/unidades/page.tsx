"use client";

import { usePaintControlStore } from "@/lib/paint-control/store";
import PageHeader from "@/components/paint-control/PageHeader";
import UnitsGrid from "@/components/paint-control/UnitsGrid";

export default function UnidadesPage() {
  const units = usePaintControlStore((s) => s.units);
  const activities = usePaintControlStore((s) => s.activities);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="ATI Guamaré"
        title="Unidades"
        description={`${units.length} unidades/áreas do Ativo Industrial — selecione uma para ver seu mapa de atividades de pintura.`}
      />
      <UnitsGrid units={units} activities={activities} />
    </div>
  );
}
