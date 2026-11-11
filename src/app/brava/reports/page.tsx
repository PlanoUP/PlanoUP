"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "@/components/brava/PageHeader";
import ExecutiveSlideOne from "@/components/brava/reports/ExecutiveSlideOne";
import ExecutiveSlideTwo from "@/components/brava/reports/ExecutiveSlideTwo";
import ReportsControlBar from "@/components/brava/reports/ReportsControlBar";
import ReportHistoryPanel from "@/components/brava/reports/ReportHistoryPanel";
import { ExecutiveReportsProvider, useExecutiveReports } from "@/lib/brava/reports/context";
import { useBravaData } from "@/lib/brava/context";
import { useCostsData } from "@/lib/brava/costs/context";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import {
  getReportScopes,
  filterByScope,
  computeReportKpis,
  computeConsolidatedProgress,
  computeFinancialSummary,
  buildTankMatrix,
  buildMilestones,
  suggestCriticalPoints,
  computeAttentionSummary,
  summarizeClassifications,
  findNextDelivery,
} from "@/lib/brava/reports/calculations";
import {
  ExecutiveReportSnapshot,
  ExecutiveReportDraftInput,
  ReportHighlight,
  ReportCriticalPoint,
  ReportScope,
  ReportTankRow,
} from "@/lib/brava/reports/types";
import { todayISO, formatShort } from "@/lib/brava/date-utils";

function mostRecentMonday(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  const sinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - sinceMonday);
  return d.toISOString().slice(0, 10);
}

function reportId(scope: ReportScope, weekStartISO: string): string {
  return `${scope}:${weekStartISO}`;
}

