import Image from "next/image";
import Link from "next/link";
import { CalendarRange } from "lucide-react";
import { TankWithDerived } from "@/lib/brava/types";
import { formatShort } from "@/lib/brava/date-utils";
import { STATUS_META } from "@/lib/brava/status-meta";
import { formatDaysToInspection } from "@/lib/brava/inspection";
import { getTankPhoto } from "@/lib/brava/photos";
import { getTankCronogramaLink } from "@/lib/brava/cronogramaLinks";
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
  const photo = getTankPhoto(tank.tag);
  const cronogramaLink = getTankCronogramaLink(tank.tag);

  return (
    <div className="group relative flex flex-col gap-4 overflow-hidden rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm transition-all duration-200 hover:-translate-y-1 hover:border-brava-blue/25 hover:shadow-brava-lg">
      {/* Full-card click target for the tank's own dashboard — sits behind the
          visible content (which is pointer-events-none below) so it still
          catches clicks anywhere except on the cronograma link itself,
          without nesting an <a> inside another <a>. */}
      <Link
        href={`/brava/tanques/${tank.tag}`}
        aria-label={`Ver detalhes do tanque ${tank.tag}`}
        className="absolute inset-0 z-0 cursor-pointer"
      />
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col gap-4">
      {photo ? (
        <div className="relative h-28 w-full shrink-0 overflow-hidden">
          <Image src={photo} alt={tank.tag} fill sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-200 group-hover:scale-105" />
          <span className={cn("absolute inset-x-0 bottom-0 h-[3px]", stripeClass)} />
        </div>
      ) : (
        <>
          <span className={cn("absolute inset-x-0 top-0 h-[3px]", stripeClass)} />
          <TankIllustration
            variant="mini"
            className="pointer-events-none absolute -right-2 -top-1 h-16 w-16 text-brava-border opacity-70 transition-opacity duration-200 group-hover:opacity-100"
          />
        </>
      )}

      <div className={cn("relative flex items-start justify-between gap-2 px-5", photo ? "pt-3" : "pt-5")}>
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

      <div className="relative px-5">
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

      <div className="relative grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-brava-border px-5 pt-3.5 text-[12px]">
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
        <div className={cn("relative flex w-full items-center justify-between gap-2 border-t border-brava-border px-5 pt-3 text-[11px]", cronogramaLink ? "pb-3" : "pb-5")}>
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

      {cronogramaLink && (
        <a
          href={cronogramaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto relative flex items-center justify-center gap-1.5 border-t border-brava-border px-5 py-2.5 text-[11.5px] font-semibold text-brava-blue transition-colors hover:bg-brava-bg hover:text-brava-blue-dark"
        >
          <CalendarRange className="h-3.5 w-3.5" />
          Ver cronograma
        </a>
      )}
      </div>
    </div>
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
