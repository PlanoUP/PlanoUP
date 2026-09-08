// Standard maintenance sequence for an industrial storage tank, derived from
// the "PRINCIPAIS ETAPAS DE MANUTENÇÃO DE TANQUES" reference table (optimized
// durations column) and cross-checked against the technical-visit roadmap.
// This is the template every tank's schedule is generated from.

export interface StageDef {
  order: number;
  key: string;
  name: string;
  durationDays: number;
  isMilestone: boolean;
}

export const STAGE_TEMPLATE: StageDef[] = [
  { order: 1, key: "DRENAGEM", name: "Drenagem", durationDays: 5, isMilestone: true },
  { order: 2, key: "REMOCAO_BORRA", name: "Remoção de Borra", durationDays: 20, isMilestone: false },
  { order: 3, key: "LAVAGEM_INTERNA", name: "Lavagem Interna", durationDays: 5, isMilestone: false },
  { order: 4, key: "MONTAGEM_ANDAIME", name: "Montagem de Andaime", durationDays: 20, isMilestone: false },
  { order: 5, key: "INSPECAO", name: "Inspeção", durationDays: 3, isMilestone: true },
  { order: 6, key: "REPAROS_CALDEIRARIA_TETO", name: "Reparos de Caldeiraria (Teto)", durationDays: 15, isMilestone: false },
  { order: 7, key: "PINTURA_TETO", name: "Pintura (Teto)", durationDays: 40, isMilestone: false },
  { order: 8, key: "DESMONTAGEM_ANDAIME", name: "Desmontagem de Andaime", durationDays: 12, isMilestone: false },
  { order: 9, key: "REPAROS_CALDEIRARIA_PISO", name: "Reparos de Caldeiraria (Piso)", durationDays: 15, isMilestone: false },
  { order: 10, key: "PINTURA_PISO", name: "Pintura (Piso)", durationDays: 40, isMilestone: false },
  { order: 11, key: "FECHAMENTO", name: "Fechamento e Comissionamento", durationDays: 5, isMilestone: true },
];

export const STANDARD_CAMPAIGN_DAYS = STAGE_TEMPLATE.reduce((sum, s) => sum + s.durationDays, 0);
