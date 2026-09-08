"use client";

import Link from "next/link";
import { useBravaData } from "@/lib/brava/context";
import { parseISO } from "@/lib/brava/date-utils";
import { buildInspectionFleet, InspectionFleetAsset } from "@/lib/brava/inspection";
import { INSPECTION_INVENTORY } from "@/lib/brava/data/inspection-inventory";
import SectionHeading from "./SectionHeading";
import { cn } from "@/lib/brava/cn";

const MONTHS_PT = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

interface Group {
  key: string;
  label: string;
  overdue: boolean;
  assets: InspectionFleetAsset[];
}

/**
 * Complete macro due-date view — every real tancagem Brava tracks for
 * regulatory inspection (46 TAGs), not only the subset currently under an
 * active maintenance project. Used on the Home "Cronograma" section and on
 * the Consolidado page. Chips for tanks without a maintenance project link
 * to their dashboard as usual; untracked ones render as a plain (non-link)
 * chip with a dashed border — see the legend below the timeline.
 */
export default function UpcomingInspectionsTimeline() {
  const { tanks, today } = useBravaData();
  const fleet = buildInspectionFleet(tanks, INSPECTION_INVENTORY, today);

  const dated = fleet.filter((a) => a.nextInternalInspection);
  if (dated.length === 0) return null;

  const overdue = dated
    .filter((a) => (a.daysToInternalInspection ?? 0) < 0)
    .sort((a, b) => (a.daysToInternalInspection ?? 0) - (b.daysToInternalInspection ?? 0));

  const upcoming = dated
    .filter((a) => (a.daysToInternalInspection ?? 0) >= 0)
    .sort((a, b) => a.nextInternalInspection!.localeCompare(b.nextInternalInspection!));

  const groups: Group[] = [];
  if (overdue.length > 0) {
    groups.push({ key: "overdue", label: "Vencidos", overdue: true, assets: overdue });
  }
  const byMonth = new Map<string, InspectionFleetAsset[]>();
  for (const a of upcoming) {
    const d = parseISO(a.nextInternalInspection!);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()).padStart(2, "0")}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(a);
  }
  for (const [key, assets] of [...byMonth.entries()].sort()) {
    const [year, month] = key.split("-").map(Number);
    groups.push({ key, label: `${MONTHS_PT[month]} ${year}`, overdue: false, assets });
  }

  const untrackedCount = dated.filter((a) => !a.tracked).length;

  return (
    <div>
      <SectionHeading
        eyebrow="Visão de Inspeções"
        title="Próximos Vencimentos"
        subtitle={`Linha do tempo completa da próxima inspeção interna de todo o parque de tanques (${dated.length} ativos) — não substitui o cronograma de manutenção`}
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
                  {group.assets.map((asset) =>
                    asset.tracked ? (
                      <Link
                        key={asset.tag}
                        href={`/brava/tanques/${asset.tag}`}
                        className={cn(
                          "truncate rounded-brava-sm border px-2 py-1 font-mono text-[11px] font-semibold transition-colors hover:border-brava-blue/40",
                          group.overdue
                            ? "border-brava-danger-border bg-brava-danger-bg text-brava-danger"
                            : "border-brava-border bg-brava-bg text-brava-blue-dark"
                        )}
                      >
                        {asset.tag}
                      </Link>
                    ) : (
                      <span
                        key={asset.tag}
                        title="Sem projeto de manutenção ativo no momento"
                        className={cn(
                          "truncate rounded-brava-sm border border-dashed px-2 py-1 font-mono text-[11px] font-semibold",
                          group.overdue
                            ? "border-brava-danger-border/70 text-brava-danger"
                            : "border-brava-border text-brava-text-secondary"
                        )}
                      >
                        {asset.tag}
                      </span>
                    )
                  )}
                </div>
              </div>
              {i < groups.length - 1 && <span className="mt-1 h-px w-8 shrink-0 bg-brava-border" />}
            </div>
          ))}
        </div>

        {untrackedCount > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-brava-border pt-3 text-[11px] text-brava-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-3.5 rounded-[3px] border border-brava-border bg-brava-bg" />
              Com projeto de manutenção
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-3.5 rounded-[3px] border border-dashed border-brava-border" />
              Apenas inspeção — sem manutenção ativa ({untrackedCount})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
