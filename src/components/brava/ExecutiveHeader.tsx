import { TankWithDerived } from "@/lib/brava/types";
import { formatLong, formatShort } from "@/lib/brava/date-utils";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";
import { cn } from "@/lib/brava/cn";

export default function ExecutiveHeader({ tank }: { tank: TankWithDerived }) {
  const { derived } = tank;
  const isActive = ["EM_EXECUCAO", "ATRASADO", "CRITICO"].includes(tank.status);
  const deviation = derived.deviationDays;

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brava-border px-6 py-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-mono text-2xl font-bold tracking-tight text-brava-blue-dark">
              {tank.tag}
            </h1>
            <StatusBadge status={tank.status} />
          </div>
          <p className="mt-1 text-[13px] text-brava-text-secondary">
            {tank.area} · {tank.product} · {tank.tankType}
          </p>
        </div>

        <div className="flex gap-6 text-right">
          <BigStat label="Avanço Físico" value={`${derived.progress}%`} accent />
          <BigStat
            label={tank.status === "CONCLUIDO" ? "Duração Total" : "Dias Restantes"}
            value={
              tank.status === "CONCLUIDO"
                ? "—"
                : derived.daysRemaining !== null && derived.daysRemaining < 0
                  ? `${Math.abs(derived.daysRemaining)}d`
                  : `${derived.daysRemaining ?? "—"}d`
            }
            danger={derived.daysRemaining !== null && derived.daysRemaining < 0}
          />
          <BigStat
            label="Desvio"
            value={deviation === 0 ? "No prazo" : `${deviation > 0 ? "+" : ""}${deviation}d`}
            danger={deviation > 0}
            positive={deviation < 0}
          />
        </div>
      </div>

      {tank.status !== "CONCLUIDO" && (
        <div className="border-b border-brava-border px-6 py-3">
          <ProgressBar value={derived.progress} accent={isActive} size="sm" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="Início Previsto" value={formatShort(derived.plannedStart)} />
        <Field label="Término Previsto" value={formatShort(derived.plannedEnd)} />
        <Field label="Início Real" value={formatShort(derived.actualStart)} />
        <Field label="Término Real" value={formatShort(derived.actualEnd)} />
        <Field
          label="Etapa Atual"
          value={tank.status === "CONCLUIDO" ? "Concluído" : derived.currentActivity?.name ?? "Aguardando início"}
        />
        <Field
          label="Próxima Atividade"
          value={derived.nextActivity?.name ?? "—"}
        />
        <Field
          label="Próximo Marco"
          value={derived.nextMilestone ? `${derived.nextMilestone.name} · ${formatShort(derived.nextMilestone.plannedStart)}` : "—"}
          wrap
          className="col-span-2"
        />
        <Field label="Responsável" value={tank.responsible ?? "—"} />
      </div>

      {tank.notes && (
        <div className="border-t border-brava-border px-6 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-brava-text-secondary">
            Observações
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-brava-text">{tank.notes}</p>
          {tank.inspectionDeadline && (
            <p className="mt-1.5 text-[12px] text-brava-text-secondary">
              Limite regulatório para inspeção interna: {formatLong(tank.inspectionDeadline)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BigStat({
  label,
  value,
  accent,
  danger,
  positive,
}: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
  positive?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-brava-text-secondary">{label}</p>
      <p
        className={cn(
          "text-xl font-bold leading-tight",
          danger ? "text-brava-danger" : positive ? "text-brava-success" : accent ? "text-brava-blue" : "text-brava-blue-dark"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  wrap,
  className,
}: {
  label: string;
  value: string;
  wrap?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-brava-text-secondary">{label}</p>
      <p className={cn("text-[13px] font-medium text-brava-text", wrap ? "leading-snug" : "truncate")}>
        {value}
      </p>
    </div>
  );
}
