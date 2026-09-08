import HeroExecutive from "@/components/brava/HeroExecutive";
import KpiRow from "@/components/brava/KpiRow";
import FeaturedTankCard from "@/components/brava/FeaturedTankCard";
import UpcomingMilestones from "@/components/brava/UpcomingMilestones";
import ProgramOverviewMini from "@/components/brava/ProgramOverviewMini";
import TankControlGrid from "@/components/brava/TankControlGrid";

export default function BravaOverviewPage() {
  return (
    <>
      <HeroExecutive />
      <div className="space-y-10 px-5 py-8 sm:px-8 sm:py-10 lg:space-y-12">
        <KpiRow />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <FeaturedTankCard />
          <UpcomingMilestones />
        </div>

        <ProgramOverviewMini />
        <TankControlGrid />
      </div>
    </>
  );
}
