"use client";

import { useMemo } from "react";
import { Boxes, Target, TrendingUp, TrendingDown } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { buildPhysicalSCurve } from "@/lib/brava/scurve";
import { formatShort, todayISO } from "@/lib/brava/date-utils";
import KpiCard from "@/components/brava/KpiCard";
import PhysicalScurveChart from "@/components/brava/PhysicalScurveChart";

export default function CurvaSTab() {
  const { tanks } = useBravaData();

  const scoped = useMemo(() => tanks.filter((t) => t.status !== "SEM_PROJETO"), [tanks]);
  const scurve = useMemo(() => buildPhysicalSCurve(tanks), [tanks]);

  const todayPoint =
    scurve.find((p) => p.dateISO === todayISO()) ??
    [...scurve].reverse().find((p) => p.realizado !== null) ??
    scurve[0] ??
    null;

  const previstoHoje = todayPoint?.previsto ?? 0;
  const realizadoHoje = todayPoint?.realizado ?? 0;
  const desvio = realizadoHoje - previstoHoje;

  return (
    <div className="space-y-6 lg:space-y-8">
      {scoped.length === 0 ? (
        <div className="rounded-brava-lg border border-dashed border-brava-border bg-brava-white p-10 text-center text-[13.5px] text-brava-text-secondary">
          Nenhum tanque com cronograma ativo no momento.
        </div>
      ) : (
        <>
          <div className="flex flex-col divide-y divide-brava-border rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm sm:flex-row sm:divide-x sm:divide-y-0">
            <KpiCard label="Tanques no Cálculo" value={scoped.length} icon={Boxes} />
            <KpiCard label="Previsto (hoje)" value={previstoHoje} suffix="%" icon={Target} />
            <KpiCard label="Realizado (hoje)" value={realizadoHoje} suffix="%" icon={TrendingUp} tone="accent" />
            <KpiCard
              label="Desvio"
              value={`${desvio > 0 ? "+" : ""}${desvio}`}
              suffix="p.p."
              icon={desvio < 0 ? TrendingDown : TrendingUp}
              tone={desvio < 0 ? "danger" : "neutral"}
            />
          </div>

          <div className="rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm sm:p-6">
            <h3 className="mb-1 text-[14px] font-bold text-brava-text">Curva S — Avanço Físico Consolidado</h3>
            <p className="mb-4 text-[12.5px] text-brava-text-secondary">
              Previsto x Realizado acumulado, {scoped.length} tanque{scoped.length === 1 ? "" : "s"} com cronograma ativo.
            </p>
            <PhysicalScurveChart data={scurve} />
            <p className="mt-4 text-[11px] italic leading-relaxed text-brava-text-secondary">
              O trecho do Realizado antes de hoje ({formatShort(todayISO())}) é uma estimativa por interpolação linear a
              partir do início real de cada etapa — o sistema ainda não guarda um histórico semanal de avanço registrado.
              O ponto de hoje reflete o progresso real atual, e a curva se atualiza sozinha conforme o avanço é registrado.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
