import PageHeader from "@/components/brava/PageHeader";
import EquipmentConsolidatedGantt from "@/components/brava/units/EquipmentConsolidatedGantt";

export default function UnidadesConsolidatedPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Unidades de Processo", href: "/brava/unidades" }, { label: "Consolidado" }]}
        title="Visão Consolidada"
        subtitle="Comparação dos cronogramas de todos os equipamentos — identifique sobreposições e períodos críticos"
      />
      <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
        <EquipmentConsolidatedGantt />
      </div>
    </>
  );
}
