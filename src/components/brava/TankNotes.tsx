import { Tank } from "@/lib/brava/types";
import { formatLong } from "@/lib/brava/date-utils";
import { FileText } from "lucide-react";

export default function TankNotes({ tank }: { tank: Tank }) {
  if (!tank.notes && !tank.inspectionDeadline) return null;

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white p-6 shadow-brava-sm">
      <div className="flex items-center gap-2 text-brava-blue-dark">
        <FileText className="h-4 w-4" strokeWidth={1.75} />
        <h2 className="text-[14px] font-semibold tracking-tight">Observações</h2>
      </div>
      {tank.notes && <p className="mt-3 text-[13.5px] leading-relaxed text-brava-text">{tank.notes}</p>}
      {tank.inspectionDeadline && (
        <p className="mt-2 text-[12px] text-brava-text-secondary">
          Limite regulatório para inspeção interna: <span className="font-medium text-brava-text">{formatLong(tank.inspectionDeadline)}</span>
        </p>
      )}
    </div>
  );
}
