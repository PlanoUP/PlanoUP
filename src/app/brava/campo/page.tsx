"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import PageHeader from "@/components/brava/PageHeader";
import StatusBadge from "@/components/brava/StatusBadge";
import ProgressBar from "@/components/brava/ProgressBar";
import FieldLoginCard from "@/components/brava/campo/FieldLoginCard";
import { useBravaData } from "@/lib/brava/context";
import { STATUS_ORDER } from "@/lib/brava/status-meta";
import { cn } from "@/lib/brava/cn";

// "Em campo" tanks are the ones with an active project worth checking on —
// finished or not-yet-planned tanks are hidden by default so the list stays
// short on a phone, with a toggle to see everything when needed.
const DEFAULT_HIDDEN_STATUSES = new Set(["CONCLUIDO", "SEM_PROJETO"]);

export default function CampoPage() {
  const { tanks } = useBravaData();
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tanks
      .filter((t) => showAll || !DEFAULT_HIDDEN_STATUSES.has(t.status))
      .filter(
        (t) =>
          query.length === 0 ||
          t.tag.toLowerCase().includes(query) ||
          t.area.toLowerCase().includes(query) ||
          t.product.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        const statusDiff = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
        return statusDiff !== 0 ? statusDiff : a.tag.localeCompare(b.tag);
      });
  }, [tanks, search, showAll]);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Visão Geral", href: "/brava" }, { label: "Campo" }]}
        title="Atualização em Campo"
        subtitle="Selecione o tanque para registrar o andamento da inspeção"
      />
      <div className="space-y-4 px-5 py-6 sm:px-8 sm:py-8">
        <FieldLoginCard />

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brava-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por TAG, área ou produto..."
            className="w-full rounded-brava-lg border border-brava-border bg-brava-white py-3 pl-10 pr-4 text-[15px] text-brava-text focus:border-brava-blue focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
            showAll
              ? "border-brava-blue bg-brava-blue text-brava-white"
              : "border-brava-border bg-brava-white text-brava-text-secondary"
          )}
        >
          {showAll ? "Mostrando todos" : "Mostrar concluídos e sem projeto"}
        </button>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-brava-lg border border-dashed border-brava-border bg-brava-white py-14 text-center">
            <p className="text-[13px] font-medium text-brava-text">Nenhum tanque encontrado</p>
            <p className="max-w-md px-6 text-[12px] text-brava-text-secondary">
              Ajuste a busca ou toque em &quot;Mostrar concluídos e sem projeto&quot;.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((tank) => (
              <Link
                key={tank.id}
                href={`/brava/campo/${encodeURIComponent(tank.tag)}`}
                className="flex items-center gap-3 rounded-brava-lg border border-brava-border bg-brava-white p-4 shadow-brava-sm transition-colors active:bg-brava-bg"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[15px] font-extrabold tracking-tight text-brava-blue-dark">
                      {tank.tag}
                    </p>
                    <StatusBadge status={tank.status} size="sm" />
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-brava-text-secondary">
                    {tank.area} · {tank.product}
                  </p>
                  {tank.status !== "SEM_PROJETO" && (
                    <div className="mt-2.5 flex items-center gap-2.5">
                      <ProgressBar value={tank.derived.progress} size="sm" className="flex-1" />
                      <span className="shrink-0 font-mono text-[11px] font-bold text-brava-text">
                        {tank.derived.progress}%
                      </span>
                    </div>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-brava-text-secondary" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
