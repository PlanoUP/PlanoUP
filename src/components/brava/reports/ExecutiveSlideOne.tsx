"use client";

import { Boxes, Wrench, CheckCircle2, AlertTriangle, TrendingUp, Wallet } from "lucide-react";
import SlideFrame from "./SlideFrame";
import EditableList from "./EditableList";
import { ReportKpis, ReportPhysicalProgress, ReportFinancialSummary, ReportHighlight } from "@/lib/brava/reports/types";
import { formatShort } from "@/lib/brava/date-utils";

function fmtMM(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MM`;
}

function fmtPP(value: number): string {
  return `${value > 0 ? "+" : ""}${value} p.p.`;
}

export default function ExecutiveSlideOne({
  scopeLabel,
  weekLabel,
  cutoffDateISO,
  kpis,
  physicalProgress,
  financial,
  avancosSemana,
  riscos,
  decisoes,
  editable,
  onChangeAvancos,
  onChangeRiscos,
  onChangeDecisoes,
}: {
  scopeLabel: string;
  weekLabel: string;
  cutoffDateISO: string;
  kpis: ReportKpis;
  physicalProgress: ReportPhysicalProgress;
  financial: ReportFinancialSummary;
  avancosSemana: ReportHighlight[];
  riscos: ReportHighlight[];
  decisoes: ReportHighlight[];
  editable: boolean;
  onChangeAvancos: (items: ReportHighlight[]) => void;
  onChangeRiscos: (items: ReportHighlight[]) => void;
  onChangeDecisoes: (items: ReportHighlight[]) => void;
}) {
  return (
    <SlideFrame label="Slide 1 — Visão Geral da Carteira">
      <div className="flex h-full flex-col px-[56px] pt-[40px]">
        {/* Header */}
        <div className="flex items-start justify-between border-b-[3px] border-[color:var(--rp-blue)] pb-[18px]">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-[color:var(--rp-blue)]">
              {scopeLabel}
            </p>
            <h1 className="mt-1 text-[38px] font-extrabold leading-none tracking-tight text-[color:var(--rp-blue)]">
              GESTÃO DE TANQUES <span className="text-[color:var(--rp-ink)]">| RESUMO EXECUTIVO</span>
            </h1>
          </div>
          <div className="pt-1 text-right">
            <p className="text-[14px] font-bold uppercase tracking-wide text-[color:var(--rp-ink)]">{weekLabel}</p>
            <p className="text-[12.5px] text-[color:var(--rp-gray)]">Data de corte: {formatShort(cutoffDateISO)}</p>
          </div>
        </div>

        {/* Bloco A — Indicadores principais */}
        <div className="mt-[22px] grid grid-cols-4 gap-[18px]">
          <KpiTile icon={Boxes} label="Total da Carteira" value={kpis.total} />
          <KpiTile icon={Wrench} label="Em Manutenção" value={kpis.emManutencao} accent />
          <KpiTile icon={CheckCircle2} label="Concluídos" value={kpis.concluidos} />
          <KpiTile icon={AlertTriangle} label="Atenção / Crítico" value={kpis.atencaoOuCritico} alert={kpis.atencaoOuCritico > 0} />
        </div>

        {/* Bloco B — Desempenho físico */}
        <SectionLabel icon={TrendingUp} text="Desempenho Físico Consolidado" />
        <div className="grid grid-cols-4 gap-[18px]">
          <StatTile label="Avanço Previsto" value={`${physicalProgress.previsto}%`} />
          <StatTile label="Avanço Realizado" value={`${physicalProgress.realizado}%`} strong />
          <StatTile
            label="Desvio Físico"
            value={fmtPP(physicalProgress.desvioPP)}
            alert={physicalProgress.desvioPP < 0}
          />
          <StatTile
            label="Evolução vs. Semana Anterior"
            value={physicalProgress.deltaSemanaAnterior === null ? "—" : fmtPP(physicalProgress.deltaSemanaAnterior)}
            hint={physicalProgress.deltaSemanaAnterior === null ? "Sem semana fechada anterior" : undefined}
          />
        </div>

        {/* Bloco C — Desempenho financeiro */}
        <SectionLabel icon={Wallet} text="Desempenho Financeiro (CAPEX)" />
        {financial.hasData ? (
          <div className="grid grid-cols-4 gap-[18px]">
            <StatTile label="CAPEX Orçado" value={fmtMM(financial.orcado)} />
            <StatTile label="CAPEX Realizado" value={fmtMM(financial.realizado)} strong />
            <StatTile label="Saldo" value={fmtMM(financial.saldo)} alert={financial.saldo < 0} />
            <StatTile
              label="Cobertura de Dados"
              value={`${financial.tanksWithData}/${financial.tanksInScope}`}
              hint="tanques com custo cadastrado"
            />
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-[color:var(--rp-line)] bg-[color:var(--rp-gray-bg)] px-[22px] py-[16px] text-[14.5px] text-[color:var(--rp-gray)]">
            Dados financeiros indisponíveis para este escopo — nenhum tanque da seleção tem custo cadastrado no sistema.
          </div>
        )}

        {/* Bloco D — Resumo executivo */}
        <div className="mt-[22px] grid flex-1 grid-cols-3 gap-[22px] overflow-hidden border-t-2 border-[color:var(--rp-line)] pt-[18px]">
          <SummaryColumn title="Avanços da Semana" tone="blue">
            <EditableList items={avancosSemana} onChange={onChangeAvancos} editable={editable} placeholder="Marco concluído ou evolução relevante" />
          </SummaryColumn>
          <SummaryColumn title="Riscos e Restrições" tone="amber">
            <EditableList items={riscos} onChange={onChangeRiscos} editable={editable} placeholder="Impedimento que afeta prazo, custo ou segurança" />
          </SummaryColumn>
          <SummaryColumn title="Decisões Necessárias" tone="blue">
            <EditableList items={decisoes} onChange={onChangeDecisoes} editable={editable} placeholder="Ação que depende de deliberação gerencial" />
          </SummaryColumn>
        </div>

        <p className="pb-[16px] pt-[10px] text-[11px] text-[color:var(--rp-gray)]">
          BRAVA ENERGIA · SHUTDOWN CONTROL · EXECUTIVE REPORT — uso interno
        </p>
      </div>
    </SlideFrame>
  );
}

function SectionLabel({ icon: Icon, text }: { icon: typeof TrendingUp; text: string }) {
  return (
    <div className="mb-[10px] mt-[20px] flex items-center gap-2">
      <Icon className="h-[16px] w-[16px] text-[color:var(--rp-blue)]" strokeWidth={2} />
      <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-[color:var(--rp-blue)]">{text}</span>
    </div>
  );
}

function KpiTile({
  icon: Icon,
  label,
  value,
  accent,
  alert,
}: {
  icon: typeof Boxes;
  label: string;
  value: number;
  accent?: boolean;
  alert?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[10px] bg-[color:var(--rp-gray-bg)] px-[20px] py-[16px]">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-semibold uppercase tracking-wide text-[color:var(--rp-gray)]">{label}</span>
        <Icon
          className="h-[18px] w-[18px]"
          strokeWidth={2}
          style={{ color: alert ? "var(--rp-danger)" : accent ? "var(--rp-blue)" : "var(--rp-gray)" }}
        />
      </div>
      <span
        className="font-mono text-[38px] font-extrabold leading-none"
        style={{ color: alert ? "var(--rp-danger)" : "var(--rp-blue)" }}
      >
        {value}
      </span>
    </div>
  );
}

function StatTile({
  label,
  value,
  strong,
  alert,
  hint,
}: {
  label: string;
  value: string;
  strong?: boolean;
  alert?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] border border-[color:var(--rp-line)] px-[20px] py-[14px]">
      <span className="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--rp-gray)]">{label}</span>
      <span
        className="font-mono text-[26px] font-extrabold leading-none"
        style={{ color: alert ? "var(--rp-danger)" : strong ? "var(--rp-blue)" : "var(--rp-ink)" }}
      >
        {value}
      </span>
      {hint && <span className="text-[11px] text-[color:var(--rp-gray)]">{hint}</span>}
    </div>
  );
}

function SummaryColumn({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "blue" | "amber";
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden">
      <div className="mb-[12px] flex items-center gap-2">
        <span
          className="h-[10px] w-[10px] rounded-full"
          style={{ background: tone === "amber" ? "var(--rp-amber)" : "var(--rp-blue)" }}
        />
        <h3 className="text-[15px] font-bold uppercase tracking-wide text-[color:var(--rp-ink)]">{title}</h3>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
    </div>
  );
}
