"use client";

import Link from "next/link";
import { useBravaData } from "@/lib/brava/context";
import { parseISO } from "@/lib/brava/date-utils";
import SectionHeading from "./SectionHeading";
import { cn } from "@/lib/brava/cn";

const MONTHS_PT = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

interface Group {
  key: string;
  label: string;
  overdue: boolean;
  tags: string[];
}

export default function UpcomingInspectionsTimeline() {
  const { tanks } = useBravaData();

  const dated = tanks.filter((t) => t.nextInternalInspection);
  if (dated.length === 0) return null;

  const overdue = dated
    .filter((t) => (t.derived.daysToInternalInspection ?? 0) < 0)
    .sort((a, b) => (a.derived.daysToInternalInspection ?? 0) - (b.derived.daysToInternalInspection ?? 0));

  const upcoming = dated
    .filter((t) => (t.derived.daysToInternalInspection ?? 0) >= 0)
    .sort((a, b) => a.nextInternalInspection!.localeCompare(b.nextInternalInspection!));

  const groups: Group[] = [];
  if (overdue.length > 0) {
    groups.push({ key: "overdue", label: "Vencidos", overdue: true, tags: overdue.map((t) => t.tag) });
  }
  const byMonth = new Map<string, string[]>();
  for (const t of upcoming) {
    const d = parseISO(t.nextInternalInspection!);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()).padStart(2, "0")}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(t.tag);
  }
  for (const [key, tags] of [...byMonth.entries()].sort()) {
    const [year, month] = key.split("-").map(Number);
    groups.push({ key, label: `${MONTHS_PT[month]} ${year}`, overdue: false, tags });
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Visão de Inspeções"
        title="Próximos Vencimentos"
        subtitle="Linha do tempo das próximas inspeções internas por TAG — não substitui o cronograma de manutenção"
      />
      <div className="rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm sm:p-6">
        <div className="brava-scrollbar flex gap-0 overflow-x-auto pb-2">
          {groups.map((group, i) => (
            <div key={group.key} className="flex shrink-0 items-start">
              <div className="flex min-w-[132px] max-w-[176px] flex-col gap-2 px-4">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 shrink-0 rounded-full",
                      group.overdue ? "bg-brava-danger" : "bg-brava-blue"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-wide",
                      group.overdue ? "text-brava-danger" : "text-brava-text"
                    )}
                  >
                    {group.label}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 border-l-2 border-brava-border pl-3.5">
                  {group.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/brava/tanques/${tag}`}
                      className={cn(
                        "truncate rounded-brava-sm border px-2 py-1 font-mono text-[11px] font-semibold transition-colors hover:border-brava-blue/40",
                        group.overdue
                          ? "border-brava-danger-border bg-brava-danger-bg text-brava-danger"
                          : "border-brava-border bg-brava-bg text-brava-blue-dark"
                      )}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
              {i < groups.length - 1 && <span className="mt-1 h-px w-8 shrink-0 bg-brava-border" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
