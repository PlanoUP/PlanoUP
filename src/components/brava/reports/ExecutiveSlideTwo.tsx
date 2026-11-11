"use client";

import { Plus, X } from "lucide-react";
import SlideFrame from "./SlideFrame";
import SlideHeader from "./SlideHeader";
import SlideFooter from "./SlideFooter";
import SlidePanel from "./SlidePanel";
import DonutGauge from "./DonutGauge";
import { ReportTankRow, ReportCriticalPoint, ReportScope } from "@/lib/brava/reports/types";
import { formatShort } from "@/lib/brava/date-utils";
import { AttentionSummary, formatPP } from "@/lib/brava/reports/calculations";

const MAX_ROWS_ON_SLIDE = 8;
const MAX_CRITICAL_POINTS = 4;

function genId(): string {
  return `cp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ExecutiveSlideTwo({
  scope,
  scopeLabel,
  cutoffDateISO,
  rows,
  attention,
  classificationSummary,
  nextDelivery,
  inspecoesVencidas,
  criticalPoints,
  editable,
  onChangeCriticalPoints,
  onShowAllTanks,
}: {
  scope: ReportScope;
  scopeLabel: string;
  cutoffDateISO: string;
  /** Executing-only tanks, already sorted by desvioPP ascending (most negative first). */
  rows: ReportTankRow[];
  attention: AttentionSummary;
  classificationSummary: string;
  nextDelivery: ReportTankRow | null;
  inspecoesVencidas: number;
  criticalPoints: ReportCriticalPoint[];
  editable: boolean;
  onChangeCriticalPoints: (points: ReportCriticalPoint[]) => void;
  onShowAllTanks: () => void;
}) {
  const visibleRows = rows.slice(0, MAX_ROWS_ON_SLIDE);
  const hiddenCount = rows.length - visibleRows.length;
  const subtitle = `Acompanhamento de ${rows.length} tanque${rows.length === 1 ? "" : "s"} em execução${
    scope === "CONSOLIDADO" ? "" : ` · ${scopeLabel}`
  }`;

  function updatePoint(id: string, patch: Partial<ReportCriticalPoint>) {
    onChangeCriticalPoints(criticalPoints.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function removePoint(id: string) {
    onChangeCriticalPoints(criticalPoints.filter((p) => p.id !== id));
  }
  function addPoint() {
    if (criticalPoints.length >= MAX_CRITICAL_POINTS) return;
    onChangeCriticalPoints([
      ...criticalPoints,
      { id: genId(), tag: "", situacao: "", impacto: "", acao: "", responsavel: "", prazo: "" },
    ]);
  }

  return (
    <SlideFrame label="Slide 2 — Tanques em Manutenção">
      <div className="flex h-full flex-col">
        <SlideHeader eyebrow="Relatório Semanal de Manutenção" title="Tanques em manutenção" subtitle={subtitle} cutoffDateISO={cutoffDateISO} />

        <div className="flex min-h-0 flex-1 flex-col gap-[14px] px-[56px] py-[18px]">
          {/* Linha de resumo — contagem abaixo do previsto + classificação de prazo, separadas */}
          <div className="flex shrink-0 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-[16px] w-[4px]" style={{ background: "var(--rp-accent)" }} />
              <span className="text-[15px] font-bold" style={{ color: "var(--rp-blue)" }}>
                {attention.belowPrevistoCount} de {attention.total} abaixo do avanço previsto
              </span>
            </div>
            <span className="text-[13px]" style={{ color: "var(--rp-gray)" }}>
              {classificationSummary}
            </span>
          </div>

          {/* Matriz executiva */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <div
              className="grid grid-cols-[1fr_1fr_1.8fr_1fr_1fr_1fr_1.1fr] items-center gap-x-[10px] px-[10px] py-[8px] text-[11.5px] font-bold uppercase tracking-wide text-white"
              style={{ background: "var(--rp-blue)" }}
            >
              <span>Tag</span>
              <span>Área</span>
              <span>Fase atual</span>
              <span>Previsto</span>
              <span>Realizado</span>
              <span className="text-right">Desvio</span>
              <span>Entrega prevista</span>
            </div>
            {visibleRows.map((row, i) => (
              <div
                key={row.tag}
                className="grid grid-cols-[1fr_1fr_1.8fr_1fr_1fr_1fr_1.1fr] items-center gap-x-[10px] px-[10px] py-[7px] text-[13.5px]"
                style={{ background: i % 2 === 1 ? "var(--rp-gray-bg)" : "var(--rp-white)" }}
              >
                <span className="font-mono font-bold" style={{ color: "var(--rp-blue)" }}>
                  {row.tag}
                </span>
                <span className="truncate" style={{ color: "var(--rp-gray)" }}>
                  {row.area}
                </span>
                <span className="truncate">{row.faseAtual}</span>
                <span className="flex items-center gap-[6px] font-mono">
                  {row.previsto}%
                  <DonutGauge value={row.previsto} color="var(--rp-blue)" size={24} strokeWidth={4} showLabel={false} />
                </span>
                <span className="flex items-center gap-[6px] font-mono font-bold">
                  {row.realizado}%
                  <DonutGauge value={row.realizado} color="var(--rp-accent)" size={24} strokeWidth={4} showLabel={false} />
                </span>
                <span
                  className="text-right font-mono font-semibold"
                  style={{ color: row.desvioPP < 0 ? "var(--rp-danger)" : "var(--rp-ink)" }}
                >
                  {formatPP(row.desvioPP)}
                </span>
                <span className="font-mono text-[12.5px]" style={{ color: "var(--rp-gray)" }}>
                  {formatShort(row.previsaoEntrega || undefined)}
                </span>
              </div>
            ))}
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={onShowAllTanks}
                className="mt-[6px] text-[12.5px] font-semibold hover:opacity-70"
                style={{ color: "var(--rp-blue)" }}
              >
                +{hiddenCount} tanque{hiddenCount > 1 ? "s" : ""} — ver detalhamento completo →
              </button>
            )}
          </div>

          {/* Próxima entrega + Inspeções e restrições */}
          <div className="flex shrink-0 gap-[16px]" style={{ height: 150 }}>
            <SlidePanel title="Próxima Entrega Prevista" className="w-[32%]">
              {nextDelivery ? (
                <div>
                  <p className="font-mono text-[26px] font-extrabold leading-none" style={{ color: "var(--rp-blue)" }}>
                    {formatShort(nextDelivery.previsaoEntrega).toUpperCase()}
                  </p>
                  <p className="mt-2 text-[13px]" style={{ color: "var(--rp-gray)" }}>
                    {nextDelivery.tag} / {nextDelivery.faseAtual}
                  </p>
                </div>
              ) : (
                <p className="text-[13px]" style={{ color: "var(--rp-gray)" }}>
                  Sem entrega prevista cadastrada no escopo.
                </p>
              )}
            </SlidePanel>

            <SlidePanel title="Inspeções e Restrições" className="flex-1">
              <p className="text-[14px] font-bold" style={{ color: "var(--rp-blue)" }}>
                {inspecoesVencidas} de {rows.length} com inspeção interna vencida no cadastro.
              </p>

              {editable ? (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11.5px]" style={{ color: "var(--rp-gray)" }}>
                    {criticalPoints.length} restriçõe{criticalPoints.length === 1 ? "" : "s"} registrada{criticalPoints.length === 1 ? "" : "s"}
                  </span>
                  {criticalPoints.length < MAX_CRITICAL_POINTS && (
                    <button type="button" onClick={addPoint} className="flex items-center gap-1 text-[12px] font-semibold hover:opacity-70" style={{ color: "var(--rp-blue)" }}>
                      <Plus className="h-3.5 w-3.5" /> Adicionar
                    </button>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-[13px]" style={{ color: "var(--rp-gray)" }}>
                  {criticalPoints.length === 0
                    ? "Sem restrições específicas registradas no relatório."
                    : criticalPoints.map((p) => `${p.tag ? `${p.tag}: ` : ""}${p.situacao || "—"}`).join(" · ")}
                </p>
              )}

              {editable && criticalPoints.length > 0 && (
                <div className="mt-2 grid max-h-[220px] grid-cols-2 gap-[10px] overflow-y-auto pr-1">
                  {criticalPoints.map((p) => (
                    <div
                      key={p.id}
                      className="relative rounded-[6px] border-l-[3px] px-[10px] py-[8px] text-[11.5px]"
                      style={{ borderColor: "var(--rp-danger)", background: "var(--rp-gray-bg)" }}
                    >
                      <button
                        type="button"
                        onClick={() => removePoint(p.id)}
                        aria-label="Remover"
                        className="absolute right-[6px] top-[6px]"
                        style={{ color: "var(--rp-gray)" }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex flex-col gap-1 pr-[16px]">
                        <input
                          value={p.tag}
                          onChange={(e) => updatePoint(p.id, { tag: e.target.value })}
                          placeholder="TAG (opcional)"
                          className="bg-transparent font-mono text-[12px] font-bold outline-none placeholder:text-[color:var(--rp-gray)]"
                          style={{ color: "var(--rp-blue)" }}
                        />
                        <textarea
                          value={p.situacao}
                          onChange={(e) => updatePoint(p.id, { situacao: e.target.value })}
                          placeholder="Situação / impedimento"
                          rows={2}
                          className="resize-none bg-transparent outline-none placeholder:text-[color:var(--rp-gray)]"
                        />
                        <input
                          value={p.impacto}
                          onChange={(e) => updatePoint(p.id, { impacto: e.target.value })}
                          placeholder="Impacto previsto"
                          className="bg-transparent outline-none placeholder:text-[color:var(--rp-gray)]"
                        />
                        <input
                          value={p.acao}
                          onChange={(e) => updatePoint(p.id, { acao: e.target.value })}
                          placeholder="Ação necessária"
                          className="bg-transparent font-semibold outline-none placeholder:text-[color:var(--rp-gray)]"
                        />
                        <div className="flex gap-2">
                          <input
                            value={p.responsavel}
                            onChange={(e) => updatePoint(p.id, { responsavel: e.target.value })}
                            placeholder="Responsável"
                            className="w-1/2 bg-transparent text-[10.5px] outline-none placeholder:text-[color:var(--rp-gray)]"
                            style={{ color: "var(--rp-gray)" }}
                          />
                          <input
                            type="date"
                            value={p.prazo}
                            onChange={(e) => updatePoint(p.id, { prazo: e.target.value })}
                            className="w-1/2 bg-transparent text-[10.5px] outline-none"
                            style={{ color: "var(--rp-gray)" }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SlidePanel>
          </div>
        </div>

        <SlideFooter source="Fonte: Relatório Executivo e Tank Control. Desvio = realizado − previsto. Uso interno." page="02 / 02" />
      </div>
    </SlideFrame>
  );
}
