import type { CostEntryInput } from "./types";

// CAPEX 2026-2031 — Tanques (planilha fornecida pelo usuário). Cada linha é
// um "serviço" do CAPEX: uma TAG, um período e o valor orçado em R$ MM.
// Transcrito da imagem com soma de cada coluna conferida contra o total
// impresso (todas batem exatamente). Tags vieram como "TQ-1222.XX" na
// planilha — normalizadas para "TQ-1222-XX" para casar com o formato já
// usado no resto do sistema (ver lib/brava/maps/config.ts).
//
// TQ-26021 e TQ-26024 (coluna 2030) não correspondem a nenhuma TAG
// cadastrada no sistema hoje (famílias conhecidas: 410, 6313, 270, 1222) —
// mantidos aqui como estão na planilha, mas sem vínculo a um tanque
// existente até confirmação.
const SOURCE = "CAPEX 2026-2031 — Tanques";

export const SEED_COST_ENTRIES: CostEntryInput[] = [
  // 2026 — total R$ 29,16 MM
  { tag: "TQ-1222-21", period: "2026", source: SOURCE, orcado: 1.08, realizado: null },
  { tag: "TQ-1222-25", period: "2026", source: SOURCE, orcado: 3.2, realizado: null },
  { tag: "TQ-1222-33", period: "2026", source: SOURCE, orcado: 6.0, realizado: null },
  { tag: "TQ-1222-35", period: "2026", source: SOURCE, orcado: 4.48, realizado: null },
  { tag: "TQ-1222-36", period: "2026", source: SOURCE, orcado: 2.5, realizado: null },
  { tag: "TQ-27016", period: "2026", source: SOURCE, orcado: 0.89, realizado: null },
  { tag: "TQ-41002", period: "2026", source: SOURCE, orcado: 3.0, realizado: null },
  { tag: "TQ-41005", period: "2026", source: SOURCE, orcado: 3.0, realizado: null },
  { tag: "TQ-6313002", period: "2026", source: SOURCE, orcado: 1.44, realizado: null },
  { tag: "TQ-6313004", period: "2026", source: SOURCE, orcado: 2.82, realizado: null },
  { tag: "TQ-6313006", period: "2026", source: SOURCE, orcado: 0.75, realizado: null },

  // Carryover 2027 — total R$ 10,90 MM
  { tag: "TQ-1222-25", period: "CARRYOVER_2027", source: SOURCE, orcado: 2.0, realizado: null },
  { tag: "TQ-1222-33", period: "CARRYOVER_2027", source: SOURCE, orcado: 1.8, realizado: null },
  { tag: "TQ-1222-35", period: "CARRYOVER_2027", source: SOURCE, orcado: 4.1, realizado: null },
  { tag: "TQ-1222-36", period: "CARRYOVER_2027", source: SOURCE, orcado: 1.3, realizado: null },
  { tag: "TQ-6313004", period: "CARRYOVER_2027", source: SOURCE, orcado: 1.7, realizado: null },

  // 2027 — total R$ 17,75 MM
  { tag: "TQ-1222-31", period: "2027", source: SOURCE, orcado: 4.53, realizado: null },
  { tag: "TQ-41004", period: "2027", source: SOURCE, orcado: 10.4, realizado: null },
  { tag: "TQ-6313005", period: "2027", source: SOURCE, orcado: 2.82, realizado: null },

  // 2028 — total R$ 24,34 MM
  { tag: "TQ-1222-24", period: "2028", source: SOURCE, orcado: 4.44, realizado: null },
  { tag: "TQ-1222-43", period: "2028", source: SOURCE, orcado: 3.15, realizado: null },
  { tag: "TQ-27001", period: "2028", source: SOURCE, orcado: 0.83, realizado: null },
  { tag: "TQ-27002", period: "2028", source: SOURCE, orcado: 0.83, realizado: null },
  { tag: "TQ-27003", period: "2028", source: SOURCE, orcado: 0.83, realizado: null },
  { tag: "TQ-27009", period: "2028", source: SOURCE, orcado: 2.26, realizado: null },
  { tag: "TQ-41002", period: "2028", source: SOURCE, orcado: 12.0, realizado: null },

  // 2029 — total R$ 12,83 MM
  { tag: "TQ-27011", period: "2029", source: SOURCE, orcado: 0.83, realizado: null },
  { tag: "TQ-41005", period: "2029", source: SOURCE, orcado: 12.0, realizado: null },

  // 2030 — total R$ 2,22 MM
  { tag: "TQ-26021", period: "2030", source: SOURCE, orcado: 0.49, realizado: null },
  { tag: "TQ-26024", period: "2030", source: SOURCE, orcado: 0.49, realizado: null },
  { tag: "TQ-27015", period: "2030", source: SOURCE, orcado: 1.24, realizado: null },

  // 2031 — total R$ 4,48 MM
  { tag: "TQ-1222-23", period: "2031", source: SOURCE, orcado: 4.48, realizado: null },
];
