import { AlertTriangle } from "lucide-react";

/** Discreet, professional overdue marker — never a full red screen (§18). */
export default function OverdueTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700">
      <AlertTriangle className="h-3 w-3" />
      Atrasado
    </span>
  );
}
