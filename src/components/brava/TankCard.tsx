import Link from "next/link";
import { TankWithDerived } from "@/lib/brava/types";
import { formatShort } from "@/lib/brava/date-utils";
import { STATUS_META } from "@/lib/brava/status-meta";
import { formatDaysToInspection } from "@/lib/brava/inspection";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";
import TankIllustration from "./TankIllustration";
import InspectionCriticalityBadge, { InspectionTooltip } from "./InspectionCriticalityBadge";
import { cn } from "@/lib/brava/cn";

export default function TankCard({ tank }: { tank: TankWithDerived }) {
  const { derived } = tank;
  const isActive = tank.status === "EM_EXECUCAO" || tank.status === "ATRASADO" || tank.status === "CRITICO";
  const daysRemaining = derived.daysRemaining;
  const stripeClass = STATUS_META[tank.status].dotClass;
  const daysToInspection = derived.daysToInternalInspection;
  const inspectionOverdue = daysToInspection !== null && daysToInspection < 0;

  return (
    <Link
      href={`/brava/tanques/${tank.tag}`}
      className="group relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm transition-all duration-200 hover:-translate-y-1 hover:border-brava-blue/25 hover:shadow-brava-lg"
    >
      <span className={cn("absolute inset-x-0 top-0 h-[3px]", stripeClass)} />
      <TankIllustration
        variant="mini"
        className="pointer-events-none absolute -right-2 -top-1 h-16 w-16 text-brava-border opacity-70 transition-opacity duration-200 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-2 pt-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-mono text-[16px] font-extrabold tracking-tight text-brava-blue-dark">{tank.tag}</p>
            {derived.family && (
              <span className="rounded-full border border-brava-border bg-brava-bg px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brava-text-secondary">
                Grupo {derived.family}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[12px] text-brava-text-secondary">{tank.area}</p>
        </div>
        <StatusBadge status={tank.status} size="sm" />
      </div>

      <div className="relative">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-brava-text-secondary">
          <span className="truncate pr-2">
            {tank.status === "CONCLUIDO"
              ? "Manutenção concluída"
              : tank.status === "SEM_PROJETO"
                ? "Sem projeto de manutenção"
                : derived.currentActivity?.name ?? "Aguardando início"}
          </span>
          <span className="font-mono font-bold text-brava-text">{derived.progress}%</span>
        </div>
        <ProgressBar value={derived.progress} accent={isActive} />
      </div>

      <div className="relative grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-brava-border pt-3.5 text-[12px]">
        <Stat label="Início" value={formatShort(derived.plannedStart)} />
        <Stat label="Conclusão prevista" value={formatShort(derived.plannedEnd)} />
        <Stat
          label="Dias restantes"
          value={
            daysRemaining === null
              ? "—"
              : daysRemaining < 0
                ? `${Math.abs(daysRemaining)}d atraso`
                : `${daysRemaining}d`
          }
          emphasize={daysRemaining !== null && daysRemaining < 0}
        />
        <Stat label="Próximo marco" value={derived.nextMilestone ? derived.nextMilestone.name : "—"} />
      </div>

      <InspectionTooltip
        nextInternalInspection={tank.nextInternalInspection}
        daysToInternalInspection={daysToInspection}
        criticality={derived.inspectionCriticality}
      >
        <div className="relative flex w-full items-center justify-between gap-2 border-t border-brava-border pt-3 text-[11px]">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-brava-text-secondary">Próxima Interna</p>
            <p className={cn("truncate font-semibold", inspectionOverdue ? "text-brava-danger" : "text-brava-text")}>
              {tank.nextInternalInspection ? formatShort(tank.nextInternalInspection) : "A definir"}
              <span className="ml-1.5 font-normal text-brava-text-secondary">
                · {formatDaysToInspection(daysToInspection)}
              </span>
            </p>
          </div>
          <InspectionCriticalityBadge criticality={derived.inspectionCriticality} size="sm" className="shrink-0" />
        </div>
      </InspectionTooltip>
    </Link>
  );
}

function Stat({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-brava-text-secondary">{label}</p>
      <p
        className={cn(
          "truncate font-semibold",
          emphasize ? "text-brava-danger" : "text-brava-text"
        )}
      >
        {value}
      </p>
    </div>
  );
}
