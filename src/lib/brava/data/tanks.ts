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
  // Avanço real atualizado pelo usuário em 05/11/2026: 10% (era 50%, derivado
  // de order7/55%). Mesma ressalva de TQ-1222-36 abaixo sobre a etapa
  // nomeada ser só uma posição equivalente no template, não a real.
  buildActive({
    tag: "TQ-1222-35",
    area: "ETO",
    product: "Petróleo — Lavagem a Frio",
    tankType: "Teto Fixo",
    status: "EM_EXECUCAO",
    baselineStart: "2026-06-10",
    currentOrder: 2,
    currentProgress: 65,
    nextInternalInspection: "2026-01-15",
    responsible: "Coordenação de Manutenção ETO",
    notes: SERVICOS_LAVAGEM,
  }),
  // Real do relatório rev. 13 (corte 21/10/2026): 78,6% físico real contra
  // 83,4% previsto (-4,8 p.p.), entrega prevista 31/01/2027 (+153 dias sobre
  // a base). O estágio/etapa "atual" abaixo é uma aproximação sobre o
  // template padrão de 11 etapas — o relatório usa um framework de
  // marcos diferente (liberação/limpeza/plano de inspeção/atendimento às
  // recomendações/fechamento/entrega) que não mapeia 1:1 para cá; o número
  // de avanço geral é o que bate com o relatório, a etapa nomeada é só uma
  // posição equivalente no template.
  // Avanço real atualizado pelo usuário em 05/11/2026: 52% (era 78,6%,
  // derivado de order10/16%).
  buildActive({
    tag: "TQ-1222-36",
    area: "ETO",
    product: "Petróleo — Lavagem a Frio",
    tankType: "Teto Fixo",
    status: "EM_EXECUCAO",
    baselineStart: "2026-04-04",
    currentOrder: 7,
    currentProgress: 64,
    nextInternalInspection: "2026-01-25",
    responsible: "Coordenação de Manutenção ETO",
    notes: SERVICOS_LAVAGEM,
  }),
  // TQ-1222-62 e TQ-27010 eram ATRASADO/CRITICO aqui — usuário confirmou que
  // também não estão de fato em manutenção; voltam para "Sem Projeto" junto
  // com TQ-1222-21/44 e TQ-27001/27009 (ver essas TAGs mais abaixo).
  // Manutenção lançada em 14/10/2026 — tanques que estavam "Sem Projeto"
  // (apenas inventário de inspeção) e passam a ter um projeto ativo.
  // Real do relatório rev. 13: 32,2% físico real x 38,9% previsto
  // (-6,7 p.p.), entrega prevista 28/02/2027 (+151 dias). Mesma ressalva de
  // TQ-1222-36 acima sobre a etapa nomeada ser aproximada.
  // Avanço real atualizado pelo usuário em 05/11/2026: 30% (era 32,2%,
  // derivado de order6/33% — ajuste fino, não muda de etapa).
  buildActive({
    tag: "TQ-1222-25",
    area: "ETO",
    product: "Petróleo — Lavagem a Quente",
    tankType: "Teto Fixo",
    status: "EM_EXECUCAO",
    baselineStart: "2026-04-22",
    currentOrder: 6,
    currentProgress: 7,
    nextInternalInspection: "2025-12-22",
    responsible: "Coordenação de Manutenção ETO",
    notes: SERVICOS_LAVAGEM,
  }),
  // Real do relatório rev. 13: 50,5% físico real x 56,9% previsto
  // (-6,4 p.p.), entrega prevista 31/01/2027 (+93 dias).
  // Avanço real atualizado pelo usuário em 05/11/2026: 60% (era 50,5%,
  // derivado de order7/58%).
  buildActive({
    tag: "TQ-1222-33",
    area: "ETO",
    product: "Petróleo — Lavagem a Frio",
    tankType: "Teto Fixo",
    status: "EM_EXECUCAO",
    baselineStart: "2026-05-04",
    currentOrder: 8,
    currentProgress: 0,
    nextInternalInspection: "2024-10-25",
    responsible: "Coordenação de Manutenção ETO",
    notes: SERVICOS_LAVAGEM,
  }),
  // Real do relatório rev. 13: 33,1% físico real x 37,4% previsto
  // (-4,3 p.p.), entrega prevista 27/01/2027 (+12 dias).
  // Avanço real atualizado pelo usuário em 05/11/2026: 20% (era 33,1%,
  // derivado de order6/44%).
  buildActive({
    tag: "TQ-6313004",
    area: "Tancagem 6313",
    product: "A definir",
    tankType: "A definir",
    status: "EM_EXECUCAO",
    baselineStart: "2026-08-03",
    currentOrder: 4,
    currentProgress: 30,
    nextInternalInspection: "2026-02-27",
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
