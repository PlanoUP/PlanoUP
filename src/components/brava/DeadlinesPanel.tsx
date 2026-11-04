"use client";

import Link from "next/link";
import { ShieldCheck, Flag } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { computeDeadlines } from "@/lib/brava/home-selectors";
import { formatShort } from "@/lib/brava/date-utils";
import SectionHeading from "./SectionHeading";
import { cn } from "@/lib/brava/cn";

export default function DeadlinesPanel({ limit = 12 }: { limit?: number }) {
  const { tanks, today } = useBravaData();
  const items = computeDeadlines(tanks, today, limit);

  return (
    <div>
      <SectionHeading
        eyebrow="Agenda do Programa"
        title="Vencimentos"
        subtitle="Marcos de manutenção e inspeções internas, juntos numa única linha do tempo"
      />

      <div className="rounded-brava-lg border border-brava-border bg-brava-white p-2 shadow-brava-sm">
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-brava-text-secondary">Nenhum vencimento pendente.</p>
        ) : (
          <ul>
            {items.map((item, i) => {
              const Icon = item.kind === "INSPECAO" ? ShieldCheck : Flag;
              const href = item.tracked ? `/brava/tanques/${item.tag}` : undefined;
              const content = (
                <>
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-brava-sm border",
                      item.overdue
                        ? "border-brava-danger-border bg-brava-danger-bg text-brava-danger"
                        : "border-brava-border bg-brava-bg text-brava-text-secondary"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-brava-text">{item.label}</p>
                    <p className="truncate font-mono text-[11.5px] text-brava-text-secondary">
                      {item.tag}
                      {!item.tracked && " · sem manutenção ativa"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-brava-text-secondary">{formatShort(item.date)}</p>
                    <span
                      className={cn(
                        "text-[11px] font-bold",
                        item.overdue ? "text-brava-danger" : item.daysAway <= 7 ? "text-brava-warning" : "text-brava-text-secondary"
                      )}
                    >
                      {item.overdue
                        ? `${Math.abs(item.daysAway)}d vencido`
                        : item.daysAway === 0
                          ? "hoje"
                          : `${item.daysAway}d`}
                    </span>
                  </div>
                </>
              );
              return (
                <li key={`${item.tag}-${item.kind}-${i}`}>
                  {href ? (
                    <Link
                      href={href}
                      className="flex items-center gap-3 rounded-brava-md px-3 py-3 transition-colors hover:bg-brava-bg"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 px-3 py-3 opacity-80">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
