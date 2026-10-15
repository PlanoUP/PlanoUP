import PageHeader from "@/components/brava/PageHeader";
import EquipmentKpiRow from "@/components/brava/units/EquipmentKpiRow";
import EquipmentMaterialsHomeSummary from "@/components/brava/units/materials/EquipmentMaterialsHomeSummary";
import UnitSummaryCards from "@/components/brava/units/UnitSummaryCards";
import EquipmentProgramOverviewMini from "@/components/brava/units/EquipmentProgramOverviewMini";
import EquipmentControlGrid from "@/components/brava/units/EquipmentControlGrid";

export default function UnidadesOverviewPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Unidades" }]}
        title="Unidades de Processo"
        subtitle="Acompanhamento de paradas e manutenções da U-260 e U-270"
      />

      <div className="space-y-10 px-5 py-8 sm:px-8 sm:py-10 lg:space-y-12">
        <EquipmentKpiRow />
        <EquipmentMaterialsHomeSummary />
        <UnitSummaryCards />
        <EquipmentProgramOverviewMini />
        <EquipmentControlGrid />
      </div>
    </>
  );
}
