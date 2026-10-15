import Link from "next/link";
import { EquipmentWithDerived, EQUIPMENT_TYPE_LABELS } from "@/lib/brava/units/types";
import { formatShort } from "@/lib/brava/date-utils";
import { STATUS_META } from "@/lib/brava/status-meta";
import EquipmentStatusBadge from "./EquipmentStatusBadge";
import ProgressBar from "../ProgressBar";
import { cn } from "@/lib/brava/cn";

export default function EquipmentCard({ equipment }: { equipment: EquipmentWithDerived }) {
  const { derived } = equipment;
  const isActive = equipment.status === "EM_EXECUCAO" || equipment.status === "ATRASADO" || equipment.status === "CRITICO";
  const daysRemaining = derived.daysRemaining;
  const stripeClass = STATUS_META[equipment.status].dotClass;

  return (
    <Link
      href={`/brava/unidades/equipamentos/${equipment.tag}`}
      className="group relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm transition-all duration-200 hover:-translate-y-1 hover:border-brava-blue/25 hover:shadow-brava-lg"
    >
      <span className={cn("absolute inset-x-0 top-0 h-[3px]", stripeClass)} />

      <div className="relative flex items-start justify-between gap-2 pt-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-mono text-[16px] font-extrabold tracking-tight text-brava-blue-dark">{equipment.tag}</p>
            <span className="rounded-full border border-brava-border bg-brava-bg px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brava-text-secondary">
              {equipment.unit}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[12px] text-brava-text-secondary">
            {EQUIPMENT_TYPE_LABELS[equipment.equipmentType]}
          </p>
        </div>
        <EquipmentStatusBadge status={equipment.status} size="sm" />
      </div>

      <div className="relative">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-brava-text-secondary">
          <span className="truncate pr-2">
            {equipment.status === "CONCLUIDO"
              ? "Parada concluída"
              : equipment.status === "SEM_PROJETO"
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
    </Link>
  );
}

function Stat({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-brava-text-secondary">{label}</p>
      <p className={cn("truncate font-semibold", emphasize ? "text-brava-danger" : "text-brava-text")}>{value}</p>
    </div>
  );
}
