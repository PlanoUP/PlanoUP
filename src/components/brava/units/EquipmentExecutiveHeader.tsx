import Link from "next/link";
import { MapPin } from "lucide-react";
import { EquipmentWithDerived } from "@/lib/brava/units/types";
import { EQUIPMENT_TYPE_LABELS } from "@/lib/brava/units/types";
import { formatShort } from "@/lib/brava/date-utils";
import EquipmentStatusBadge from "./EquipmentStatusBadge";
import BlueprintGrid from "../BlueprintGrid";
import { cn } from "@/lib/brava/cn";

const STATUS_HEADLINE: Record<string, string> = {
  PROGRAMADO: "Parada Programada",
  EM_EXECUCAO: "Parada em Execução",
  CONCLUIDO: "Parada Concluída",
  ATRASADO: "Parada Atrasada",
  CRITICO: "Intervenção Crítica",
  SEM_PROJETO: "Sem Projeto de Manutenção",
};

export default function EquipmentExecutiveHeader({ equipment }: { equipment: EquipmentWithDerived }) {
  const { derived } = equipment;
  const isActive = ["EM_EXECUCAO", "ATRASADO", "CRITICO"].includes(equipment.status);
  const deviation = derived.deviationDays;

  return (
    <div className="overflow-hidden rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm">
      <div className="relative overflow-hidden px-6 pb-7 pt-7 sm:px-8">
        <BlueprintGrid className="pointer-events-none absolute inset-0 h-full w-full text-brava-blue opacity-50" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brava-blue">
              {STATUS_HEADLINE[equipment.status]}
            </p>
            <Link
              href={`/brava/unidades/mapa?equipamento=${equipment.tag}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brava-border bg-brava-white px-2.5 py-1 text-[11px] font-semibold text-brava-text-secondary transition-colors hover:border-brava-blue/30 hover:text-brava-blue"
            >
              <MapPin className="h-3 w-3" />
              Localizar no Mapa
            </Link>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-[2.5rem] font-extrabold leading-none tracking-tight text-brava-blue-dark sm:text-[3.2rem]">
              {equipment.tag}
            </h1>
            <EquipmentStatusBadge status={equipment.status} />
            <span className="rounded-full border border-brava-border bg-brava-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brava-text-secondary">
              {equipment.unit}
            </span>
          </div>
          <p className="mt-2 text-[13.5px] text-brava-text-secondary">
            {equipment.unit} · {EQUIPMENT_TYPE_LABELS[equipment.equipmentType]}
          </p>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-brava-border border-t border-brava-border sm:flex-row sm:divide-x sm:divide-y-0">
        <StatBlock
          label="Avanço Físico"
          value={`${derived.progress}%`}
          tone={isActive ? "accent" : "neutral"}
          meter={derived.progress}
        />
        <StatBlock
          label="Etapa Atual"
          value={
            equipment.status === "CONCLUIDO"
              ? "Concluído"
              : equipment.status === "SEM_PROJETO"
                ? "Sem projeto cadastrado"
                : derived.currentActivity?.name ?? "Aguardando início"
          }
          small
        />
        <StatBlock
          label={equipment.status === "CONCLUIDO" ? "Duração Total" : "Dias Restantes"}
          value={
            derived.daysRemaining === null
              ? "—"
              : derived.daysRemaining < 0
                ? `${Math.abs(derived.daysRemaining)}d`
                : `${derived.daysRemaining}d`
          }
          tone={derived.daysRemaining !== null && derived.daysRemaining < 0 ? "danger" : "neutral"}
        />
        <StatBlock
          label="Desvio"
          value={deviation === 0 ? "No prazo" : `${deviation > 0 ? "+" : ""}${deviation}d`}
          tone={deviation > 0 ? "danger" : deviation < 0 ? "success" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-brava-border px-6 py-5 sm:grid-cols-3 lg:grid-cols-4 sm:px-8">
        <Field label="Início Previsto" value={formatShort(derived.plannedStart)} />
        <Field label="Término Previsto" value={formatShort(derived.plannedEnd)} />
        <Field label="Início Real" value={formatShort(derived.actualStart)} />
        <Field label="Término Real" value={formatShort(derived.actualEnd)} />
        <Field label="Próxima Atividade" value={derived.nextActivity?.name ?? "—"} />
        <Field
          label="Próximo Marco"
          value={derived.nextMilestone ? `${derived.nextMilestone.name} · ${formatShort(derived.nextMilestone.plannedStart)}` : "—"}
          wrap
          className="col-span-2"
        />
        <Field label="Responsável" value={equipment.responsible ?? "—"} />
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  tone = "neutral",
  meter,
  small,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "accent" | "danger" | "success";
  meter?: number;
  small?: boolean;
}) {
  const valueClass = {
    neutral: "text-brava-blue-dark",
    accent: "text-brava-blue-dark",
    danger: "text-brava-danger",
    success: "text-brava-success",
  }[tone];

  return (
    <div className="flex-1 px-6 py-5 sm:px-8">
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-brava-text-secondary">{label}</p>
      <p
        className={cn(
          "mt-1.5 font-mono font-extrabold leading-none tracking-tight",
          small ? "truncate text-[18px] font-sans font-bold" : "text-[26px]",
          valueClass
        )}
      >
        {value}
      </p>
      {typeof meter === "number" && (
        <div className="mt-2.5 h-[3px] w-full max-w-[120px] overflow-hidden rounded-full bg-brava-border/70">
          <div
            className="h-full rounded-full bg-brava-accent transition-[width] duration-700 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, meter))}%` }}
          />
        </div>
      )}
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
      <p className={cn("text-[13px] font-medium text-brava-text", wrap ? "leading-snug" : "truncate")}>{value}</p>
    </div>
  );
}
