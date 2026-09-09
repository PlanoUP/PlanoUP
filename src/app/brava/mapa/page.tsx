"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/brava/PageHeader";
import AssetMapExplorer from "@/components/brava/maps/AssetMapExplorer";

function MapaContent() {
  const params = useSearchParams();
  const tank = params.get("tank") ?? undefined;
  return <AssetMapExplorer initialTag={tank} />;
}

export default function MapaPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Visão Geral", href: "/brava" }, { label: "Mapa" }]}
        title="Mapa Interativo de Ativos"
        subtitle="Navegação geográfica e acompanhamento das tancagens do Ativo Industrial de Guamaré."
      />
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <Suspense fallback={null}>
          <MapaContent />
        </Suspense>
      </div>
    </>
  );
}
