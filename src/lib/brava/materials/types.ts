// Material Control domain model — a second, independent control axis alongside
// the maintenance schedule (Gantt/PlanningEditor) and the inspection-date
// engine (lib/brava/inspection.ts). A Material links to a Tank (tankId) and,
// optionally, to one of that tank's real schedule activities (activityId —
// see Activity.id in lib/brava/types.ts) so it can be grouped by stage
// without ever duplicating activity data here.
//
// Structured with a future Supabase table in mind: flat fields, ISO date
// strings, a denormalized tankFamily for fast filtering, and self-contained
// history/attachments arrays that map cleanly onto child tables later.

import { TankFamily } from "../types";

export type MaterialStatus =
  | "NAO_SOLICITADO"
  | "SOLICITACAO_EM_ANDAMENTO"
  | "EM_COTACAO"
  | "PEDIDO_EMITIDO"
  | "EM_FABRICACAO"
  | "EM_TRANSPORTE"
  | "RECEBIDO"
  | "LIBERADO_PARA_USO"
  | "CANCELADO";

export type MaterialCriticality = "CRITICO" | "IMPORTANTE" | "NORMAL";

/**
 * Schedule-risk classification — compares requiredDate x expectedDeliveryDate
 * (see calculateMaterialRisk in ./calculations). Independent from
 * MaterialCriticality: criticality is "how much this item matters",
 * MaterialRiskLevel is "is its delivery timeline currently a problem".
 */
export type MaterialRiskLevel =
  | "RISCO_CRONOGRAMA" // has a delivery forecast, and it lands after the need date
  | "ALTO_RISCO" // critical, not received, no forecast, need date close/overdue
  | "DENTRO_DO_PRAZO" // has a delivery forecast, on time
  | "SEM_RISCO"; // received/liberado, cancelled, or no near-term signal

export type MaterialAttachmentType =
  | "FOTO"
  | "DATASHEET"
  | "DESENHO"
  | "ESPECIFICACAO"
  | "CERTIFICADO"
  | "PEDIDO_COMPRA";

/**
 * Structure only — no upload pipeline in this first version (would need a
 * backend). Kept so the Material shape doesn't need to change when uploads
 * are wired in later; components may render this as an empty/placeholder list.
 */
export interface MaterialAttachment {
  id: string;
  type: MaterialAttachmentType;
  name: string;
  url?: string;
  note?: string;
}

/** Auto-appended whenever a tracked field (currently: status) changes. */
export interface MaterialHistoryEntry {
  id: string;
  timestamp: string; // ISO datetime
  field: string;
  fromValue: string | null;
  toValue: string;
}

export interface Material {
  id: string;
  code: string;
  description: string;
  category: string;
  tankId: string; // Tank.id
  tankFamily: TankFamily | null; // denormalized from the tank at save time
  activityId?: string; // Activity.id within the tank's own schedule
  quantityRequired: number;
  unit: string;
  quantityAvailable: number;
  requiredDate?: string; // ISO — "data de necessidade"
  requestDate?: string; // ISO — "data da solicitação"
  expectedDeliveryDate?: string; // ISO — "previsão de entrega"
  actualDeliveryDate?: string; // ISO — "data real de entrega"
  status: MaterialStatus;
  criticality: MaterialCriticality;
  supplier?: string;
  purchaseOrder?: string;
  responsible?: string;
  notes?: string;
  attachments: MaterialAttachment[];
  history: MaterialHistoryEntry[];
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

/** Payload for creating/editing a material via the form drawer. */
export type MaterialInput = Omit<Material, "id" | "attachments" | "history" | "createdAt" | "updatedAt">;

export type MaterialsQuickFilter =
  | "TODOS"
  | "410"
  | "6313"
  | "270"
  | "CRITICOS"
  | "EM_ATRASO"
  | "EM_AQUISICAO"
  | "RECEBIDOS"
  | "COM_RISCO";

export type MaterialsSortKey =
  | "PADRAO"
  | "NECESSIDADE"
  | "ENTREGA"
  | "CRITICIDADE"
  | "STATUS"
  | "TANQUE"
  | "MATERIAL";
