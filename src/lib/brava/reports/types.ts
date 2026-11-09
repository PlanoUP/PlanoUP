// Executive Reports domain — a read-mostly, weekly-cadence layer over the
// existing Tank data, never a source of truth for tank fields themselves.
// A report "snapshot" freezes a set of COMPUTED figures (from tanks/costs
// at close time) plus a handful of fields no calculation can produce — the
// week's narrative highlights, risks, decisions and critical points, which
// only a person can author. Closing a report is what makes the computed
// figures immutable; the narrative fields stay editable up to that point.

/**
 * What the report is scoped to. "CONSOLIDADO" is every tracked tank
 * together; any other value is a Tank.area the real fleet actually uses
 * (e.g. "ETO", "Tancagem 6313") — there's no "ATI"/"TAG" field in the data
 * model today, so scope is built from the one real grouping that exists.
 * See getReportScopes() in calculations.ts.
 */
export type ReportScope = "CONSOLIDADO" | string;

export interface ReportHighlight {
  id: string;
  text: string;
}

export interface ReportCriticalPoint {
  id: string;
  tag: string; // "" for a point that isn't about one specific tank
  situacao: string;
  impacto: string;
  acao: string;
  responsavel: string;
  prazo: string; // ISO date, or "" if not set
}

export interface ReportKpis {
  total: number;
  emManutencao: number;
  programados: number;
  concluidos: number;
  atencaoOuCritico: number;
}

export interface ReportPhysicalProgress {
  previsto: number; // 0-100, duration-weighted across in-scope tanks, as of cutoffDate
  realizado: number; // 0-100, same weighting
  desvioPP: number; // realizado - previsto
  deltaSemanaAnterior: number | null; // realizado - previous closed report's realizado, same scope; null if no prior close
}

export interface ReportFinancialLine {
  tag: string;
  orcado: number;
  realizado: number;
}

export interface ReportFinancialSummary {
  /** false when no tank in scope has any cost_entries row — the slide shows "dado indisponível" instead of a fabricated R$ 0. */
  hasData: boolean;
  orcado: number;
  realizado: number;
  saldo: number; // orcado - realizado
  tanksWithData: number;
  tanksInScope: number;
  lines: ReportFinancialLine[];
}

export interface ReportTankRow {
  tag: string;
  area: string;
  faseAtual: string;
  previsto: number;
  realizado: number;
  desvioPP: number;
  previsaoEntrega: string; // ISO date, or "" if not yet known — format at render time
  classificacao: "CRITICO" | "ATENCAO" | "NO_PRAZO" | "CONCLUIDO";
}

export interface ReportMilestone {
  tag: string;
  nome: string;
  data: string; // ISO date
  diasRestantes: number;
}

export interface ExecutiveReportSnapshot {
  id: string; // `${scope}:${weekStartISO}`
  scope: ReportScope;
  weekStartISO: string; // Monday of the reference week
  cutoffDateISO: string; // the "data de corte" every computed figure below used
  closedAt: string | null; // null = draft (recomputed live); set = frozen, computed fields below are the historical record

  // Computed at render/close time from live tank+cost data (recomputed
  // live while closedAt is null; frozen once it isn't).
  kpis: ReportKpis;
  physicalProgress: ReportPhysicalProgress;
  financial: ReportFinancialSummary;
  tankMatrix: ReportTankRow[];
  milestones: ReportMilestone[];

  // Only a person can author these — never recomputed from tank data.
  avancosSemana: ReportHighlight[];
  riscos: ReportHighlight[];
  decisoes: ReportHighlight[];
  criticalPoints: ReportCriticalPoint[];

  createdAt: string;
  updatedAt: string;
}

/** What the client sends to create/update a draft — everything else is server-computed. */
export interface ExecutiveReportDraftInput {
  scope: ReportScope;
  weekStartISO: string;
  cutoffDateISO: string;
  avancosSemana: ReportHighlight[];
  riscos: ReportHighlight[];
  decisoes: ReportHighlight[];
  criticalPoints: ReportCriticalPoint[];
}
