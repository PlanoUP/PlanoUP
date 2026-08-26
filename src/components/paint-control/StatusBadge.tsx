import type { ActivityStatus } from "@/types/paint-control";
import { STATUS_STYLES } from "@/lib/paint-control/constants";

export default function StatusBadge({ status }: { status: ActivityStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border ${style.border} ${style.bg} px-2 py-1 text-xs font-semibold ${style.text}`}
    >
      {status}
    </span>
  );
}
