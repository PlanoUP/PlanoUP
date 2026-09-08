import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TankWithDerived } from "@/lib/brava/types";
import { formatShort } from "@/lib/brava/date-utils";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";
import { cn } from "@/lib/brava/cn";

export default function TankCard({ tank }: { tank: TankWithDerived }) {
  const { derived } = tank;
  const isActive = tank.status === "EM_EXECUCAO" || tank.status === "ATRASADO" || tank.status === "CRITICO";
  const daysRemaining = derived.daysRemaining;

  return (
    <Link
      href={`/brava/tanques/${tank.tag}`}
      className="group flex flex-col gap-3.5 rounded-brava-md border border-brava-border bg-brava-white p-4 shadow-brava-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brava-blue/30 hover:shadow-brava-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[15px] font-semibold tracking-tight text-brava-blue-dark">
            {tank.tag}
          </p>
          <p className="mt-0.5 text-[12px] text-brava-text-secondary">{tank.area}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge status={tank.status} size="sm" />
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-brava-text-secondary opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-brava-text-secondary">
          <span className="truncate pr-2">
            {tank.status === "CONCLUIDO"
              ? "Manutenção concluída"
              : derived.currentActivity?.name ?? "Aguardando início"}
          </span>
          <span className="font-semibold text-brava-text">{derived.progress}%</span>
        </div>
        <ProgressBar value={derived.progress} accent={isActive} />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-brava-border pt-3 text-[12px]">
        <Stat label="Início" value={formatShort(derived.plannedStart)} />
        <Stat label="Conclusão prevista" value={formatShort(derived.plannedEnd)} />
        <Stat
          label="Dias restantes"
          value={
            tank.status === "CONCLUIDO"
              ? "—"
              : daysRemaining !== null && daysRemaining < 0
                ? `${Math.abs(daysRemaining)}d atraso`
                : `${daysRemaining ?? "—"}d`
          }
          emphasize={daysRemaining !== null && daysRemaining < 0}
        />
        <Stat
          label="Próximo marco"
          value={derived.nextMilestone ? derived.nextMilestone.name : "—"}
        />
      </div>
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
          "truncate font-medium",
          emphasize ? "text-brava-danger" : "text-brava-text"
        )}
      >
        {value}
      </p>
    </div>
  );
}
