"use client";

import Link from "next/link";
import { Flag } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { computeUpcomingMilestones } from "@/lib/brava/home-selectors";
import { parseISO } from "@/lib/brava/date-utils";
import SectionHeading from "./SectionHeading";
import { cn } from "@/lib/brava/cn";

const MONTHS_PT = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export default function UpcomingMilestones() {
  const { tanks, today } = useBravaData();
  const milestones = computeUpcomingMilestones(tanks, today, 5);

  return (
    <div>
      <SectionHeading eyebrow="Agenda do Programa" title="Próximos Marcos" />
      <div className="rounded-brava-lg border border-brava-border bg-brava-white p-2 shadow-brava-sm">
        {milestones.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-brava-text-secondary">
            Nenhum marco pendente no momento.
          </p>
        ) : (
          <ul>
            {milestones.map((m, i) => {
              const d = parseISO(m.date);
              const isNext = i === 0;
              return (
                <li key={`${m.tankId}-${m.name}`}>
                  <Link
                    href={`/brava/tanques/${m.tag}`}
                    className={cn(
                      "flex items-center gap-3.5 rounded-brava-md px-3 py-3 transition-colors hover:bg-brava-bg",
                      isNext && "bg-brava-accent/10"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-brava-sm border text-center leading-none",
                        isNext ? "border-brava-accent bg-brava-accent text-brava-blue-dark" : "border-brava-border bg-brava-bg text-brava-text"
                      )}
                    >
                      <span className="text-[13px] font-extrabold">{String(d.getUTCDate()).padStart(2, "0")}</span>
                      <span className="text-[8.5px] font-bold uppercase">{MONTHS_PT[d.getUTCMonth()]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-brava-text">{m.name}</p>
                      <p className="truncate font-mono text-[11.5px] text-brava-text-secondary">{m.tag}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {isNext && <Flag className="ml-auto mb-0.5 h-3 w-3 text-brava-blue" strokeWidth={2.5} />}
                      <span
                        className={cn(
                          "text-[11px] font-semibold",
                          m.daysAway <= 3 ? "text-brava-warning" : "text-brava-text-secondary"
                        )}
                      >
                        {m.daysAway === 0 ? "hoje" : `${m.daysAway}d`}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
