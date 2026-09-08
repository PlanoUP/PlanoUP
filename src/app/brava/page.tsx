import PageHeader from "@/components/brava/PageHeader";
import KpiRow from "@/components/brava/KpiRow";
import TankControlGrid from "@/components/brava/TankControlGrid";

export default function BravaOverviewPage() {
  return (
    <>
      <PageHeader
        title="Central de Controle — Tanques"
        subtitle="Visão executiva do programa de manutenção de tanques industriais"
      />
      <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
        <KpiRow />
        <TankControlGrid />
      </div>
    </>
  );
}
