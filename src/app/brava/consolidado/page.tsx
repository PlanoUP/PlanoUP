import PageHeader from "@/components/brava/PageHeader";
import UpcomingInspectionsTimeline from "@/components/brava/UpcomingInspectionsTimeline";
import ConsolidatedGantt from "@/components/brava/ConsolidatedGantt";

export default function ConsolidatedPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Visão Geral", href: "/brava" }, { label: "Consolidado" }]}
        title="Visão Consolidada"
        subtitle="Comparação dos cronogramas de todos os tanques — identifique sobreposições e períodos críticos"
      />
      <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
        <UpcomingInspectionsTimeline />
        <ConsolidatedGantt />
      </div>
    </>
  );
}
