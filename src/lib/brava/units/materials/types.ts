// Material Control domain model for equipment (Shutdown Control — Unidades).
// Mirrors lib/brava/materials/types.ts (Material), but links to an Equipment
// (equipmentId) instead of a Tank, and denormalizes ProcessUnit instead of
// TankFamily. The status/criticality/risk/attachment vocabulary is generic
// business language (not tank-specific), so it's reused directly from the
// tanks materials module rather than redefined here.

import { ProcessUnit } from "../types";
import {
  MaterialAttachment,
  MaterialCriticality,
  MaterialHistoryEntry,
  MaterialStatus,
} from "../../materials/types";

export interface EquipmentMaterial {
  id: string;
  code: string;
  description: string;
  category: string;
  equipmentId: string; // Equipment.id
  processUnit: ProcessUnit | null; // denormalized from the equipment at save time
  activityId?: string; // EquipmentActivity.id within the equipment's own schedule
  quantityRequired: number;
  unit: string; // unit of measure (UN, KG, M...)
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
export type EquipmentMaterialInput = Omit<EquipmentMaterial, "id" | "attachments" | "history" | "createdAt" | "updatedAt">;

export type EquipmentMaterialsQuickFilter =
  | "TODOS"
  | "U-260"
  | "U-270"
  | "CRITICOS"
  | "EM_ATRASO"
  | "EM_AQUISICAO"
  | "RECEBIDOS"
  | "COM_RISCO";

export type EquipmentMaterialsSortKey =
  | "PADRAO"
  | "NECESSIDADE"
  | "ENTREGA"
  | "CRITICIDADE"
  | "STATUS"
  | "EQUIPAMENTO"
  | "MATERIAL";
