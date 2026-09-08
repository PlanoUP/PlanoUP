import { Tank, TankStatus } from "../types";
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

const SERVICOS_TETO_FLUTUANTE =
  "Escopo padrão: instalação de raquetes, abertura de BV, remoção de resíduo e lavagem, montagem de andaime balancim, inspeção, reparos de caldeiraria, pintura e remoção de raquetes.";
const SERVICOS_TETO_FIXO_FLUTUANTE =
  "Escopo padrão: instalação de raquetes, abertura de BV, remoção de resíduo, remoção/montagem do flutuante, montagem de andaime, inspeção, reparos de caldeiraria e pintura.";
const SERVICOS_LAVAGEM =
  "Escopo padrão: instalação de raquetes, abertura de BV, remoção de resíduo e lavagem, montagem de andaime, inspeção, reparos de caldeiraria e pintura.";

export const TANKS_SEED: Tank[] = [
  // ── Histórico concluído (campanha 2022–2025) ──────────────────────────
  buildConcluded({
    tag: "TQ-6313005",
    area: "Tancagem de S-10",
    product: "Diesel S-10",
    tankType: "Teto Fixo/Flutuante",
    actualStart: "2022-10-01",
    actualEnd: "2023-04-15",
    nextInternalInspection: "2027-01-03",
    notes: SERVICOS_TETO_FIXO_FLUTUANTE,
  }),
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
  buildConcluded({
    tag: "TQ-41002",
    area: "Tancagem de Petróleo",
    product: "Petróleo",
    tankType: "Teto Flutuante",
    actualStart: "2023-01-04",
    actualEnd: "2023-09-04",
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
  buildConcluded({
    tag: "TQ-41005",
    area: "Tancagem de Petróleo",
    product: "Petróleo",
    tankType: "Teto Flutuante",
    actualStart: "2023-02-01",
    actualEnd: "2023-10-01",
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
  buildConcluded({
    tag: "TQ-6313002",
    area: "Tancagem de Nafta",
    product: "Nafta",
    tankType: "Teto Fixo/Flutuante",
    actualStart: "2024-05-27",
    actualEnd: "2024-12-27",
    nextInternalInspection: "2036-03-03",
    notes: SERVICOS_TETO_FIXO_FLUTUANTE,
  }),
  buildConcluded({
    tag: "TQ-6313006",
    area: "Tancagem de S-10",
    product: "Diesel S-10",
    tankType: "Teto Fixo/Flutuante",
    actualStart: "2024-12-01",
    actualEnd: "2025-07-01",
    nextInternalInspection: "2036-04-27",
    notes: SERVICOS_TETO_FIXO_FLUTUANTE,
  }),

  // ── Em execução / desvios (campanha atual, referência 09/2026) ────────
  buildActive({
    tag: "TQ-1222-35",
    area: "ETO",
    product: "Petróleo — Lavagem a Frio",
    tankType: "Teto Fixo",
    status: "EM_EXECUCAO",
    baselineStart: "2026-06-10",
    currentOrder: 7,
    currentProgress: 55,
    nextInternalInspection: "2026-01-15",
    responsible: "Coordenação de Manutenção ETO",
    notes: SERVICOS_LAVAGEM,
  }),
  buildActive({
    tag: "TQ-1222-36",
    area: "ETO",
    product: "Petróleo — Lavagem a Frio",
    tankType: "Teto Fixo",
    status: "EM_EXECUCAO",
    baselineStart: "2026-08-03",
    currentOrder: 4,
    currentProgress: 30,
    startOffsetDays: 7,
    nextInternalInspection: "2026-01-25",
    responsible: "Coordenação de Manutenção ETO",
    notes: SERVICOS_LAVAGEM,
  }),
  buildActive({
    tag: "TQ-1222-62",
    area: "ETO",
    product: "Sequestrante de H2S",
    tankType: "Teto Fixo",
    status: "ATRASADO",
    baselineStart: "2026-07-01",
    currentOrder: 3,
    currentProgress: 40,
    startOffsetDays: 19,
    // Sem registro de "PRÓXIMA INTERNA" na planilha de referência — não inventar data.
    responsible: "Coordenação de Manutenção ETO",
    notes: "Início de execução com 19 dias de atraso em relação ao planejado. " + SERVICOS_LAVAGEM,
  }),
  buildActive({
    tag: "TQ-27010",
    area: "UTE",
    product: "Diesel",
    tankType: "Teto Fixo/Flutuante",
    status: "CRITICO",
    baselineStart: "2026-02-01",
    currentOrder: 1,
    currentProgress: 0,
    startOffsetDays: 190,
    nextInternalInspection: "2028-07-20",
    responsible: "Coordenação de Manutenção UTE",
    notes:
      "Início da manutenção com 190 dias de atraso em relação ao planejado. Liberação da unidade pendente — prioridade máxima.",
  }),

  // ── Programado ─────────────────────────────────────────────────────────
  buildScheduled({
    tag: "TQ-1222-21",
    area: "ETO",
    product: "Petróleo — Lavagem a Quente",
    tankType: "Teto Fixo",
    baselineStart: "2026-10-05",
    nextInternalInspection: "2025-10-21",
    responsible: "Coordenação de Manutenção ETO",
    notes: SERVICOS_LAVAGEM,
  }),
  buildScheduled({
    tag: "TQ-1222-44",
    area: "ETO",
    product: "Petróleo — Carga",
    tankType: "Teto Flutuante",
    baselineStart: "2027-01-15",
    nextInternalInspection: "2035-04-14",
    responsible: "Coordenação de Manutenção ETO",
    notes: SERVICOS_TETO_FLUTUANTE,
  }),
  buildScheduled({
    tag: "TQ-27001",
    area: "UTE",
    product: "QAV",
    tankType: "Teto Fixo/Flutuante",
    baselineStart: "2027-03-01",
    nextInternalInspection: "2027-06-01",
    responsible: "Coordenação de Manutenção UTE",
    notes: SERVICOS_TETO_FIXO_FLUTUANTE,
  }),
  buildScheduled({
    tag: "TQ-27009",
    area: "UTE",
    product: "Diesel",
    tankType: "Teto Fixo/Flutuante",
    baselineStart: "2027-06-01",
    nextInternalInspection: "2027-12-25",
    responsible: "Coordenação de Manutenção UTE",
    notes: SERVICOS_TETO_FIXO_FLUTUANTE,
  }),
];
