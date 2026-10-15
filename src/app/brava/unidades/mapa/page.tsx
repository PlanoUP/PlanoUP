"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/brava/PageHeader";
import EquipmentMapExplorer from "@/components/brava/units/maps/EquipmentMapExplorer";

function MapaContent() {
  const params = useSearchParams();
  const tag = params.get("tag") ?? undefined;
  return <EquipmentMapExplorer initialTag={tag} />;
}

export default function UnidadesMapaPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Unidades de Processo", href: "/brava/unidades" }, { label: "Mapa" }]}
        title="Mapa Interativo de Ativos"
        subtitle="Navegação geográfica e acompanhamento dos equipamentos das unidades U-260 e U-270."
      />
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <Suspense fallback={null}>
          <MapaContent />
        </Suspense>
      </div>
    </>
  );
}
