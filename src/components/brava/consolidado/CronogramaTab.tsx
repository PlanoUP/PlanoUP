import UpcomingInspectionsTimeline from "@/components/brava/UpcomingInspectionsTimeline";
import ConsolidatedGantt from "@/components/brava/ConsolidatedGantt";

export default function CronogramaTab() {
  return (
    <div className="space-y-8">
      <UpcomingInspectionsTimeline />
      <ConsolidatedGantt />
    </div>
  );
}
