"use client";

import { AlertTriangle, Image as ImageIcon } from "lucide-react";
import { FieldEntry } from "@/lib/brava/field/types";
import { formatShort } from "@/lib/brava/date-utils";
import { cn } from "@/lib/brava/cn";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${formatShort(iso.slice(0, 10))} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function FieldEntryHistory({ entries }: { entries: FieldEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-brava-lg border border-brava-border bg-brava-white p-4 shadow-brava-sm">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-brava-text-secondary">Histórico de registros</p>
        <p className="text-[13px] italic text-brava-text-secondary">Nenhum registro de campo ainda.</p>
      </div>
    );
  }

  return (
    <div className="rounded-brava-lg border border-brava-border bg-brava-white p-4 shadow-brava-sm">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-brava-text-secondary">Histórico de registros</p>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "rounded-brava-sm border-l-[3px] bg-brava-bg px-3 py-2.5",
              entry.ocorrencia ? "border-brava-danger" : "border-brava-blue/40"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12.5px] font-bold text-brava-text">{entry.userName}</p>
              <p className="shrink-0 font-mono text-[11px] text-brava-text-secondary">{formatDateTime(entry.createdAt)}</p>
            </div>
            {entry.progressAfter !== null && (
              <p className="mt-0.5 text-[12px] text-brava-text-secondary">
                {entry.activityName ? `${entry.activityName}: ` : ""}
                {entry.progressBefore ?? 0}% → <span className="font-bold text-brava-blue">{entry.progressAfter}%</span>
              </p>
            )}
            {entry.observacao && <p className="mt-1 text-[13px] text-brava-text">{entry.observacao}</p>}
            {entry.ocorrencia && (
              <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-brava-danger">
                <AlertTriangle className="h-3.5 w-3.5" />
                Ocorrência de segurança/qualidade
              </p>
            )}
            {entry.materialDescricao && (
              <p className="mt-1 text-[12px] text-brava-text-secondary">
                Material: {entry.materialDescricao}
                {entry.materialQuantidade ? ` — ${entry.materialQuantidade}` : ""}
              </p>
            )}
            {entry.photos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {entry.photos.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="block h-14 w-14 overflow-hidden rounded-brava-sm border border-brava-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            )}
            {entry.photos.length === 0 && entry.ocorrencia === false && !entry.observacao && !entry.materialDescricao && entry.progressAfter === null && (
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-brava-text-secondary">
                <ImageIcon className="h-3 w-3" />
                Registro vazio
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
