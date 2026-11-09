"use client";

import { Plus, X } from "lucide-react";
import SlideFrame from "./SlideFrame";
import { ReportTankRow, ReportCriticalPoint, ReportMilestone } from "@/lib/brava/reports/types";
import { formatShort } from "@/lib/brava/date-utils";

const MAX_ROWS_ON_SLIDE = 8;
const MAX_CRITICAL_POINTS = 4;

const CLASS_META: Record<ReportTankRow["classificacao"], { label: string; color: string; bg: string }> = {
  CRITICO: { label: "Crítico", color: "#C0152F", bg: "#FBEAEC" },
  ATENCAO: { label: "Atenção", color: "#B54708", bg: "#FBF2E6" },
  NO_PRAZO: { label: "No Prazo", color: "#1A0572", bg: "#EFEDF9" },
  CONCLUIDO: { label: "Concluído", color: "#067647", bg: "#E7F6EE" },
};

function genId(): string {
  return `cp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ExecutiveSlideTwo({
  scopeLabel,
  weekLabel,
  tankMatrix,
  criticalPoints,
  milestones,
  editable,
  onChangeCriticalPoints,
  onShowAllTanks,
}: {
  scopeLabel: string;
  weekLabel: string;
  tankMatrix: ReportTankRow[];
  criticalPoints: ReportCriticalPoint[];
  milestones: ReportMilestone[];
  editable: boolean;
  onChangeCriticalPoints: (points: ReportCriticalPoint[]) => void;
  onShowAllTanks: () => void;
}) {
  const visibleRows = tankMatrix.slice(0, MAX_ROWS_ON_SLIDE);
  const hiddenCount = tankMatrix.length - visibleRows.length;

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
      <div className="flex h-full flex-col px-[56px] pt-[40px]">
        {/* Header */}
        <div className="flex items-start justify-between border-b-[3px] border-[color:var(--rp-blue)] pb-[18px]">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-[color:var(--rp-blue)]">{scopeLabel}</p>
            <h1 className="mt-1 text-[38px] font-extrabold leading-none tracking-tight text-[color:var(--rp-blue)]">
              TANQUES EM MANUTENÇÃO <span className="text-[color:var(--rp-ink)]">| DESEMPENHO E RESTRIÇÕES</span>
            </h1>
          </div>
          <p className="pt-1 text-[14px] font-bold uppercase tracking-wide text-[color:var(--rp-ink)]">{weekLabel}</p>
        </div>

        {/* Bloco A — Matriz executiva */}
        <div className="mt-[18px]">
          <div className="grid grid-cols-[1fr_1fr_2fr_1fr_1fr_1fr_1fr_1.1fr] gap-x-[10px] border-b-2 border-[color:var(--rp-line)] pb-[8px] text-[11.5px] font-bold uppercase tracking-wide text-[color:var(--rp-gray)]">
            <span>Tag</span>
            <span>Área</span>
            <span>Fase Atual</span>
            <span className="text-right">Previsto</span>
            <span className="text-right">Realizado</span>
            <span className="text-right">Desvio</span>
            <span>Entrega</span>
            <span>Classificação</span>
          </div>
          {visibleRows.map((row) => {
            const meta = CLASS_META[row.classificacao];
            return (
              <div
                key={row.tag}
                className="grid grid-cols-[1fr_1fr_2fr_1fr_1fr_1fr_1fr_1.1fr] items-center gap-x-[10px] border-b border-[color:var(--rp-line)] py-[8px] text-[14px]"
              >
                <span className="font-mono font-bold text-[color:var(--rp-blue)]">{row.tag}</span>
                <span className="truncate text-[color:var(--rp-gray)]">{row.area}</span>
                <span className="truncate">{row.faseAtual}</span>
                <span className="text-right font-mono">{row.previsto}%</span>
                <span className="text-right font-mono font-bold">{row.realizado}%</span>
                <span
                  className="text-right font-mono font-semibold"
                  style={{ color: row.desvioPP < 0 ? "var(--rp-danger)" : "var(--rp-ink)" }}
                >
                  {row.desvioPP > 0 ? "+" : ""}
                  {row.desvioPP}pp
                </span>
                <span className="font-mono text-[12.5px] text-[color:var(--rp-gray)]">{formatShort(row.previsaoEntrega)}</span>
                <span>
                  <span
                    className="inline-flex items-center rounded-full px-[10px] py-[3px] text-[11px] font-bold uppercase"
                    style={{ color: meta.color, background: meta.bg }}
                  >
                    {meta.label}
                  </span>
                </span>
              </div>
            );
          })}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={onShowAllTanks}
              className="mt-[6px] text-[12.5px] font-semibold text-[color:var(--rp-blue)] hover:opacity-70"
            >
              +{hiddenCount} tanque{hiddenCount > 1 ? "s" : ""} — ver detalhamento completo →
            </button>
          )}
        </div>

        {/* Bloco B — Pontos críticos */}
        <div className="mt-[18px] flex min-h-0 flex-1 gap-[22px] overflow-hidden">
          <div className="flex w-[62%] min-h-0 flex-col overflow-hidden">
            <div className="mb-[10px] flex items-center justify-between">
              <h3 className="text-[15px] font-bold uppercase tracking-wide text-[color:var(--rp-ink)]">Pontos Críticos</h3>
              {editable && criticalPoints.length < MAX_CRITICAL_POINTS && (
                <button
                  type="button"
                  onClick={addPoint}
                  className="flex items-center gap-1 text-[12.5px] font-semibold text-[color:var(--rp-blue)] hover:opacity-70"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </button>
              )}
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-2 gap-[12px] overflow-y-auto pr-1">
              {criticalPoints.length === 0 ? (
                <p className="col-span-2 text-[14px] italic text-[color:var(--rp-gray)]">Nenhum ponto crítico registrado.</p>
              ) : (
                criticalPoints.map((p) => (
                  <div key={p.id} className="relative rounded-[10px] border-l-[4px] border-[color:var(--rp-danger)] bg-[color:var(--rp-gray-bg)] px-[14px] py-[11px] text-[12.5px]">
                    {editable && (
                      <button
                        type="button"
                        onClick={() => removePoint(p.id)}
                        aria-label="Remover"
                        className="absolute right-[8px] top-[8px] text-[color:var(--rp-gray)] hover:text-[color:var(--rp-danger)]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {editable ? (
                      <div className="flex flex-col gap-1.5 pr-[16px]">
                        <input
                          value={p.tag}
                          onChange={(e) => updatePoint(p.id, { tag: e.target.value })}
                          placeholder="TAG (opcional)"
                          className="bg-transparent font-mono text-[13px] font-bold text-[color:var(--rp-blue)] outline-none placeholder:text-[color:var(--rp-gray)]"
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
                            className="w-1/2 bg-transparent text-[11.5px] text-[color:var(--rp-gray)] outline-none placeholder:text-[color:var(--rp-gray)]"
                          />
                          <input
                            type="date"
                            value={p.prazo}
                            onChange={(e) => updatePoint(p.id, { prazo: e.target.value })}
                            className="w-1/2 bg-transparent text-[11.5px] text-[color:var(--rp-gray)] outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        {p.tag && <p className="font-mono text-[13px] font-bold text-[color:var(--rp-blue)]">{p.tag}</p>}
                        <p className="mt-0.5 font-semibold">{p.situacao || "—"}</p>
                        {p.impacto && <p className="mt-1 text-[color:var(--rp-gray)]">Impacto: {p.impacto}</p>}
                        {p.acao && <p className="mt-0.5">Ação: {p.acao}</p>}
                        {(p.responsavel || p.prazo) && (
                          <p className="mt-1 text-[11.5px] text-[color:var(--rp-gray)]">
                            {p.responsavel}
                            {p.responsavel && p.prazo ? " · " : ""}
                            {p.prazo ? formatShort(p.prazo) : ""}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bloco C — Próximos marcos */}
          <div className="flex w-[38%] min-h-0 flex-col overflow-hidden border-l border-[color:var(--rp-line)] pl-[22px]">
            <h3 className="mb-[10px] text-[15px] font-bold uppercase tracking-wide text-[color:var(--rp-ink)]">
              Próximos Marcos (14 dias)
            </h3>
            <div className="flex min-h-0 flex-1 flex-col gap-[8px] overflow-y-auto pr-1">
              {milestones.length === 0 ? (
                <p className="text-[14px] italic text-[color:var(--rp-gray)]">Nenhum marco crítico no período.</p>
              ) : (
                milestones.map((m, i) => (
                  <div key={`${m.tag}-${m.nome}-${i}`} className="flex items-center gap-[10px] rounded-[8px] bg-[color:var(--rp-gray-bg)] px-[12px] py-[8px]">
                    <div className="flex h-[34px] w-[34px] shrink-0 flex-col items-center justify-center rounded-[6px] bg-[color:var(--rp-blue)] text-[color:var(--rp-white)]">
                      <span className="font-mono text-[13px] font-extrabold leading-none">{m.diasRestantes}</span>
                      <span className="text-[7px] font-semibold uppercase leading-none">dias</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">{m.nome}</p>
                      <p className="font-mono text-[11.5px] text-[color:var(--rp-gray)]">
                        {m.tag} · {formatShort(m.data)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <p className="pb-[16px] pt-[10px] text-[11px] text-[color:var(--rp-gray)]">
          BRAVA ENERGIA · SHUTDOWN CONTROL · EXECUTIVE REPORT — uso interno
        </p>
      </div>
    </SlideFrame>
  );
}
