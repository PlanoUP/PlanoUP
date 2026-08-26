"use client";

import { usePaintControlStore } from "@/lib/paint-control/store";
import PageHeader from "@/components/paint-control/PageHeader";
import ActivitiesSection from "@/components/paint-control/ActivitiesSection";

export default function AtividadesPage() {
  const activities = usePaintControlStore((s) => s.activities);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="ATI Guamaré"
        title="Atividades"
        description="Todos os serviços de pintura cadastrados, em todas as unidades do ATI."
      />
      <ActivitiesSection activities={activities} showUnitColumn showUnitFilter />
    </div>
  );
}
