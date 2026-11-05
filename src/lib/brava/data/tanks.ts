import { Activity, Tank, TankStatus } from "../types";
import {
  buildActivitiesFromTemplate,
  applyExecutionState,
  markFullyConcluded,
} from "../schedule-engine";

function slug(tag: string): string {
  return tag
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-");
}

interface ConcludedParams {
  tag: string;
  area: string;
  product: string;
  tankType: string;
  actualStart: string;
  actualEnd: string;
  nextInternalInspection?: string;
  notes?: string;
}

function buildConcluded(p: ConcludedParams): Tank {
  const id = slug(p.tag);
  const base = buildActivitiesFromTemplate(id, p.actualStart);
  const activities = markFullyConcluded(base, p.actualStart, p.actualEnd);
  return {
    id,
    tag: p.tag,
    area: p.area,
    product: p.product,
    tankType: p.tankType,
    status: "CONCLUIDO",
    nextInternalInspection: p.nextInternalInspection,
    notes: p.notes,
    activities,
  };
}

interface ActiveParams {
  tag: string;
  area: string;
  product: string;
  tankType: string;
  status: Extract<TankStatus, "EM_EXECUCAO" | "ATRASADO" | "CRITICO">;
  baselineStart: string;
  currentOrder: number;
  currentProgress: number;
  startOffsetDays?: number;
  nextInternalInspection?: string;
  responsible?: string;
  notes?: string;
}

function buildActive(p: ActiveParams): Tank {
  const id = slug(p.tag);
  const base = buildActivitiesFromTemplate(id, p.baselineStart);
  const activities = applyExecutionState(base, {
    currentOrder: p.currentOrder,
    currentProgress: p.currentProgress,
    startOffsetDays: p.startOffsetDays,
  });
  return {
    id,
    tag: p.tag,
    area: p.area,
    product: p.product,
    tankType: p.tankType,
    status: p.status,
    nextInternalInspection: p.nextInternalInspection,
    responsible: p.responsible,
    notes: p.notes,
    activities,
  };
}

type RealActivityInput = Omit<Activity, "id" | "tankId" | "dependsOn">;

interface FromScheduleParams {
  tag: string;
  area: string;
  product: string;
  tankType: string;
  status: Extract<TankStatus, "EM_EXECUCAO" | "ATRASADO" | "CRITICO">;
  activities: RealActivityInput[];
  nextInternalInspection?: string;
  responsible?: string;
  notes?: string;
  /**
   * The cronograma's own root % complete (work-hour based), used when it
   * diverges materially from the app's calendar-day weightedProgress over
   * these activities. See Tank.progressOverride.
   */
  progressOverride?: number;
}

/**
 * Builds a tank straight from a real, already-dated activity list — e.g.
 * imported from the project's own .mpp cronograma — instead of generating
 * one from STAGE_TEMPLATE's fixed sequential durations. Unlike buildActive,
 * this doesn't assume a single non-overlapping chain: a real cronograma's
 * phases legitimately run in parallel (SERVIÇOS DE MANUTENÇÃO starts while
 * LIBERAÇÃO OPERACIONAL is still open, for instance), so each activity
 * carries its own real dates instead of being cursor-walked from the
 * previous one. dependsOn is intentionally left empty for the same reason —
 * a recalculateSchedule cascade assuming strict sequential dependency would
 * misdate real parallel phases.
 */
function buildFromSchedule(p: FromScheduleParams): Tank {
  const id = slug(p.tag);
  return {
    id,
    tag: p.tag,
    area: p.area,
    product: p.product,
    tankType: p.tankType,
    status: p.status,
    nextInternalInspection: p.nextInternalInspection,
    responsible: p.responsible,
    notes: p.notes,
    progressOverride: p.progressOverride,
    activities: p.activities.map((a) => ({
      ...a,
      id: `${id}__${a.stageKey}`,
      tankId: id,
      dependsOn: [],
    })),
  };
}

interface ScheduledParams {
  tag: string;
  area: string;
  product: string;
  tankType: string;
  baselineStart: string;
  nextInternalInspection?: string;
  responsible?: string;
  notes?: string;
}

function buildScheduled(p: ScheduledParams): Tank {
  const id = slug(p.tag);
  const activities = buildActivitiesFromTemplate(id, p.baselineStart);
  return {
    id,
    tag: p.tag,
    area: p.area,
    product: p.product,
    tankType: p.tankType,
    status: "PROGRAMADO",
    nextInternalInspection: p.nextInternalInspection,
    responsible: p.responsible,
    notes: p.notes,
    activities,
  };
}

interface NoProjectParams {
  tag: string;
  area: string;
  /** Omit when genuinely not on record — buildNoProject never invents one. */
  nextInternalInspection?: string;
  /** Only set when confirmed by a real source (e.g. the asset map reference) — otherwise stays "A definir". */
  product?: string;
  /** Only set when already known from a prior real/scheduled entry — tankType is a physical trait of the tank, not of its project, so it doesn't stop being true just because there's no active maintenance plan right now. */
  tankType?: string;
  notes?: string;
}

const CADASTRO_PENDENTE_NOTES =
  "Cadastro inicial a partir do inventário de inspeções — área, produto e tipo de teto ainda não classificados. Sem projeto de manutenção ativo; nenhuma data de cronograma foi definida.";

/**
 * Registers a real tancagem tracked for regulatory inspection that has no
 * active maintenance project yet — no baseline, no activities, so no
 * schedule date is invented. Gives the asset its own dashboard page and a
 * place in Tank Control, driven entirely by its real nextInternalInspection.
 */
