import HeroExecutive from "@/components/brava/HeroExecutive";
import KpiRow from "@/components/brava/KpiRow";
import ProgramOverviewMini from "@/components/brava/ProgramOverviewMini";
import TankControlGrid from "@/components/brava/TankControlGrid";
import MaterialsHomeSummary from "@/components/brava/materials/MaterialsHomeSummary";

// Atenção, Criticidade das Inspeções (InspectionSummary), Tanque Destaque
// (FeaturedTankCard) and Vencimentos (DeadlinesPanel) were removed from the
// overview — too many sections repeating/diluting the same handful of real
// tanks. Not deleted, just unused here for now: they'll get a better home
// once there's a clearer place for them.
export default function BravaOverviewPage() {
  return (
    <>
      <HeroExecutive />
      <div className="space-y-10 px-5 py-8 sm:px-8 sm:py-10 lg:space-y-12">
        <TankControlGrid />
        <ProgramOverviewMini />
        <KpiRow />
        <MaterialsHomeSummary />
      </div>
    </>
  );
}
