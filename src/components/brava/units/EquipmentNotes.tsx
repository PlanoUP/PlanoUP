import { Equipment } from "@/lib/brava/units/types";
import { FileText } from "lucide-react";

export default function EquipmentNotes({ equipment }: { equipment: Equipment }) {
  if (!equipment.notes) return null;

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white p-6 shadow-brava-sm">
      <div className="flex items-center gap-2 text-brava-blue-dark">
        <FileText className="h-4 w-4" strokeWidth={1.75} />
        <h2 className="text-[14px] font-semibold tracking-tight">Observações</h2>
      </div>
      <p className="mt-3 text-[13.5px] leading-relaxed text-brava-text">{equipment.notes}</p>
    </div>
  );
}