function buildNoProject(p: NoProjectParams): Tank {
  const id = slug(p.tag);
  return {
    id,
    tag: p.tag,
    area: p.area,
    product: p.product ?? "A definir",
    tankType: p.tankType ?? "A definir",
    status: "SEM_PROJETO",
    nextInternalInspection: p.nextInternalInspection,
    notes: p.notes ?? CADASTRO_PENDENTE_NOTES,
    activities: [],
  };
}

const SERVICOS_TETO_FLUTUANTE =
  "Escopo padrão: instalação de raquetes, abertura de BV, remoção de resíduo e lavagem, montagem de andaime balancim, inspeção, reparos de caldeiraria, pintura e remoção de raquetes.";
const SERVICOS_TETO_FIXO_FLUTUANTE =
  "Escopo padrão: instalação de raquetes, abertura de BV, remoção de resíduo, remoção/montagem do flutuante, montagem de andaime, inspeção, reparos de caldeiraria e pintura.";
const SERVICOS_LAVAGEM =
  "Escopo padrão: instalação de raquetes, abertura de BV, remoção de resíduo e lavagem, montagem de andaime, inspeção, reparos de caldeiraria e pintura.";

export const TANKS_SEED: Tank[] = [
  // ── Histórico concluído (campanha 2022–2025) ──────────────────────────
  buildConcluded({
    tag: "TQ-41001",
    area: "Tancagem de Petróleo",
    product: "Petróleo",
    tankType: "Teto Flutuante",
    actualStart: "2022-11-15",
    actualEnd: "2023-03-31",
    nextInternalInspection: "2033-10-18",
    notes: SERVICOS_TETO_FLUTUANTE,
  }),
  buildConcluded({
    tag: "TQ-6313003",
    area: "Tancagem de Nafta",
    product: "Nafta",
    tankType: "Teto Fixo/Flutuante",
    actualStart: "2022-12-01",
    actualEnd: "2023-04-15",
    nextInternalInspection: "2033-12-13",
    notes: SERVICOS_TETO_FIXO_FLUTUANTE,
  }),
  buildConcluded({
    tag: "TQ-41008",
    area: "Tancagem de RAT",
    product: "RAT",
    tankType: "Teto Flutuante",
    actualStart: "2022-11-01",
    actualEnd: "2023-07-01",
    nextInternalInspection: "2034-01-31",
    notes: SERVICOS_TETO_FLUTUANTE,
  }),
  buildConcluded({
    tag: "TQ-6313007",
    area: "Diesel para Exportação",
    product: "Diesel",
    tankType: "Teto Flutuante",
    actualStart: "2023-01-01",
    actualEnd: "2023-09-01",
    nextInternalInspection: "2035-06-18",
    notes: SERVICOS_TETO_FLUTUANTE,
  }),
  // Datas reais do Relatório de Acompanhamento de Tanques (Centro de
  // Intervenções ATI/TAG Guamaré, rev. 13, corte 21/10/2026) — substituem o
  // placeholder anterior (que usava 2023, incorreto para esta campanha).
  buildConcluded({
    tag: "TQ-41002",
    area: "Tancagem de Petróleo",
    product: "Petróleo",
    tankType: "Teto Flutuante",
    actualStart: "2026-01-05",
    actualEnd: "2026-06-17",
    nextInternalInspection: "2028-06-17",
    notes: SERVICOS_TETO_FLUTUANTE,
  }),
  buildConcluded({
    tag: "TQ-6313001",
    area: "Tancagem de Nafta",
    product: "Nafta",
    tankType: "Teto Fixo/Flutuante",
    actualStart: "2023-03-01",
    actualEnd: "2023-11-01",
    nextInternalInspection: "2035-05-07",
    notes: SERVICOS_TETO_FIXO_FLUTUANTE,
  }),
  buildConcluded({
    tag: "TQ-41004",
    area: "Tancagem de Petróleo",
    product: "Petróleo",
    tankType: "Teto Flutuante",
    actualStart: "2023-04-01",
    actualEnd: "2023-11-01",
    nextInternalInspection: "2025-11-24",
    notes: SERVICOS_TETO_FLUTUANTE,
  }),
  // Datas reais do relatório (rev. 13) — concluído 41 dias antes da linha de
  // base (01/12/2026), em 21/10/2026.
  buildConcluded({
    tag: "TQ-41005",
    area: "Tancagem de Petróleo",
    product: "Petróleo",
    tankType: "Teto Flutuante",
    actualStart: "2026-07-06",
    actualEnd: "2026-10-21",
    nextInternalInspection: "2025-12-29",
    notes: SERVICOS_TETO_FLUTUANTE,
  }),
  buildConcluded({
    tag: "TQ-41007",
    area: "Tancagem de RAT",
    product: "RAT",
    tankType: "Teto Flutuante",
    actualStart: "2023-12-01",
    actualEnd: "2024-08-01",
    nextInternalInspection: "2035-08-13",
    notes: SERVICOS_TETO_FLUTUANTE,
  }),
  // Datas reais do relatório (rev. 13).
  buildConcluded({
    tag: "TQ-6313002",
    area: "Tancagem de Nafta",
    product: "Nafta",
    tankType: "Teto Fixo/Flutuante",
    actualStart: "2025-11-01",
    actualEnd: "2026-03-03",
    nextInternalInspection: "2036-03-03",
    notes: SERVICOS_TETO_FIXO_FLUTUANTE,
  }),
  buildConcluded({
    tag: "TQ-6313006",
    area: "Tancagem de S-10",
    product: "Diesel S-10",
    tankType: "Teto Fixo/Flutuante",
    actualStart: "2025-09-24",
    actualEnd: "2026-04-27",
    nextInternalInspection: "2036-04-27",
    notes: SERVICOS_TETO_FIXO_FLUTUANTE,
  }),
  // Lançado como concluído direto (não havia projeto algum antes) — real do
  // relatório rev. 13.
  buildConcluded({
    tag: "TQ-27016",
    area: "UTE",
    product: "Gasolina",
    tankType: "Teto Fixo/Flutuante",
    actualStart: "2026-01-05",
    actualEnd: "2026-08-19",
    nextInternalInspection: "2036-08-19",
    notes: SERVICOS_TETO_FIXO_FLUTUANTE,
  }),

  // ── Em execução / desvios (campanha atual, referência 09/2026) ────────
  // Cronograma real (.mpp oficial, rev. enviada pelo usuário em 05/11/2026) —
  // substitui o template genérico de 11 etapas pelas 14 fases reais do
  // projeto (PRÉ-PARADA/PARADA/PÓS-PARADA), com datas e avanço reais por fase.
  // Avanço geral (raiz do cronograma): 9%.
  buildFromSchedule({
    tag: "TQ-1222-35",
    area: "ETO",
    product: "Petróleo — Lavagem a Frio",
    tankType: "Teto Fixo",
    status: "EM_EXECUCAO",
    nextInternalInspection: "2026-01-15",
    responsible: "Coordenação de Manutenção ETO",
    notes: SERVICOS_LAVAGEM,
    progressOverride: 9,
    activities: [
      { order: 1, stageKey: "INICIO_PRE_PARADA", name: "Início da Pré-Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-10-01", baselineEnd: "2026-10-01", plannedStart: "2026-10-01", plannedEnd: "2026-10-01", actualStart: "2026-10-01", actualEnd: "2026-10-01", progress: 100, status: "CONCLUIDO" },
      { order: 2, stageKey: "MATERIAIS", name: "MATERIAIS", durationDays: 12, isMilestone: false, baselineStart: "2026-10-05", baselineEnd: "2026-10-16", plannedStart: "2026-10-05", plannedEnd: "2026-10-16", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 3, stageKey: "TERMINO_PRE_PARADA", name: "Término da Pré-Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-10-05", baselineEnd: "2026-10-05", plannedStart: "2026-10-05", plannedEnd: "2026-10-05", actualStart: "2026-10-05", actualEnd: "2026-10-05", progress: 100, status: "CONCLUIDO" },
      { order: 4, stageKey: "INICIO_PARADA", name: "Início da Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-10-05", baselineEnd: "2026-10-05", plannedStart: "2026-10-05", plannedEnd: "2026-10-05", actualStart: "2026-10-05", actualEnd: "2026-10-05", progress: 100, status: "CONCLUIDO" },
      { order: 5, stageKey: "LIBERACAO_OPERACIONAL", name: "LIBERAÇÃO OPERACIONAL", durationDays: 65, isMilestone: false, baselineStart: "2026-10-05", baselineEnd: "2026-12-08", plannedStart: "2026-10-05", plannedEnd: "2026-12-08", actualStart: "2026-10-05", actualEnd: undefined, progress: 52, status: "ATUAL" },
      { order: 6, stageKey: "SERVICOS_MANUTENCAO", name: "SERVIÇOS DE MANUTENÇÃO", durationDays: 74, isMilestone: false, baselineStart: "2026-11-09", baselineEnd: "2027-01-21", plannedStart: "2026-11-09", plannedEnd: "2027-01-21", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 7, stageKey: "MELHORIAS", name: "MELHORIAS", durationDays: 20, isMilestone: false, baselineStart: "2026-12-16", baselineEnd: "2027-01-04", plannedStart: "2026-12-16", plannedEnd: "2027-01-04", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 8, stageKey: "RETORNO_OPERACIONAL", name: "RETORNO OPERACIONAL", durationDays: 11, isMilestone: false, baselineStart: "2027-01-15", baselineEnd: "2027-01-25", plannedStart: "2027-01-15", plannedEnd: "2027-01-25", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 9, stageKey: "TERMINO_PARADA", name: "Término da Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-01-25", baselineEnd: "2027-01-25", plannedStart: "2027-01-25", plannedEnd: "2027-01-25", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 10, stageKey: "INICIO_POS_PARADA", name: "Início da Pós-Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-01-25", baselineEnd: "2027-01-25", plannedStart: "2027-01-25", plannedEnd: "2027-01-25", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 11, stageKey: "COMISSIONAMENTO", name: "Comissionamento", durationDays: 2, isMilestone: false, baselineStart: "2027-01-25", baselineEnd: "2027-01-26", plannedStart: "2027-01-25", plannedEnd: "2027-01-26", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 12, stageKey: "TESTES_PRODUTO", name: "Testes com produto (durante o comissionamento)", durationDays: 2, isMilestone: false, baselineStart: "2027-01-26", baselineEnd: "2027-01-27", plannedStart: "2027-01-26", plannedEnd: "2027-01-27", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 13, stageKey: "DOCUMENTACAO_FINAL", name: "Documentação final", durationDays: 2, isMilestone: false, baselineStart: "2027-01-27", baselineEnd: "2027-01-28", plannedStart: "2027-01-27", plannedEnd: "2027-01-28", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 14, stageKey: "TERMINO_POS_PARADA", name: "Término da Pós-Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-01-28", baselineEnd: "2027-01-28", plannedStart: "2027-01-28", plannedEnd: "2027-01-28", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
    ],
  }),
  // Cronograma real (.mpp oficial, rev. enviada pelo usuário em 05/11/2026) —
  // substitui o template genérico de 11 etapas pelas 14 fases reais do
  // projeto (PRÉ-PARADA/PARADA/PÓS-PARADA), com datas e avanço reais por fase.
  // Avanço geral (raiz do cronograma): 52%.
  buildFromSchedule({
    tag: "TQ-1222-36",
    area: "ETO",
    product: "Petróleo — Lavagem a Frio",
    tankType: "Teto Fixo",
    status: "EM_EXECUCAO",
    nextInternalInspection: "2026-01-25",
    responsible: "Coordenação de Manutenção ETO",
    notes: SERVICOS_LAVAGEM,
    progressOverride: 52,
    activities: [
      { order: 1, stageKey: "INICIO_PRE_PARADA", name: "Início da Pré-Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-02-12", baselineEnd: "2026-02-12", plannedStart: "2026-02-12", plannedEnd: "2026-02-12", actualStart: "2026-02-12", actualEnd: "2026-02-12", progress: 100, status: "CONCLUIDO" },
      { order: 2, stageKey: "MATERIAIS", name: "MATERIAIS", durationDays: 289, isMilestone: false, baselineStart: "2026-02-12", baselineEnd: "2026-11-27", plannedStart: "2026-02-12", plannedEnd: "2026-11-27", actualStart: "2026-02-12", actualEnd: undefined, progress: 42, status: "ATUAL" },
      { order: 3, stageKey: "TERMINO_PRE_PARADA", name: "Término da Pré-Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-02-12", baselineEnd: "2026-02-12", plannedStart: "2026-02-12", plannedEnd: "2026-02-12", actualStart: "2026-02-12", actualEnd: "2026-02-12", progress: 100, status: "CONCLUIDO" },
      { order: 4, stageKey: "INICIO_PARADA", name: "Início da Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-02-12", baselineEnd: "2026-02-12", plannedStart: "2026-02-12", plannedEnd: "2026-02-12", actualStart: "2026-02-12", actualEnd: "2026-02-12", progress: 100, status: "CONCLUIDO" },
      { order: 5, stageKey: "LIBERACAO_OPERACIONAL", name: "LIBERAÇÃO OPERACIONAL", durationDays: 348, isMilestone: false, baselineStart: "2026-01-30", baselineEnd: "2027-01-12", plannedStart: "2026-01-30", plannedEnd: "2027-01-12", actualStart: "2026-01-30", actualEnd: undefined, progress: 65, status: "ATUAL" },
      { order: 6, stageKey: "SERVICOS_MANUTENCAO", name: "SERVIÇOS DE MANUTENÇÃO", durationDays: 419, isMilestone: false, baselineStart: "2026-02-12", baselineEnd: "2027-04-06", plannedStart: "2026-02-12", plannedEnd: "2027-04-06", actualStart: "2026-02-12", actualEnd: undefined, progress: 55, status: "ATUAL" },
      { order: 7, stageKey: "MELHORIAS", name: "MELHORIAS", durationDays: 16, isMilestone: false, baselineStart: "2027-01-14", baselineEnd: "2027-01-29", plannedStart: "2027-01-14", plannedEnd: "2027-01-29", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 8, stageKey: "RETORNO_OPERACIONAL", name: "RETORNO OPERACIONAL", durationDays: 10, isMilestone: false, baselineStart: "2027-04-06", baselineEnd: "2027-04-15", plannedStart: "2027-04-06", plannedEnd: "2027-04-15", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 9, stageKey: "TERMINO_PARADA", name: "Término da Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-04-15", baselineEnd: "2027-04-15", plannedStart: "2027-04-15", plannedEnd: "2027-04-15", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 10, stageKey: "INICIO_POS_PARADA", name: "Início da Pós-Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-04-15", baselineEnd: "2027-04-15", plannedStart: "2027-04-15", plannedEnd: "2027-04-15", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 11, stageKey: "COMISSIONAMENTO", name: "Comissionamento", durationDays: 5, isMilestone: false, baselineStart: "2027-04-15", baselineEnd: "2027-04-19", plannedStart: "2027-04-15", plannedEnd: "2027-04-19", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 12, stageKey: "TESTES_PRODUTO", name: "Testes com produto (durante o comissionamento)", durationDays: 2, isMilestone: false, baselineStart: "2027-04-19", baselineEnd: "2027-04-20", plannedStart: "2027-04-19", plannedEnd: "2027-04-20", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 13, stageKey: "DOCUMENTACAO_FINAL", name: "Documentação final", durationDays: 2, isMilestone: false, baselineStart: "2027-04-20", baselineEnd: "2027-04-21", plannedStart: "2027-04-20", plannedEnd: "2027-04-21", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 14, stageKey: "TERMINO_POS_PARADA", name: "Término da Pós-Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-04-21", baselineEnd: "2027-04-21", plannedStart: "2027-04-21", plannedEnd: "2027-04-21", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
    ],
  }),
  // TQ-1222-62 e TQ-27010 eram ATRASADO/CRITICO aqui — usuário confirmou que
  // também não estão de fato em manutenção; voltam para "Sem Projeto" junto
  // com TQ-1222-21/44 e TQ-27001/27009 (ver essas TAGs mais abaixo).
  // Manutenção lançada em 14/10/2026 — tanques que estavam "Sem Projeto"
  // (apenas inventário de inspeção) e passam a ter um projeto ativo.
  // Cronograma real (.mpp oficial, rev. enviada pelo usuário em 05/11/2026) —
  // substitui o template genérico de 11 etapas pelas 14 fases reais do
  // projeto (PRÉ-PARADA/PARADA/PÓS-PARADA), com datas e avanço reais por fase.
  // Avanço geral (raiz do cronograma): 28%.
  buildFromSchedule({
    tag: "TQ-1222-25",
    area: "ETO",
    product: "Petróleo — Lavagem a Quente",
    tankType: "Teto Fixo",
    status: "EM_EXECUCAO",
    nextInternalInspection: "2025-12-22",
    responsible: "Coordenação de Manutenção ETO",
    notes: SERVICOS_LAVAGEM,
    progressOverride: 28,
    activities: [
      { order: 1, stageKey: "INICIO_PRE_PARADA", name: "Início da Pré-Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-04-22", baselineEnd: "2026-04-22", plannedStart: "2026-04-22", plannedEnd: "2026-04-22", actualStart: "2026-04-22", actualEnd: "2026-04-22", progress: 100, status: "CONCLUIDO" },
      { order: 2, stageKey: "MATERIAIS", name: "MATERIAIS", durationDays: 300, isMilestone: false, baselineStart: "2026-04-22", baselineEnd: "2027-02-15", plannedStart: "2026-04-22", plannedEnd: "2027-02-15", actualStart: "2026-04-22", actualEnd: undefined, progress: 12, status: "ATUAL" },
      { order: 3, stageKey: "TERMINO_PRE_PARADA", name: "Término da Pré-Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-04-22", baselineEnd: "2026-04-22", plannedStart: "2026-04-22", plannedEnd: "2026-04-22", actualStart: "2026-04-22", actualEnd: "2026-04-22", progress: 100, status: "CONCLUIDO" },
      { order: 4, stageKey: "INICIO_PARADA", name: "Início da Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-04-22", baselineEnd: "2026-04-22", plannedStart: "2026-04-22", plannedEnd: "2026-04-22", actualStart: "2026-04-22", actualEnd: "2026-04-22", progress: 100, status: "CONCLUIDO" },
      { order: 5, stageKey: "LIBERACAO_OPERACIONAL", name: "LIBERAÇÃO OPERACIONAL", durationDays: 324, isMilestone: false, baselineStart: "2026-04-22", baselineEnd: "2027-03-11", plannedStart: "2026-04-22", plannedEnd: "2027-03-11", actualStart: "2026-04-22", actualEnd: undefined, progress: 66, status: "ATUAL" },
      { order: 6, stageKey: "SERVICOS_MANUTENCAO", name: "SERVIÇOS DE MANUTENÇÃO", durationDays: 332, isMilestone: false, baselineStart: "2026-05-06", baselineEnd: "2027-04-02", plannedStart: "2026-05-06", plannedEnd: "2027-04-02", actualStart: "2026-05-06", actualEnd: undefined, progress: 19, status: "ATUAL" },
      { order: 7, stageKey: "MELHORIAS", name: "MELHORIAS", durationDays: 18, isMilestone: false, baselineStart: "2027-01-15", baselineEnd: "2027-02-01", plannedStart: "2027-01-15", plannedEnd: "2027-02-01", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 8, stageKey: "RETORNO_OPERACIONAL", name: "RETORNO OPERACIONAL", durationDays: 11, isMilestone: false, baselineStart: "2027-03-23", baselineEnd: "2027-04-02", plannedStart: "2027-03-23", plannedEnd: "2027-04-02", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 9, stageKey: "TERMINO_PARADA", name: "Término da Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-04-02", baselineEnd: "2027-04-02", plannedStart: "2027-04-02", plannedEnd: "2027-04-02", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 10, stageKey: "INICIO_POS_PARADA", name: "Início da Pós-Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-04-02", baselineEnd: "2027-04-02", plannedStart: "2027-04-02", plannedEnd: "2027-04-02", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 11, stageKey: "COMISSIONAMENTO", name: "Comissionamento", durationDays: 1, isMilestone: false, baselineStart: "2027-04-05", baselineEnd: "2027-04-05", plannedStart: "2027-04-05", plannedEnd: "2027-04-05", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 12, stageKey: "TESTES_PRODUTO", name: "Testes com produto (durante o comissionamento)", durationDays: 2, isMilestone: false, baselineStart: "2027-04-06", baselineEnd: "2027-04-07", plannedStart: "2027-04-06", plannedEnd: "2027-04-07", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 13, stageKey: "DOCUMENTACAO_FINAL", name: "Documentação final", durationDays: 1, isMilestone: false, baselineStart: "2027-04-07", baselineEnd: "2027-04-07", plannedStart: "2027-04-07", plannedEnd: "2027-04-07", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 14, stageKey: "TERMINO_POS_PARADA", name: "Término da Pós-Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-04-07", baselineEnd: "2027-04-07", plannedStart: "2027-04-07", plannedEnd: "2027-04-07", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
    ],
  }),
  // Cronograma real (.mpp oficial, rev. enviada pelo usuário em 05/11/2026) —
  // substitui o template genérico de 11 etapas pelas 14 fases reais do
  // projeto (PRÉ-PARADA/PARADA/PÓS-PARADA), com datas e avanço reais por fase.
  // Avanço geral (raiz do cronograma): 45%.
  buildFromSchedule({
    tag: "TQ-1222-33",
    area: "ETO",
    product: "Petróleo — Lavagem a Frio",
    tankType: "Teto Fixo",
    status: "EM_EXECUCAO",
    nextInternalInspection: "2024-10-25",
    responsible: "Coordenação de Manutenção ETO",
    notes: SERVICOS_LAVAGEM,
    progressOverride: 45,
    activities: [
      { order: 1, stageKey: "INICIO_PRE_PARADA", name: "Início da Pré-Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-05-11", baselineEnd: "2026-05-11", plannedStart: "2026-05-11", plannedEnd: "2026-05-11", actualStart: "2026-05-11", actualEnd: "2026-05-11", progress: 100, status: "CONCLUIDO" },
      { order: 2, stageKey: "MATERIAIS", name: "MATERIAIS", durationDays: 194, isMilestone: false, baselineStart: "2026-05-11", baselineEnd: "2026-11-20", plannedStart: "2026-05-11", plannedEnd: "2026-11-20", actualStart: "2026-05-11", actualEnd: undefined, progress: 84, status: "ATUAL" },
      { order: 3, stageKey: "TERMINO_PRE_PARADA", name: "Término da Pré-Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-05-11", baselineEnd: "2026-05-11", plannedStart: "2026-05-11", plannedEnd: "2026-05-11", actualStart: "2026-05-11", actualEnd: "2026-05-11", progress: 100, status: "CONCLUIDO" },
      { order: 4, stageKey: "INICIO_PARADA", name: "Início da Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-05-11", baselineEnd: "2026-05-11", plannedStart: "2026-05-11", plannedEnd: "2026-05-11", actualStart: "2026-05-11", actualEnd: "2026-05-11", progress: 100, status: "CONCLUIDO" },
      { order: 5, stageKey: "LIBERACAO_OPERACIONAL", name: "LIBERAÇÃO OPERACIONAL", durationDays: 99, isMilestone: false, baselineStart: "2026-05-11", baselineEnd: "2026-08-17", plannedStart: "2026-05-11", plannedEnd: "2026-08-17", actualStart: "2026-05-11", actualEnd: "2026-08-17", progress: 100, status: "CONCLUIDO" },
      { order: 6, stageKey: "SERVICOS_MANUTENCAO", name: "SERVIÇOS DE MANUTENÇÃO", durationDays: 309, isMilestone: false, baselineStart: "2026-05-11", baselineEnd: "2027-03-15", plannedStart: "2026-05-11", plannedEnd: "2027-03-15", actualStart: "2026-05-11", actualEnd: undefined, progress: 36, status: "ATUAL" },
      { order: 7, stageKey: "MELHORIAS", name: "MELHORIAS", durationDays: 19, isMilestone: false, baselineStart: "2026-12-03", baselineEnd: "2026-12-21", plannedStart: "2026-12-03", plannedEnd: "2026-12-21", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 8, stageKey: "RETORNO_OPERACIONAL", name: "RETORNO OPERACIONAL", durationDays: 16, isMilestone: false, baselineStart: "2027-03-15", baselineEnd: "2027-03-30", plannedStart: "2027-03-15", plannedEnd: "2027-03-30", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 9, stageKey: "TERMINO_PARADA", name: "Término da Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-03-30", baselineEnd: "2027-03-30", plannedStart: "2027-03-30", plannedEnd: "2027-03-30", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 10, stageKey: "INICIO_POS_PARADA", name: "Início da Pós-Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-03-30", baselineEnd: "2027-03-30", plannedStart: "2027-03-30", plannedEnd: "2027-03-30", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 11, stageKey: "COMISSIONAMENTO", name: "Comissionamento", durationDays: 2, isMilestone: false, baselineStart: "2027-03-30", baselineEnd: "2027-03-31", plannedStart: "2027-03-30", plannedEnd: "2027-03-31", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 12, stageKey: "TESTES_PRODUTO", name: "Testes com produto (durante o comissionamento)", durationDays: 3, isMilestone: false, baselineStart: "2027-03-31", baselineEnd: "2027-04-02", plannedStart: "2027-03-31", plannedEnd: "2027-04-02", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 13, stageKey: "DOCUMENTACAO_FINAL", name: "Documentação final", durationDays: 4, isMilestone: false, baselineStart: "2027-04-02", baselineEnd: "2027-04-05", plannedStart: "2027-04-02", plannedEnd: "2027-04-05", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 14, stageKey: "TERMINO_POS_PARADA", name: "Término da Pós-Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-04-05", baselineEnd: "2027-04-05", plannedStart: "2027-04-05", plannedEnd: "2027-04-05", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
    ],
  }),
  // Cronograma real (.mpp oficial, rev. enviada pelo usuário em 05/11/2026) —
  // substitui o template genérico de 11 etapas pelas 15 fases reais do
  // projeto (PRÉ-PARADA/PARADA/PÓS-PARADA), com datas e avanço reais por fase.
  // Avanço geral (raiz do cronograma): 26%.
  buildFromSchedule({
    tag: "TQ-6313004",
    area: "Tancagem 6313",
    product: "A definir",
    tankType: "A definir",
    status: "EM_EXECUCAO",
    nextInternalInspection: "2026-02-27",
    progressOverride: 26,
    activities: [
      { order: 1, stageKey: "INICIO_PRE_PARADA", name: "Início da Pré-Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-08-03", baselineEnd: "2026-08-03", plannedStart: "2026-08-03", plannedEnd: "2026-08-03", actualStart: "2026-08-03", actualEnd: "2026-08-03", progress: 100, status: "CONCLUIDO" },
      { order: 2, stageKey: "DOCUMENTACAO_NECESSARIA", name: "DOCUMENTAÇÃO NECESSÁRIA", durationDays: 3, isMilestone: false, baselineStart: "2026-08-03", baselineEnd: "2026-08-05", plannedStart: "2026-08-03", plannedEnd: "2026-08-05", actualStart: "2026-08-03", actualEnd: "2026-08-05", progress: 100, status: "CONCLUIDO" },
      { order: 3, stageKey: "MATERIAIS", name: "MATERIAIS", durationDays: 164, isMilestone: false, baselineStart: "2026-08-03", baselineEnd: "2027-01-13", plannedStart: "2026-08-03", plannedEnd: "2027-01-13", actualStart: "2026-08-03", actualEnd: undefined, progress: 47, status: "ATUAL" },
      { order: 4, stageKey: "TERMINO_PRE_PARADA", name: "Término da Pré-Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-08-04", baselineEnd: "2026-08-04", plannedStart: "2026-08-04", plannedEnd: "2026-08-04", actualStart: "2026-08-04", actualEnd: "2026-08-04", progress: 100, status: "CONCLUIDO" },
      { order: 5, stageKey: "INICIO_PARADA", name: "Início da Parada", durationDays: 1, isMilestone: true, baselineStart: "2026-08-03", baselineEnd: "2026-08-03", plannedStart: "2026-08-03", plannedEnd: "2026-08-03", actualStart: "2026-08-03", actualEnd: "2026-08-03", progress: 100, status: "CONCLUIDO" },
      { order: 6, stageKey: "LIBERACAO_OPERACIONAL", name: "LIBERAÇÃO OPERACIONAL", durationDays: 17, isMilestone: false, baselineStart: "2026-08-04", baselineEnd: "2026-08-20", plannedStart: "2026-08-04", plannedEnd: "2026-08-20", actualStart: "2026-08-04", actualEnd: "2026-08-20", progress: 100, status: "CONCLUIDO" },
      { order: 7, stageKey: "SERVICOS_MANUTENCAO", name: "SERVIÇOS DE MANUTENÇÃO", durationDays: 206, isMilestone: false, baselineStart: "2026-08-03", baselineEnd: "2027-02-24", plannedStart: "2026-08-03", plannedEnd: "2027-02-24", actualStart: "2026-08-03", actualEnd: undefined, progress: 22, status: "ATUAL" },
      { order: 8, stageKey: "MELHORIAS", name: "MELHORIAS", durationDays: 68, isMilestone: false, baselineStart: "2026-11-30", baselineEnd: "2027-02-05", plannedStart: "2026-11-30", plannedEnd: "2027-02-05", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 9, stageKey: "RETORNO_OPERACIONAL", name: "RETORNO OPERACIONAL", durationDays: 17, isMilestone: false, baselineStart: "2027-02-24", baselineEnd: "2027-03-12", plannedStart: "2027-02-24", plannedEnd: "2027-03-12", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 10, stageKey: "TERMINO_PARADA", name: "Término da Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-03-12", baselineEnd: "2027-03-12", plannedStart: "2027-03-12", plannedEnd: "2027-03-12", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 11, stageKey: "INICIO_POS_PARADA", name: "Início da Pós-Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-03-12", baselineEnd: "2027-03-12", plannedStart: "2027-03-12", plannedEnd: "2027-03-12", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 12, stageKey: "COMISSIONAMENTO", name: "Comissionamento", durationDays: 2, isMilestone: false, baselineStart: "2027-03-15", baselineEnd: "2027-03-16", plannedStart: "2027-03-15", plannedEnd: "2027-03-16", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 13, stageKey: "TESTES_PRODUTO", name: "Testes com produto (durante o comissionamento)", durationDays: 2, isMilestone: false, baselineStart: "2027-03-17", baselineEnd: "2027-03-18", plannedStart: "2027-03-17", plannedEnd: "2027-03-18", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 14, stageKey: "DOCUMENTACAO_FINAL", name: "Documentação final", durationDays: 6, isMilestone: false, baselineStart: "2027-03-18", baselineEnd: "2027-03-23", plannedStart: "2027-03-18", plannedEnd: "2027-03-23", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
      { order: 15, stageKey: "TERMINO_POS_PARADA", name: "Término da Pós-Parada", durationDays: 1, isMilestone: true, baselineStart: "2027-03-23", baselineEnd: "2027-03-23", plannedStart: "2027-03-23", plannedEnd: "2027-03-23", actualStart: undefined, actualEnd: undefined, progress: 0, status: "FUTURO" },
    ],
  }),

  // ── Programado ─────────────────────────────────────────────────────────
  // TQ-1222-21/44, TQ-27001/27009 eram PROGRAMADO aqui (datas de 2026/2027),
  // mas o usuário confirmou que os únicos tanques realmente programados para
  // 2027 (ou já em manutenção) são os 8 com vídeo real cadastrado — os
  // demais voltam para "Sem Projeto" (ver essas 4 TAGs mais abaixo) até
  // terem uma parada de fato confirmada.
  // Ciclo 2022–2023 concluído (histórico preservado nas notas abaixo, já que
  // o progresso geral do tanque é uma média ponderada por duração de TODAS
  // as atividades do array — reencadear uma nova parada depois das antigas
  // sem substituí-las distorceria o % exibido). Orçamento CAPEX 2026-2031 já
  // prevê nova parada em 2027 para este tanque, mas sem data exata ainda
  // informada — baselineStart abaixo é um placeholder até confirmação.
  buildScheduled({
    tag: "TQ-6313005",
    area: "Tancagem de S-10",
    product: "Diesel S-10",
    tankType: "Teto Fixo/Flutuante",
    baselineStart: "2027-02-02",
    nextInternalInspection: "2027-01-03",
    notes:
      "Ciclo de manutenção 2022–2023 concluído (01/10/2022 a 15/04/2023). " +
      SERVICOS_TETO_FIXO_FLUTUANTE,
  }),
  // Promovido de "Sem Projeto" — orçamento CAPEX 2026-2031 já prevê parada em
  // 2027 para este tanque, mas sem data exata ainda informada — baselineStart
  // abaixo é um placeholder até confirmação.
  buildScheduled({
    tag: "TQ-1222-31",
    area: "ETO",
    product: "Petróleo — Lavagem a Frio",
    tankType: "Teto Fixo",
    baselineStart: "2027-04-01",
    nextInternalInspection: "2026-08-07",
    responsible: "Coordenação de Manutenção ETO",
    notes: SERVICOS_LAVAGEM,
  }),

  // ── Sem projeto de manutenção (apenas inspeção — inventário completo) ────
  // Área herdada da convenção de TAG já usada pelos tanques acima (1222 →
  // ETO, 27xxx → UTE); produto e tipo de teto não constam no inventário
  // recebido, por isso ficam "A definir" em vez de inventados.
  // Produto confirmado pelo mapa interativo de ativos (referência oficial da
  // Brava) para os tanques da Área 1222 — TQ-1222-23 não está identificado no
  // mapa, então permanece "A definir" (não inventar).
  // Voltou de "Programado" — era um placeholder sem parada real confirmada.
  buildNoProject({ tag: "TQ-1222-21", area: "ETO", product: "Petróleo — Lavagem a Quente", tankType: "Teto Fixo", nextInternalInspection: "2025-10-21" }),
  buildNoProject({ tag: "TQ-1222-22", area: "ETO", product: "Petróleo — Lavagem a Quente", nextInternalInspection: "2034-02-06" }),
  buildNoProject({ tag: "TQ-1222-23", area: "ETO", nextInternalInspection: "2036-01-07" }),
  buildNoProject({ tag: "TQ-1222-24", area: "ETO", product: "Petróleo — Lavagem a Quente", nextInternalInspection: "2028-04-21" }),
  buildNoProject({ tag: "TQ-1222-32", area: "ETO", product: "Petróleo — Lavagem a Frio", nextInternalInspection: "2035-09-02" }),
  buildNoProject({ tag: "TQ-1222-34", area: "ETO", product: "Petróleo — Lavagem a Frio", nextInternalInspection: "2034-08-22" }),
  buildNoProject({ tag: "TQ-1222-37", area: "ETO", product: "Petróleo — Lavagem a Frio", nextInternalInspection: "2034-12-19" }),
  buildNoProject({ tag: "TQ-1222-41", area: "ETO", product: "Petróleo — Carga", nextInternalInspection: "2031-05-29" }),
  buildNoProject({ tag: "TQ-1222-42", area: "ETO", product: "Petróleo — Carga", nextInternalInspection: "2034-06-19" }),
  buildNoProject({ tag: "TQ-1222-43", area: "ETO", product: "Petróleo — Carga", nextInternalInspection: "2027-07-01" }),
  // Voltou de "Programado" — era um placeholder sem parada real confirmada.
  buildNoProject({ tag: "TQ-1222-44", area: "ETO", product: "Petróleo — Carga", tankType: "Teto Flutuante", nextInternalInspection: "2035-04-14" }),
  // Voltou de "Em execução" (ATRASADO) — usuário confirmou que não está de
  // fato em manutenção. Sem "PRÓXIMA INTERNA" na planilha de referência —
  // não inventar data.
  buildNoProject({ tag: "TQ-1222-62", area: "ETO", product: "Sequestrante de H2S", tankType: "Teto Fixo" }),
  // Idem para a Área 270 — produto confirmado pelo mapa interativo.
  // Voltou de "Programado" — era um placeholder sem parada real confirmada.
  buildNoProject({ tag: "TQ-27001", area: "UTE", product: "QAV", tankType: "Teto Fixo/Flutuante", nextInternalInspection: "2027-06-01" }),
  buildNoProject({ tag: "TQ-27002", area: "UTE", product: "QAV", nextInternalInspection: "2027-08-10" }),
  buildNoProject({ tag: "TQ-27003", area: "UTE", product: "QAV", nextInternalInspection: "2027-12-20" }),
  buildNoProject({ tag: "TQ-27004", area: "UTE", product: "QAV", nextInternalInspection: "2033-06-17" }),
  // Voltou de "Programado" — era um placeholder sem parada real confirmada.
  buildNoProject({ tag: "TQ-27009", area: "UTE", product: "Diesel", tankType: "Teto Fixo/Flutuante", nextInternalInspection: "2027-12-25" }),
  // Voltou de "Em execução" (CRITICO) — usuário confirmou que não está de
  // fato em manutenção.
  buildNoProject({ tag: "TQ-27010", area: "UTE", product: "Diesel", tankType: "Teto Fixo/Flutuante", nextInternalInspection: "2028-07-20" }),
  buildNoProject({ tag: "TQ-27011", area: "UTE", product: "Diesel", nextInternalInspection: "2028-06-08" }),
  buildNoProject({ tag: "TQ-27015", area: "UTE", product: "Gasolina", nextInternalInspection: "2030-10-28" }),
  // TQ-27016: ver buildConcluded acima, campanha 2026 já entregue.
  buildNoProject({ tag: "TQ-28001", area: "A definir", nextInternalInspection: "2027-07-02" }),
  buildNoProject({ tag: "TQ-28002", area: "A definir", nextInternalInspection: "2027-07-02" }),
  buildNoProject({ tag: "TQ-28003", area: "A definir", nextInternalInspection: "2027-07-02" }),
  buildNoProject({ tag: "TQ-28006", area: "A definir", nextInternalInspection: "2031-06-11" }),
  buildNoProject({ tag: "TQ-40001", area: "A definir", nextInternalInspection: "2027-10-19" }),
  buildNoProject({
    tag: "TQ-26021",
    area: "Tancagem de ODM",
    product: "Óleo Diesel Marítimo (ODM)",
    nextInternalInspection: "2030-03-13",
  }),
  buildNoProject({
    tag: "TQ-26024",
    area: "Tancagem de ODM",
    product: "Óleo Diesel Marítimo (ODM)",
    nextInternalInspection: "2030-03-28",
  }),
  buildNoProject({ tag: "TQ-26025", area: "A definir", nextInternalInspection: "2035-03-13" }),
];
