"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { computeFeaturedTank } from "@/lib/brava/home-selectors";
import { formatShort } from "@/lib/brava/date-utils";
import { formatDaysToInspection } from "@/lib/brava/inspection";
import StatusBadge from "./StatusBadge";
import ProgressRing from "./ProgressRing";
import BlueprintGrid from "./BlueprintGrid";
import SectionHeading from "./SectionHeading";
import InspectionCriticalityBadge from "./InspectionCriticalityBadge";

export default function FeaturedTankCard() {
  const { tanks } = useBravaData();
  const tank = computeFeaturedTank(tanks);

  if (!tank) return null;
  const { derived } = tank;
  const isActive = ["EM_EXECUCAO", "ATRASADO", "CRITICO"].includes(tank.status);

  return (
    <div>
      <SectionHeading eyebrow="Prioridade Executiva" title="Tanque em Destaque" />
      <Link
        href={`/brava/tanques/${tank.tag}`}
        className="group relative block overflow-hidden rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm transition-shadow duration-200 hover:shadow-brava-lg"
      >
        <BlueprintGrid className="pointer-events-none absolute inset-0 h-full w-full text-brava-blue opacity-60" />

        <div className="relative z-10 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="font-mono text-2xl font-extrabold tracking-tight text-brava-blue-dark">{tank.tag}</h3>
              <StatusBadge status={tank.status} />
              <InspectionCriticalityBadge criticality={derived.inspectionCriticality} />
              <ArrowUpRight className="h-4 w-4 text-brava-text-secondary opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-1 text-[13px] text-brava-text-secondary">
              {tank.area} · {tank.product}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3.5 sm:grid-cols-3 lg:grid-cols-5">
              <Field
                label="Etapa Atual"
                value={tank.status === "CONCLUIDO" ? "Concluído" : derived.currentActivity?.name ?? "Aguardando início"}
              />
              <Field label="Término Previsto" value={formatShort(derived.plannedEnd)} />
              <Field label="Próximo Marco" value={derived.nextMilestone?.name ?? "—"} />
              <Field
                label="Dias Restantes"
                value={
                  derived.daysRemaining === null
                    ? "—"
                    : derived.daysRemaining < 0
                      ? `${Math.abs(derived.daysRemaining)}d atraso`
                      : `${derived.daysRemaining}d`
                }
                danger={derived.daysRemaining !== null && derived.daysRemaining < 0}
              />
              <Field
                label="Próxima Interna"
                value={
                  tank.nextInternalInspection
                    ? `${formatShort(tank.nextInternalInspection)} · ${formatDaysToInspection(derived.daysToInternalInspection)}`
                    : "A definir"
                }
                danger={derived.inspectionCriticality === "CRITICO"}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-5 border-t border-brava-border pt-5 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0">
            <ProgressRing value={derived.progress} accent={isActive} size={88} strokeWidth={7} />
            <div className="text-[11px] uppercase tracking-wide text-brava-text-secondary">
              Avanço
              <br />
              Físico
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function Field({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-brava-text-secondary">{label}</p>
      <p className={`truncate text-[13.5px] font-semibold ${danger ? "text-brava-danger" : "text-brava-text"}`}>
        {value}
      </p>
    </div>
  );
}
