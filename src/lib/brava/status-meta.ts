import { TankStatus } from "./types";

export interface StatusMeta {
  label: string;
  dotClass: string;
  textClass: string;
  badgeClass: string;
}

export const STATUS_META: Record<TankStatus, StatusMeta> = {
  PROGRAMADO: {
    label: "Programado",
    dotClass: "bg-brava-text-secondary",
    textClass: "text-brava-text-secondary",
    badgeClass: "border-brava-border bg-brava-bg text-brava-text-secondary",
  },
  EM_EXECUCAO: {
    label: "Em Execução",
    dotClass: "bg-brava-blue",
    textClass: "text-brava-blue",
    badgeClass: "border-brava-blue/20 bg-brava-blue/[0.06] text-brava-blue",
  },
  CONCLUIDO: {
    label: "Concluído",
    dotClass: "bg-brava-success",
    textClass: "text-brava-success",
    badgeClass: "border-brava-success-border bg-brava-success-bg text-brava-success",
  },
  ATRASADO: {
    label: "Atrasado",
    dotClass: "bg-brava-warning",
    textClass: "text-brava-warning",
    badgeClass: "border-brava-warning-border bg-brava-warning-bg text-brava-warning",
  },
  CRITICO: {
    label: "Crítico",
    dotClass: "bg-brava-danger",
    textClass: "text-brava-danger",
    badgeClass: "border-brava-danger-border bg-brava-danger-bg text-brava-danger",
  },
  SEM_PROJETO: {
    label: "Sem Projeto",
    dotClass: "bg-brava-text-secondary",
    textClass: "text-brava-text-secondary",
    badgeClass: "border-dashed border-brava-border bg-brava-white text-brava-text-secondary",
  },
};

export const STATUS_ORDER: TankStatus[] = [
  "CRITICO",
  "ATRASADO",
  "EM_EXECUCAO",
  "PROGRAMADO",
  "CONCLUIDO",
  "SEM_PROJETO",
];
