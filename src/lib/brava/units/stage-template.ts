// Standard shutdown/turnaround sequence for a process-unit equipment item —
// mirrors lib/brava/stage-template.ts (tanks) but for the typical phases of
// a unit turnaround. Durations are placeholders (editable per activity via
// the Planning Editor, same as tanks) since no real duration reference was
// provided for equipment yet — only the phase sequence itself is fixed.

export interface StageDef {
  order: number;
  key: string;
  name: string;
  durationDays: number;
  isMilestone: boolean;
}

export const STAGE_TEMPLATE: StageDef[] = [
  { order: 1, key: "PREPARACAO", name: "Preparação", durationDays: 5, isMilestone: true },
  { order: 2, key: "ISOLAMENTO", name: "Isolamento", durationDays: 3, isMilestone: false },
  { order: 3, key: "ABERTURA", name: "Abertura", durationDays: 4, isMilestone: false },
  { order: 4, key: "INSPECAO", name: "Inspeção", durationDays: 5, isMilestone: true },
  { order: 5, key: "REPARO", name: "Reparo", durationDays: 10, isMilestone: false },
  { order: 6, key: "FECHAMENTO", name: "Fechamento", durationDays: 4, isMilestone: false },
  { order: 7, key: "PARTIDA", name: "Partida", durationDays: 3, isMilestone: true },
];

export const STANDARD_SHUTDOWN_DAYS = STAGE_TEMPLATE.reduce((sum, s) => sum + s.durationDays, 0);
