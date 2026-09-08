import { Check, Flag } from "lucide-react";
import { Activity } from "@/lib/brava/types";
import { formatShort } from "@/lib/brava/date-utils";
import { cn } from "@/lib/brava/cn";

export default function ExecutiveTimeline({ activities }: { activities: Activity[] }) {
  const ordered = [...activities].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white p-6 shadow-brava-sm">
      <h2 className="mb-5 text-[14px] font-semibold tracking-tight text-brava-blue-dark">
        Timeline Executiva
      </h2>
      <div className="brava-scrollbar overflow-x-auto pb-2">
        <div className="flex min-w-[900px] items-start">
          {ordered.map((activity, index) => {
            const isLast = index === ordered.length - 1;
            return (
              <div key={activity.id} className="flex flex-1 items-start">
                <div className="flex flex-col items-center gap-2" style={{ width: 96 }}>
                  <Node activity={activity} />
                  <p
                    className={cn(
                      "text-center text-[10.5px] font-medium leading-tight",
                      activity.status === "ATUAL" ? "text-brava-blue-dark" : "text-brava-text-secondary"
                    )}
                  >
                    {activity.name}
                  </p>
                  <p className="text-center text-[10px] text-brava-text-secondary">
                    {formatShort(activity.plannedStart)}
                  </p>
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "mt-4 h-[2px] flex-1",
                      activity.status === "CONCLUIDO" ? "bg-brava-blue-dark" : "bg-brava-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 border-t border-brava-border pt-4 text-[11px] text-brava-text-secondary">
        <Legend dotClass="bg-brava-blue-dark" label="Concluído" />
        <Legend dotClass="bg-brava-accent" label="Atual" ring />
        <Legend dotClass="bg-brava-white border border-brava-border" label="Futuro" />
        <Legend icon={<Flag className="h-3 w-3 text-brava-blue" strokeWidth={2} />} label="Marco" />
      </div>
    </div>
  );
}

function Node({ activity }: { activity: Activity }) {
  const base = "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors";

  if (activity.status === "CONCLUIDO") {
    return (
      <div className={cn(base, "border-brava-blue-dark bg-brava-blue-dark text-brava-white")}>
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </div>
    );
  }

  if (activity.status === "ATUAL") {
    return (
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <span className="absolute inset-0 animate-pulse rounded-full bg-brava-accent/40" />
        <div className={cn(base, "relative border-brava-accent bg-brava-accent text-brava-blue-dark")}>
          {activity.isMilestone ? (
            <Flag className="h-3.5 w-3.5" strokeWidth={2.5} />
          ) : (
            <span className="text-[10px] font-bold">{activity.progress}%</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(base, "border-brava-border bg-brava-white text-brava-text-secondary")}>
      {activity.isMilestone && <Flag className="h-3.5 w-3.5" strokeWidth={2} />}
    </div>
  );
}

function Legend({
  dotClass,
  icon,
  label,
  ring,
}: {
  dotClass?: string;
  icon?: React.ReactNode;
  label: string;
  ring?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon ?? (
        <span className={cn("h-2.5 w-2.5 rounded-full", dotClass, ring && "ring-2 ring-brava-accent/30")} />
      )}
      {label}
    </div>
  );
}
