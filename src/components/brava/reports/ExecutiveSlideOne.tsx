"use client";

import SlideFrame from "./SlideFrame";
import SlideHeader from "./SlideHeader";
import SlideFooter from "./SlideFooter";
import SlidePanel from "./SlidePanel";
import DonutGauge from "./DonutGauge";
import EditableList from "./EditableList";
import {
  ReportKpis,
  ReportPhysicalProgress,
  ReportFinancialSummary,
  ReportHighlight,
  ReportScope,
} from "@/lib/brava/reports/types";
import { AttentionSummary, formatPP, formatDeviationPhrase } from "@/lib/brava/reports/calculations";

function fmtMi(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mi`;
}

export default function ExecutiveSlideOne({
  scope,
  scopeLabel,
  cutoffDateISO,
  kpis,
  physicalProgress,
  financial,
  attention,
  avancosSemana,
  riscos,
  decisoes,
  editable,
  onChangeAvancos,
  onChangeRiscos,
  onChangeDecisoes,
}: {
  scope: ReportScope;
  scopeLabel: string;
  cutoffDateISO: string;
  kpis: ReportKpis;
  physicalProgress: ReportPhysicalProgress;
  financial: ReportFinancialSummary;
  attention: AttentionSummary;
  avancosSemana: ReportHighlight[];
  riscos: ReportHighlight[];
  decisoes: ReportHighlight[];
  editable: boolean;
  onChangeAvancos: (items: ReportHighlight[]) => void;
  onChangeRiscos: (items: ReportHighlight[]) => void;
  onChangeDecisoes: (items: ReportHighlight[]) => void;
}) {
  const subtitle = scope === "CONSOLIDADO" ? "Ativo Industrial de Guamaré" : `${scopeLabel} · Ativo Industrial de Guamaré`;
  const magnitude = Math.abs(physicalProgress.desvioPP);
  const deviationWords =
    physicalProgress.desvioPP === 0 ? "Dentro do previsto" : `pontos ${physicalProgress.desvioPP < 0 ? "abaixo" : "acima"} do previsto`;

  const attentionHeadline = !attention.worst
    ? attention.total === 0
      ? "Nenhum tanque em execução no escopo selecionado."
      : "Nenhum tanque em execução está abaixo do previsto."
    : `${attention.belowPrevistoCount} de ${attention.total} em execução abaixo do previsto. Maior desvio no ${attention.worst.tag} (${formatPP(attention.worst.desvioPP)}).`;

  const hasNarrative = avancosSemana.length > 0 || riscos.length > 0 || decisoes.length > 0;

  return (
    <SlideFrame label="Slide 1 — Visão Geral da Carteira">
      <div className="flex h-full flex-col">
        <SlideHeader eyebrow="Relatório Semanal de Manutenção" title="Visão geral da carteira" subtitle={subtitle} cutoffDateISO={cutoffDateISO} />

        <div className="flex min-h-0 flex-1 flex-col gap-[16px] px-[56px] py-[20px]">
          {/* Bloco A — Indicadores de carteira */}
          <div className="grid shrink-0 grid-cols-4 gap-[16px]">
            <KpiTile label="Tanques na carteira" value={kpis.total} emphasis />
            <KpiTile label="Em execução" value={kpis.emManutencao} />
            <KpiTile label="Concluídos" value={kpis.concluidos} />
            <KpiTile label="Inspeções internas vencidas" value={kpis.inspecoesVencidas} alert={kpis.inspecoesVencidas > 0} />
          </div>

          {/* Bloco B — Avanço físico + CAPEX */}
          <div className="flex min-h-0 flex-[1.15] gap-[16px]">
            <SlidePanel title="Avanço Físico Consolidado" className="w-[60%]">
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center gap-[22px]">
                  <div className="flex flex-col items-center gap-1.5">
                    <DonutGauge value={physicalProgress.previsto} color="var(--rp-blue)" size={118} strokeWidth={12} />
                    <span className="text-[13px] font-bold" style={{ color: "var(--rp-blue)" }}>
                      Previsto
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <DonutGauge value={physicalProgress.realizado} color="var(--rp-accent)" size={118} strokeWidth={12} />
                    <span className="text-[13px] font-bold" style={{ color: "var(--rp-ink)" }}>
                      Realizado
                    </span>
                  </div>
                  <div
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 self-stretch rounded-[8px] px-[14px] py-[10px] text-center"
                    style={{ background: "var(--rp-accent)" }}
                    aria-label={formatDeviationPhrase(physicalProgress.desvioPP)}
                  >
                    <span className="font-mono text-[32px] font-extrabold leading-none" style={{ color: "var(--rp-blue)" }}>
                      {magnitude}
                    </span>
                    <span className="text-[12px] font-bold leading-tight" style={{ color: "var(--rp-blue)" }}>
                      {deviationWords}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-[12.5px]" style={{ color: "var(--rp-gray)" }}>
                  {physicalProgress.deltaSemanaAnterior === null
                    ? "Sem semana anterior fechada para comparação."
                    : `Evolução de ${formatPP(physicalProgress.deltaSemanaAnterior)} em relação à semana anterior.`}
                </p>
              </div>
            </SlidePanel>

            <SlidePanel title="CAPEX da Carteira" className="w-[40%]">
              {financial.hasData ? (
                <div className="flex h-full flex-col justify-between">
                  <div className="divide-y" style={{ borderColor: "var(--rp-line)" }}>
                    <CapexRow label="Orçado" value={fmtMi(financial.orcado)} />
                    <CapexRow label="Realizado" value={fmtMi(financial.realizado)} />
                    <CapexRow label="Saldo" value={fmtMi(financial.saldo)} alert={financial.saldo < 0} />
                  </div>
                  <p className="mt-2 text-[12px]" style={{ color: "var(--rp-gray)" }}>
                    Custos cadastrados para {financial.tanksWithData} de {financial.tanksInScope} tanques.
                  </p>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center px-2 text-center text-[13px]" style={{ color: "var(--rp-gray)" }}>
                  Dados financeiros indisponíveis — nenhum tanque do escopo tem custo cadastrado no sistema.
                </div>
              )}
            </SlidePanel>
          </div>

          {/* Bloco C — Pontos de atenção */}
          <SlidePanel title="Pontos de Atenção" className="min-h-0 flex-1">
            <p className="text-[15px] font-bold leading-snug" style={{ color: "var(--rp-blue)" }}>
              {attentionHeadline}
            </p>

            {editable ? (
              <div className="mt-3 grid grid-cols-3 gap-[18px]">
                <div>
                  <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "var(--rp-gray)" }}>
                    Avanços da Semana
                  </p>
                  <EditableList items={avancosSemana} onChange={onChangeAvancos} editable placeholder="Marco concluído ou evolução relevante" />
                </div>
                <div>
                  <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "var(--rp-gray)" }}>
                    Riscos e Restrições
                  </p>
                  <EditableList items={riscos} onChange={onChangeRiscos} editable placeholder="Impedimento que afeta prazo, custo ou segurança" />
                </div>
                <div>
                  <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "var(--rp-gray)" }}>
                    Decisões Necessárias
                  </p>
                  <EditableList items={decisoes} onChange={onChangeDecisoes} editable placeholder="Ação que depende de deliberação gerencial" />
                </div>
              </div>
            ) : hasNarrative ? (
              <div className="mt-2 flex flex-col gap-1 text-[13px]" style={{ color: "var(--rp-ink)" }}>
                {avancosSemana.length > 0 && (
                  <p>
                    <span className="font-semibold">Avanços:</span> {avancosSemana.map((h) => h.text).join(" · ")}
                  </p>
                )}
                {riscos.length > 0 && (
                  <p>
                    <span className="font-semibold">Riscos:</span> {riscos.map((h) => h.text).join(" · ")}
                  </p>
                )}
                {decisoes.length > 0 && (
                  <p>
                    <span className="font-semibold">Decisões:</span> {decisoes.map((h) => h.text).join(" · ")}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-1 text-[13px]" style={{ color: "var(--rp-gray)" }}>
                Sem avanços da semana, riscos ou decisões necessárias registrados no relatório.
              </p>
            )}
          </SlidePanel>
        </div>

        <SlideFooter source="Fonte: Relatório Executivo e Consolidado de inspeções. Uso interno." page="01 / 02" />
      </div>
    </SlideFrame>
  );
}

function KpiTile({ label, value, emphasis, alert }: { label: string; value: number; emphasis?: boolean; alert?: boolean }) {
  return (
    <div
      className="flex flex-col justify-center gap-1 px-[18px] py-[14px]"
      style={emphasis ? { background: "var(--rp-blue)" } : { background: "var(--rp-white)", border: "1px solid var(--rp-line)" }}
    >
      <span
        className="font-mono text-[32px] font-extrabold leading-none"
        style={{ color: emphasis ? "var(--rp-accent)" : alert ? "var(--rp-danger)" : "var(--rp-blue)" }}
      >
        {value}
      </span>
      <span className="text-[12px] font-semibold" style={{ color: emphasis ? "rgba(255,255,255,0.85)" : "var(--rp-gray)" }}>
        {label}
      </span>
    </div>
  );
}

function CapexRow({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="flex items-center justify-between py-[9px]">
      <span className="text-[14px]" style={{ color: "var(--rp-ink)" }}>
        {label}
      </span>
      <span className="font-mono text-[18px] font-extrabold" style={{ color: alert ? "var(--rp-danger)" : "var(--rp-blue)" }}>
        {value}
      </span>
    </div>
  );
}
