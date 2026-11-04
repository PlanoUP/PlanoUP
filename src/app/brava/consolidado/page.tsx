"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarRange, Wallet, Package } from "lucide-react";
import PageHeader from "@/components/brava/PageHeader";
import CronogramaTab from "@/components/brava/consolidado/CronogramaTab";
import CustosTab from "@/components/brava/consolidado/CustosTab";
import MateriaisTab from "@/components/brava/consolidado/MateriaisTab";
import { cn } from "@/lib/brava/cn";

const TABS = [
  { key: "cronograma", label: "Cronograma", icon: CalendarRange },
  { key: "custos", label: "Custos", icon: Wallet },
  { key: "materiais", label: "Materiais", icon: Package },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function ConsolidadoContent() {
  const router = useRouter();
  const params = useSearchParams();
  const tab = (params.get("tab") as TabKey) ?? "cronograma";
  const activeTab: TabKey = TABS.some((t) => t.key === tab) ? tab : "cronograma";

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Visão Geral", href: "/brava" }, { label: "Consolidado" }]}
        title="Visão Consolidada"
        subtitle="Cronograma, custos e materiais de todos os tanques — num único lugar"
      />
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 inline-flex gap-1 rounded-brava-sm border border-brava-border bg-brava-white p-1 shadow-brava-sm">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.key === activeTab;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => router.replace(`/brava/consolidado?tab=${t.key}`, { scroll: false })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-brava-sm px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                  active ? "bg-brava-blue text-brava-white" : "text-brava-text-secondary hover:bg-brava-bg hover:text-brava-blue-dark"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {activeTab === "cronograma" && <CronogramaTab />}
        {activeTab === "custos" && <CustosTab />}
        {activeTab === "materiais" && <MateriaisTab />}
      </div>
    </>
  );
}

export default function ConsolidatedPage() {
  return (
    <Suspense fallback={null}>
      <ConsolidadoContent />
    </Suspense>
  );
}
