"use client";

import Link from "next/link";
import { useBravaData } from "@/lib/brava/context";
import { parseISO } from "@/lib/brava/date-utils";
import { buildInspectionFleet, InspectionFleetAsset } from "@/lib/brava/inspection";
import { INSPECTION_INVENTORY } from "@/lib/brava/data/inspection-inventory";
import SectionHeading from "./SectionHeading";
import { cn } from "@/lib/brava/cn";

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
  const byYear = new Map<string, InspectionFleetAsset[]>();
  for (const a of upcoming) {
    const year = parseISO(a.nextInternalInspection!).getUTCFullYear();
    const key = String(year);
    if (!byYear.has(key)) byYear.set(key, []);
    byYear.get(key)!.push(a);
  }
  for (const [key, assets] of [...byYear.entries()].sort()) {
    groups.push({ key, label: key, overdue: false, assets });
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
        <div className="brava-scrollbar overflow-x-auto pb-1">
          <div className="flex w-max divide-x divide-brava-border rounded-brava-md border border-brava-border">
            {groups.map((group) => (
              <div key={group.key} className="flex w-[148px] shrink-0 flex-col">
                <div
                  className={cn(
                    "flex items-center justify-between gap-2 border-b border-brava-border px-3 py-2",
                    group.overdue ? "bg-brava-danger-bg" : "bg-brava-bg"
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide",
                      group.overdue ? "text-brava-danger" : "text-brava-text"
                    )}
                  >
                    <span
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        group.overdue ? "bg-brava-danger" : "bg-brava-blue"
                      )}
                    />
                    {group.label}
                  </span>
                  <span className={cn("font-mono text-[10.5px] font-bold", group.overdue ? "text-brava-danger" : "text-brava-text-secondary")}>
                    {group.assets.length}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 p-2.5">
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
            ))}
          </div>
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
