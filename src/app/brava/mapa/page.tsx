"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AssetMapExplorer from "@/components/brava/maps/AssetMapExplorer";

function MapaContent() {
  const params = useSearchParams();
  const tank = params.get("tank") ?? undefined;
  return <AssetMapExplorer initialTag={tank} />;
}

export default function MapaPage() {
  return (
    <Suspense fallback={null}>
      <MapaContent />
    </Suspense>
  );
}
