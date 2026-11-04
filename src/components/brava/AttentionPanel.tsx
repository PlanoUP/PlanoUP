"use client";

import Link from "next/link";
import { AlertTriangle, Clock, ShieldAlert, PartyPopper } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { computeAttentionItems, AttentionKind } from "@/lib/brava/home-selectors";
import SectionHeading from "./SectionHeading";
import { cn } from "@/lib/brava/cn";

const KIND_META: Record<AttentionKind, { label: string; icon: typeof AlertTriangle; dotClass: string }> = {
  CRITICO: { label: "Crítico", icon: ShieldAlert, dotClass: "bg-brava-danger" },
  ATRASADO: { label: "Atrasado", icon: Clock, dotClass: "bg-brava-warning" },
  INSPECAO_VENCIDA: { label: "Inspeção", icon: AlertTriangle, dotClass: "bg-brava-danger" },
};

export default function AttentionPanel() {
  const { tanks, today } = useBravaData();
  const items = computeAttentionItems(tanks, today);

  return (
    <div>
      <SectionHeading
        eyebrow="Requer Atenção"
        title="Atenção"
        subtitle={
          items.length === 0
            ? "Nada pedindo atenção imediata no momento"
            : `${items.length} ${items.length === 1 ? "ponto" : "pontos"} que precisam de olho agora`
        }
      />

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-brava-lg border border-dashed border-brava-border bg-brava-white py-12 text-center">
          <PartyPopper className="h-6 w-6 text-brava-success" strokeWidth={1.5} />
          <p className="text-[13px] font-medium text-brava-text">Tudo em dia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, i) => {
            const meta = KIND_META[item.kind];
            const Icon = meta.icon;
            return (
              <Link
                key={`${item.tag}-${item.kind}-${i}`}
                href={`/brava/tanques/${item.tag}`}
                className="flex items-start gap-3 rounded-brava-lg border border-brava-border bg-brava-white p-4 shadow-brava-sm transition-colors hover:border-brava-danger/40"
              >
                <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", meta.dotClass)}>
                  <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[13.5px] font-extrabold text-brava-blue-dark">{item.tag}</p>
                    <span className="truncate text-[10.5px] font-bold uppercase tracking-wide text-brava-text-secondary">
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-brava-text-secondary">{item.area}</p>
                  <p className="mt-1.5 text-[12.5px] font-semibold text-brava-text">{item.detail}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
