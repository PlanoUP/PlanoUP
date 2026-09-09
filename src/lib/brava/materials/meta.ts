import { MaterialCriticality, MaterialRiskLevel, MaterialStatus } from "./types";

export const DEFAULT_CATEGORIES: string[] = [
  "Chapas",
  "Perfis e Estruturas",
  "Parafusos / Prisioneiros",
  "Juntas",
  "Válvulas",
  "Bocais / Conexões",
  "Consumíveis de Soldagem",
  "Tintas / Revestimentos",
  "Materiais de Pintura",
  "Isolamento",
  "Tubulação",
  "Instrumentação",
  "Elétrica",
  "Materiais Diversos",
];

export const UNIT_OPTIONS: string[] = [
  "UN",
  "PC",
  "KG",
  "TON",
  "M",
  "M²",
  "M³",
  "L",
  "KIT",
  "CX",
  "ROLO",
  "BARRA",
  "CHAPA",
];

export const RESPONSIBLE_SUGGESTIONS: string[] = [
  "Planejamento",
  "Suprimentos",
  "Inspeção",
  "Manutenção",
  "Contrato",
];

export interface StatusMeta {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const MATERIAL_STATUS_ORDER: MaterialStatus[] = [
  "NAO_SOLICITADO",
  "SOLICITACAO_EM_ANDAMENTO",
  "EM_COTACAO",
  "PEDIDO_EMITIDO",
  "EM_FABRICACAO",
  "EM_TRANSPORTE",
  "RECEBIDO",
  "LIBERADO_PARA_USO",
  "CANCELADO",
];

export const MATERIAL_STATUS_META: Record<MaterialStatus, StatusMeta> = {
  NAO_SOLICITADO: {
    label: "Não Solicitado",
    badgeClass: "border-brava-border bg-brava-bg text-brava-text-secondary",
    dotClass: "bg-brava-text-secondary",
  },
  SOLICITACAO_EM_ANDAMENTO: {
    label: "Solicitação em Andamento",
    badgeClass: "border-brava-blue/20 bg-brava-blue/[0.06] text-brava-blue",
    dotClass: "bg-brava-blue",
  },
  EM_COTACAO: {
    label: "Em Cotação",
    badgeClass: "border-brava-blue/20 bg-brava-blue/[0.06] text-brava-blue",
    dotClass: "bg-brava-blue",
  },
  PEDIDO_EMITIDO: {
    label: "Pedido Emitido",
    badgeClass: "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]",
    dotClass: "bg-[#F79009]",
  },
  EM_FABRICACAO: {
    label: "Em Fabricação",
    badgeClass: "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]",
    dotClass: "bg-[#F79009]",
  },
  EM_TRANSPORTE: {
    label: "Em Transporte",
    badgeClass: "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]",
    dotClass: "bg-[#F79009]",
  },
  RECEBIDO: {
    label: "Recebido",
    badgeClass: "border-brava-success-border bg-brava-success-bg text-brava-success",
    dotClass: "bg-brava-success",
  },
  LIBERADO_PARA_USO: {
    label: "Liberado para Uso",
    badgeClass: "border-brava-success-border bg-brava-success-bg text-brava-success",
    dotClass: "bg-brava-success",
  },
  CANCELADO: {
    label: "Cancelado",
    badgeClass: "border-brava-border bg-brava-white text-brava-text-secondary line-through",
    dotClass: "bg-brava-text-secondary",
  },
};

export interface CriticalityMeta {
  label: string;
  weight: number;
  badgeClass: string;
  dotClass: string;
}

export const MATERIAL_CRITICALITY_META: Record<MaterialCriticality, CriticalityMeta> = {
  CRITICO: {
    label: "Crítico",
    weight: 5,
    badgeClass: "border-brava-danger-border bg-brava-danger-bg text-brava-danger",
    dotClass: "bg-brava-danger",
  },
  IMPORTANTE: {
    label: "Importante",
    weight: 3,
    badgeClass: "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]",
    dotClass: "bg-[#F79009]",
  },
  NORMAL: {
    label: "Normal",
    weight: 1,
    badgeClass: "border-brava-border bg-brava-bg text-brava-text-secondary",
    dotClass: "bg-brava-text-secondary",
  },
};

export interface RiskMeta {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const MATERIAL_RISK_META: Record<MaterialRiskLevel, RiskMeta> = {
  RISCO_CRONOGRAMA: {
    label: "Risco ao Cronograma",
    badgeClass: "border-brava-danger-border bg-brava-danger-bg text-brava-danger",
    dotClass: "bg-brava-danger",
  },
  ALTO_RISCO: {
    label: "Alto Risco",
    badgeClass: "border-brava-danger-border bg-brava-danger-bg text-brava-danger",
    dotClass: "bg-brava-danger",
  },
  DENTRO_DO_PRAZO: {
    label: "Dentro do Prazo",
    badgeClass: "border-brava-success-border bg-brava-success-bg text-brava-success",
    dotClass: "bg-brava-success",
  },
  SEM_RISCO: {
    label: "Sem Risco",
    badgeClass: "border-brava-border bg-brava-bg text-brava-text-secondary",
    dotClass: "bg-brava-text-secondary",
  },
};

/** Statuses where the material is considered ready/fulfilled for readiness math. */
export const READY_STATUSES: MaterialStatus[] = ["RECEBIDO", "LIBERADO_PARA_USO"];

/** Statuses that mean the item is actively moving through procurement. */
export const ACQUISITION_STATUSES: MaterialStatus[] = [
  "SOLICITACAO_EM_ANDAMENTO",
  "EM_COTACAO",
  "PEDIDO_EMITIDO",
  "EM_FABRICACAO",
  "EM_TRANSPORTE",
];
