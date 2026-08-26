import type { Priority } from "@/types/paint-control";
import { PRIORITY_SHORT_LABELS, PRIORITY_STYLES } from "@/lib/paint-control/constants";

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const style = PRIORITY_STYLES[priority];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${style.border} ${style.bg} px-2 py-1 text-xs font-semibold ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {priority} · {PRIORITY_SHORT_LABELS[priority]}
    </span>
  );
}
