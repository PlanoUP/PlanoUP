"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, ClipboardList } from "lucide-react";
import PageHeader from "@/components/brava/PageHeader";
import StatusBadge from "@/components/brava/StatusBadge";
import ProgressBar from "@/components/brava/ProgressBar";
import FieldLoginCard from "@/components/brava/campo/FieldLoginCard";
import { useBravaData } from "@/lib/brava/context";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import { useFieldAuth } from "@/lib/brava/fieldAuthContext";
import { STATUS_ORDER } from "@/lib/brava/status-meta";
import { cn } from "@/lib/brava/cn";

// "Em campo" tanks are the ones with an active project worth checking on —
// finished or not-yet-planned tanks are hidden by default so the list stays
// short on a phone, with a toggle to see everything when needed.
const DEFAULT_HIDDEN_STATUSES = new Set(["CONCLUIDO", "SEM_PROJETO"]);

export default function CampoPage() {
  const { tanks } = useBravaData();
  const { isEditor } = useEditAuth();
  const { fieldUser, loading } = useFieldAuth();
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const allocated = useMemo(() => {
    if (isEditor || !fieldUser) return tanks;
    const allowed = new Set(fieldUser.allocatedTags.map((t) => t.toUpperCase()));
    return tanks.filter((t) => allowed.has(t.tag.toUpperCase()));
  }, [tanks, isEditor, fieldUser]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allocated
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
  }, [allocated, search, showAll]);

  // A plain visitor (no Fiscal session, no editor unlock) only ever sees the
  // login — everything else about the painel stays hidden until they log in.
  const showLoginOnly = !loading && !isEditor && !fieldUser;

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Visão Geral", href: "/brava" }, { label: "Campo" }]}
        title="Atualização em Campo"
        subtitle={showLoginOnly ? "Entre como Fiscal para registrar o andamento em campo" : "Selecione o equipamento para registrar o andamento"}
      />
      <div className="space-y-4 px-5 py-6 sm:px-8 sm:py-8">
        {showLoginOnly ? (
          <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brava-blue/10">
              <ClipboardList className="h-7 w-7 text-brava-blue" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-brava-text">Acesso do Fiscal</p>
              <p className="mt-1 text-[13px] text-brava-text-secondary">
                Entre com seu usuário e senha para ver seus equipamentos e registrar avanço, fotos e observações.
              </p>
            </div>
            <div className="w-full">
              <FieldLoginCard />
            </div>
          </div>
        ) : (
          <>
            {!isEditor && <FieldLoginCard />}

            {!isEditor && fieldUser && allocated.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-brava-lg border border-dashed border-brava-border bg-brava-white py-14 text-center">
                <p className="text-[13px] font-medium text-brava-text">Nenhum equipamento alocado</p>
                <p className="max-w-md px-6 text-[12px] text-brava-text-secondary">
                  Fale com o administrador para alocar os tanques que você vai acompanhar.
                </p>
              </div>
            ) : (
              <>
                {isEditor && (
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brava-text-secondary" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar por TAG, área ou produto..."
                      className="w-full rounded-brava-lg border border-brava-border bg-brava-white py-3 pl-10 pr-4 text-[15px] text-brava-text focus:border-brava-blue focus:outline-none"
                    />
                  </div>
                )}

                {isEditor && (
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
                )}

                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-brava-lg border border-dashed border-brava-border bg-brava-white py-14 text-center">
                    <p className="text-[13px] font-medium text-brava-text">Nenhum tanque encontrado</p>
                    <p className="max-w-md px-6 text-[12px] text-brava-text-secondary">Ajuste a busca.</p>
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
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
