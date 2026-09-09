import { Material } from "@/lib/brava/materials/types";
import { getUpcomingMaterialNeeds } from "@/lib/brava/materials/calculations";
import { cn } from "@/lib/brava/cn";
import SectionHeading from "../SectionHeading";

export default function UpcomingMaterialNeeds({ materials, today }: { materials: Material[]; today: string }) {
  const buckets = getUpcomingMaterialNeeds(materials, today);

  return (
    <div>
      <SectionHeading
        eyebrow="Planejamento de Suprimentos"
        title="Próximas Necessidades de Materiais"
        subtitle="Itens ainda não recebidos, agrupados pela proximidade da data de necessidade"
      />
      <div className="grid grid-cols-2 divide-y divide-brava-border rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm sm:grid-cols-5 sm:divide-y-0 sm:divide-x">
        {buckets.map((b) => (
          <div key={b.key} className="flex flex-col gap-1.5 px-5 py-4">
            <span
              className={cn(
                "text-[10.5px] font-bold uppercase tracking-wide",
                b.key === "ATRASADOS" ? "text-brava-danger" : "text-brava-text-secondary"
              )}
            >
              {b.label}
            </span>
            <span
              className={cn(
                "font-mono text-[26px] font-extrabold leading-none tracking-tight",
                b.key === "ATRASADOS" ? "text-brava-danger" : "text-brava-blue-dark"
              )}
            >
              {b.items.length}
            </span>
            <span className="text-[11px] text-brava-text-secondary">
              {b.items.length === 1 ? "item" : "itens"}
              {b.criticalCount > 0 && (
                <span className="ml-1 font-semibold text-brava-danger">· {b.criticalCount} crítico(s)</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
