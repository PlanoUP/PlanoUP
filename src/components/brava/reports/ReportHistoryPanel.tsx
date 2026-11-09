"use client";

import { FileText, ChevronRight } from "lucide-react";
import { ExecutiveReportSnapshot } from "@/lib/brava/reports/types";
import { formatShort } from "@/lib/brava/date-utils";
import { cn } from "@/lib/brava/cn";

export default function ReportHistoryPanel({
  reports,
  selectedId,
  onSelect,
}: {
  reports: ExecutiveReportSnapshot[];
  selectedId: string | null;
  onSelect: (snapshot: ExecutiveReportSnapshot) => void;
}) {
  const closed = reports.filter((r) => r.closedAt !== null).sort((a, b) => b.weekStartISO.localeCompare(a.weekStartISO));

  return (
    <div className="rounded-brava-md border border-brava-border bg-brava-white p-4 shadow-brava-sm">
      <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-brava-blue-dark">
        <FileText className="h-3.5 w-3.5" />
        Histórico de semanas fechadas
      </h3>
      {closed.length === 0 ? (
        <p className="text-[13px] italic text-brava-text-secondary">Nenhum relatório fechado ainda.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {closed.map((r) => {
            const active = r.id === selectedId;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onSelect(r)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-brava-sm border px-3 py-2 text-left text-[12.5px] transition-colors",
                    active
                      ? "border-brava-blue bg-brava-blue/5"
                      : "border-brava-border hover:border-brava-blue/40 hover:bg-brava-bg"
                  )}
                >
                  <span>
                    <span className="font-semibold text-brava-text">
                      Semana de {formatShort(r.weekStartISO)}
                    </span>
                    <span className="ml-2 text-brava-text-secondary">
                      {r.scope === "CONSOLIDADO" ? "Consolidado" : r.scope}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-brava-text-secondary">
                    {r.physicalProgress.realizado}%
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
