import HeroExecutive from "@/components/brava/HeroExecutive";
import KpiRow from "@/components/brava/KpiRow";
import InspectionSummary from "@/components/brava/InspectionSummary";
import AttentionPanel from "@/components/brava/AttentionPanel";
import DeadlinesPanel from "@/components/brava/DeadlinesPanel";
import FeaturedTankCard from "@/components/brava/FeaturedTankCard";
import ProgramOverviewMini from "@/components/brava/ProgramOverviewMini";
import TankControlGrid from "@/components/brava/TankControlGrid";
import MaterialsHomeSummary from "@/components/brava/materials/MaterialsHomeSummary";

export default function BravaOverviewPage() {
  return (
    <>
      <HeroExecutive />
      <div className="space-y-10 px-5 py-8 sm:px-8 sm:py-10 lg:space-y-12">
        <KpiRow />
        <AttentionPanel />
        <MaterialsHomeSummary />
        <InspectionSummary />
        <FeaturedTankCard />
        <DeadlinesPanel />
        <ProgramOverviewMini />
        <TankControlGrid />
      </div>
    </>
  );
}