function ReportsPageContent() {
  const { tanks } = useBravaData();
  const { costs } = useCostsData();
  const { requireEditor } = useEditAuth();
  const { reports, status, saveDraft, closeReport } = useExecutiveReports();

  const scopes = useMemo(() => getReportScopes(tanks), [tanks]);
  const [scope, setScope] = useState<ReportScope>("CONSOLIDADO");
  const [weekStartISO, setWeekStartISO] = useState(() => mostRecentMonday(todayISO()));
  const [cutoffDateISO, setCutoffDateISO] = useState(() => todayISO());
  const [editing, setEditing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showAllTanks, setShowAllTanks] = useState(false);
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  const [avancosSemana, setAvancosSemana] = useState<ReportHighlight[]>([]);
  const [riscos, setRiscos] = useState<ReportHighlight[]>([]);
  const [decisoes, setDecisoes] = useState<ReportHighlight[]>([]);
  const [criticalPoints, setCriticalPoints] = useState<ReportCriticalPoint[]>([]);

  const id = reportId(scope, weekStartISO);
  const existingDraft = reports.find((r) => r.id === id) ?? null;
  const viewingHistory = viewingHistoryId ? reports.find((r) => r.id === viewingHistoryId) ?? null : null;

  const scopedTanks = useMemo(() => filterByScope(tanks, scope), [tanks, scope]);

  const previousRealizado = useMemo(() => {
    const priorClosed = reports
      .filter((r) => r.scope === scope && r.closedAt !== null && r.weekStartISO < weekStartISO)
      .sort((a, b) => b.weekStartISO.localeCompare(a.weekStartISO))[0];
    return priorClosed ? priorClosed.physicalProgress.realizado : null;
  }, [reports, scope, weekStartISO]);

  const kpis = useMemo(() => computeReportKpis(scopedTanks), [scopedTanks]);
  const physicalProgress = useMemo(
    () => computeConsolidatedProgress(scopedTanks, cutoffDateISO, previousRealizado),
    [scopedTanks, cutoffDateISO, previousRealizado]
  );
  const financial = useMemo(() => computeFinancialSummary(scopedTanks, costs), [scopedTanks, costs]);
  const tankMatrix = useMemo(() => buildTankMatrix(scopedTanks, cutoffDateISO), [scopedTanks, cutoffDateISO]);
  // Not shown on the revised slides (Etapa 1 drops the "Próximos Marcos" block
  // per the new reference), but still computed and frozen on close so a
  // future stage can bring it back without a schema change.
  const milestones = useMemo(() => buildMilestones(scopedTanks, cutoffDateISO, 14), [scopedTanks, cutoffDateISO]);

  // Seed the narrative fields (the only part a draft actually persists)
  // once per id, the first time this id's data is known to be loaded —
  // never on a later poll refresh, so it can't clobber an edit in progress.
  const seedKeyRef = useRef<string>("");
  useEffect(() => {
    const key = `${id}|${status}`;
    if (status !== "ready" || seedKeyRef.current === key) return;
    seedKeyRef.current = key;
    if (existingDraft) {
      setAvancosSemana(existingDraft.avancosSemana);
      setRiscos(existingDraft.riscos);
      setDecisoes(existingDraft.decisoes);
      setCriticalPoints(existingDraft.criticalPoints);
    } else {
      setAvancosSemana([]);
      setRiscos([]);
      setDecisoes([]);
      setCriticalPoints(suggestCriticalPoints(scopedTanks));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, status]);

  function persistDraft(patch: Partial<Pick<ExecutiveReportDraftInput, "avancosSemana" | "riscos" | "decisoes" | "criticalPoints">>) {
    const input: ExecutiveReportDraftInput = {
      scope,
      weekStartISO,
      cutoffDateISO,
      avancosSemana: patch.avancosSemana ?? avancosSemana,
      riscos: patch.riscos ?? riscos,
      decisoes: patch.decisoes ?? decisoes,
      criticalPoints: patch.criticalPoints ?? criticalPoints,
    };
    saveDraft(input).catch((err) => console.error("Falha ao salvar rascunho do relatório:", err));
  }

  function handleChangeAvancos(items: ReportHighlight[]) {
    setAvancosSemana(items);
    persistDraft({ avancosSemana: items });
  }
  function handleChangeRiscos(items: ReportHighlight[]) {
    setRiscos(items);
    persistDraft({ riscos: items });
  }
  function handleChangeDecisoes(items: ReportHighlight[]) {
    setDecisoes(items);
    persistDraft({ decisoes: items });
  }
  function handleChangeCriticalPoints(items: ReportCriticalPoint[]) {
    setCriticalPoints(items);
    persistDraft({ criticalPoints: items });
  }

  function handleScopeChange(s: ReportScope) {
    setScope(s);
    setViewingHistoryId(null);
    setEditing(false);
  }
  function handleWeekChange(iso: string) {
    setWeekStartISO(iso);
    setViewingHistoryId(null);
    setEditing(false);
  }
  function handleSelectHistory(snapshot: ExecutiveReportSnapshot) {
    setScope(snapshot.scope);
    setWeekStartISO(snapshot.weekStartISO);
    setCutoffDateISO(snapshot.cutoffDateISO);
    setViewingHistoryId(snapshot.id);
    setEditing(false);
    setHistoryOpen(false);
  }
  function handleToggleEdit() {
    if (!editing) {
      if (!requireEditor()) return;
      setEditing(true);
    } else {
      setEditing(false);
    }
  }

  async function handleCloseWeek() {
    if (!requireEditor()) return;
    if (
      !window.confirm(
        `Fechar a semana de ${formatShort(weekStartISO)}? Os dados computados ficarão congelados e não poderão mais ser alterados.`
      )
    ) {
      return;
    }
    setClosing(true);
    setCloseError(null);
    const now = new Date().toISOString();
    const snapshot: ExecutiveReportSnapshot = {
      id,
      scope,
      weekStartISO,
      cutoffDateISO,
      closedAt: null,
      kpis,
      physicalProgress,
      financial,
      tankMatrix,
      milestones,
      avancosSemana,
      riscos,
      decisoes,
      criticalPoints,
      createdAt: existingDraft?.createdAt ?? now,
      updatedAt: now,
    };
    try {
      const closed = await closeReport(snapshot);
      setViewingHistoryId(closed.id);
      setEditing(false);
    } catch (err) {
      setCloseError(err instanceof Error ? err.message : "Falha ao fechar o relatório.");
    } finally {
      setClosing(false);
    }
  }

  const activeSnapshot = viewingHistory ?? {
    scope,
    weekStartISO,
    cutoffDateISO,
    closedAt: existingDraft?.closedAt ?? null,
    kpis,
    physicalProgress,
    financial,
    tankMatrix,
    milestones,
    avancosSemana,
    riscos,
    decisoes,
    criticalPoints,
  };

  const scopeLabel = scopes.find((s) => s.value === activeSnapshot.scope)?.label ?? activeSnapshot.scope;
  const editable = editing && !viewingHistory;

  // Slide 2 lists only tanks actually under execution — derived from the
  // snapshot's own tankMatrix (works the same for a live draft or a frozen
  // historical one) by excluding the two non-executing faseAtual sentinels
  // buildTankMatrix uses, then sorted by the worst physical deviation first.
  const executingRows = useMemo(() => {
    return activeSnapshot.tankMatrix
      .filter((r) => r.faseAtual !== "Concluído" && r.faseAtual !== "Aguardando início")
      .slice()
      .sort((a: ReportTankRow, b: ReportTankRow) => a.desvioPP - b.desvioPP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSnapshot.tankMatrix]);

  const attention = useMemo(() => computeAttentionSummary(executingRows), [executingRows]);
  const classificationSummary = useMemo(() => summarizeClassifications(executingRows), [executingRows]);
  const nextDelivery = useMemo(() => findNextDelivery(executingRows), [executingRows]);

  // Inspection status isn't part of the frozen snapshot schema (that's a
  // closing/history concern left for a later stage), so this always reads
  // the CURRENT live inspection status for whichever tanks are shown —
  // exact for a live draft, a reasonable "as of today" approximation when
  // looking at a historical week.
  const inspecoesVencidasExecuting = useMemo(() => {
    const executingTags = new Set(executingRows.map((r) => r.tag.toUpperCase()));
    return tanks.filter((t) => executingTags.has(t.tag.toUpperCase()) && t.derived.inspectionCriticality === "CRITICO").length;
  }, [executingRows, tanks]);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Visão Geral", href: "/brava" }, { label: "Relatório Executivo" }]}
        title="Relatório Executivo Semanal"
        subtitle="Duas lâminas (16:9) para a diretoria, geradas a partir dos dados atuais de tanques em manutenção"
      />
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mb-5">
          <ReportsControlBar
            scopes={scopes}
            scope={scope}
            onScopeChange={handleScopeChange}
            weekStartISO={weekStartISO}
            onWeekStartChange={handleWeekChange}
            cutoffDateISO={cutoffDateISO}
            onCutoffDateChange={setCutoffDateISO}
            onResetCutoffToToday={() => setCutoffDateISO(todayISO())}
            editing={editable}
            onToggleEdit={handleToggleEdit}
            closedAt={viewingHistory ? viewingHistory.closedAt : existingDraft?.closedAt ?? null}
            onCloseWeek={handleCloseWeek}
            closing={closing}
            historyOpen={historyOpen}
            onToggleHistory={() => setHistoryOpen((v) => !v)}
          />
          {closeError && <p className="mt-2 text-[12.5px] font-semibold text-brava-danger">{closeError}</p>}
          {viewingHistory && (
            <p className="mt-2 text-[12.5px] text-brava-text-secondary">
              Visualizando semana fechada em {formatShort(viewingHistory.closedAt?.slice(0, 10))}. Troque a semana ou o escopo acima para voltar ao rascunho atual.
            </p>
          )}
        </div>

        {historyOpen && (
          <div className="mb-5">
            <ReportHistoryPanel reports={reports} selectedId={viewingHistoryId} onSelect={handleSelectHistory} />
          </div>
        )}

        <div className="flex flex-col gap-6">
          <ExecutiveSlideOne
            scope={activeSnapshot.scope}
            scopeLabel={scopeLabel}
            cutoffDateISO={activeSnapshot.cutoffDateISO}
            kpis={activeSnapshot.kpis}
            physicalProgress={activeSnapshot.physicalProgress}
            financial={activeSnapshot.financial}
            attention={attention}
            avancosSemana={activeSnapshot.avancosSemana}
            riscos={activeSnapshot.riscos}
            decisoes={activeSnapshot.decisoes}
            editable={editable}
            onChangeAvancos={handleChangeAvancos}
            onChangeRiscos={handleChangeRiscos}
            onChangeDecisoes={handleChangeDecisoes}
          />
          <ExecutiveSlideTwo
            scope={activeSnapshot.scope}
            scopeLabel={scopeLabel}
            cutoffDateISO={activeSnapshot.cutoffDateISO}
            rows={executingRows}
            attention={attention}
            classificationSummary={classificationSummary}
            nextDelivery={nextDelivery}
            inspecoesVencidas={inspecoesVencidasExecuting}
            criticalPoints={activeSnapshot.criticalPoints}
            editable={editable}
            onChangeCriticalPoints={handleChangeCriticalPoints}
            onShowAllTanks={() => setShowAllTanks((v) => !v)}
          />
        </div>

        {showAllTanks && (
          <div className="mt-6 rounded-brava-md border border-brava-border bg-brava-white p-5 shadow-brava-sm">
            <h3 className="mb-3 text-[14px] font-semibold text-brava-blue-dark">
              Detalhamento completo — {activeSnapshot.tankMatrix.length} tanques
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-brava-border text-left text-brava-text-secondary">
                    <th className="py-1.5 pr-3 font-semibold">Tag</th>
                    <th className="py-1.5 pr-3 font-semibold">Área</th>
                    <th className="py-1.5 pr-3 font-semibold">Fase Atual</th>
                    <th className="py-1.5 pr-3 text-right font-semibold">Previsto</th>
                    <th className="py-1.5 pr-3 text-right font-semibold">Realizado</th>
                    <th className="py-1.5 pr-3 text-right font-semibold">Desvio</th>
                    <th className="py-1.5 pr-3 font-semibold">Entrega</th>
                    <th className="py-1.5 font-semibold">Classificação</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSnapshot.tankMatrix.map((row) => (
                    <tr key={row.tag} className="border-b border-brava-border/60">
                      <td className="py-1.5 pr-3 font-mono font-semibold text-brava-blue">{row.tag}</td>
                      <td className="py-1.5 pr-3 text-brava-text-secondary">{row.area}</td>
                      <td className="py-1.5 pr-3">{row.faseAtual}</td>
                      <td className="py-1.5 pr-3 text-right font-mono">{row.previsto}%</td>
                      <td className="py-1.5 pr-3 text-right font-mono font-semibold">{row.realizado}%</td>
                      <td className="py-1.5 pr-3 text-right font-mono">
                        {row.desvioPP > 0 ? "+" : ""}
                        {row.desvioPP}pp
                      </td>
                      <td className="py-1.5 pr-3 font-mono text-[11.5px] text-brava-text-secondary">{formatShort(row.previsaoEntrega || undefined)}</td>
                      <td className="py-1.5">{row.classificacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function ExecutiveReportsPage() {
  return (
    <ExecutiveReportsProvider>
      <ReportsPageContent />
    </ExecutiveReportsProvider>
  );
}
