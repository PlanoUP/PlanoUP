// Domain types for PAINT CONTROL ATI.
// Field/table names are chosen to map 1:1 onto future Supabase tables
// (units, activities, users/responsibles, activity_participants,
// activity_history, activity_photos) so the storage layer can be swapped
// out without touching the rest of the app.

export type Priority = "P1" | "P2" | "P3" | "P4";

export const PRIORITIES: Priority[] = ["P1", "P2", "P3", "P4"];

export type ActivityStatus =
  | "Backlog"
  | "Aguardando Programação"
  | "Programado"
  | "Aguardando Liberação"
  | "Liberado"
  | "Em Execução"
  | "Paralisado"
  | "Em Inspeção"
  | "Concluído"
  | "Cancelado";

export const ACTIVITY_STATUSES: ActivityStatus[] = [
  "Backlog",
  "Aguardando Programação",
  "Programado",
  "Aguardando Liberação",
  "Liberado",
  "Em Execução",
  "Paralisado",
  "Em Inspeção",
  "Concluído",
  "Cancelado",
];

/** Statuses that count as "closed" and are excluded from overdue/active-average calculations. */
export const CLOSED_STATUSES: ActivityStatus[] = ["Concluído", "Cancelado"];

export type ExecutionStepKey =
  | "levantamento"
  | "programacao"
  | "liberacao"
  | "preparacao_superficie"
  | "primer"
  | "pintura_intermediaria"
  | "acabamento"
  | "inspecao"
  | "concluido";

export interface ExecutionStepDef {
  key: ExecutionStepKey;
  label: string;
}

export const EXECUTION_STEPS: ExecutionStepDef[] = [
  { key: "levantamento", label: "Levantamento" },
  { key: "programacao", label: "Programação" },
  { key: "liberacao", label: "Liberação" },
  { key: "preparacao_superficie", label: "Preparação da superfície" },
  { key: "primer", label: "Primer" },
  { key: "pintura_intermediaria", label: "Pintura intermediária" },
  { key: "acabamento", label: "Acabamento" },
  { key: "inspecao", label: "Inspeção" },
  { key: "concluido", label: "Concluído" },
];

export interface Unit {
  id: string; // UUID, internal PK — never used for linking activities
  tag: string; // short TAG, may repeat across units
  name: string; // full display name
}

export interface Responsible {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  active: boolean;
}

export interface Activity {
  id: string;
  unitId: string; // FK -> Unit.id (never link by tag text)

  // Identificação
  tag: string;
  local: string;
  title: string;
  description: string;

  // Planejamento
  priority: Priority;
  responsibleId: string | null;
  participantIds: string[];
  estimatedAreaM2: number | null;
  requestDate: string | null; // ISO date
  neededDate: string | null;
  programmedDate: string | null;
  actualStartDate: string | null;
  expectedEndDate: string | null;
  actualEndDate: string | null;

  // Pintura
  surfaceType: string;
  surfacePreparation: string;
  paintSystem: string;
  primer: string;
  intermediateCoat: string;
  finishCoat: string;
  coatsCount: number | null;
  technicalNotes: string;

  // Controle
  status: ActivityStatus;
  progress: number; // 0-100
  impediment: string;
  generalNotes: string;
  workOrder: string; // OS
  note: string; // Nota
  reference: string;

  // Etapas de execução
  completedSteps: ExecutionStepKey[];

  createdAt: string; // ISO datetime
  updatedAt: string;
}

export type ActivityHistoryAction =
  | "created"
  | "priority_changed"
  | "responsible_changed"
  | "schedule_changed"
  | "progress_changed"
  | "status_changed"
  | "completed"
  | "updated"
  | "deleted";

export interface ActivityHistoryEntry {
  id: string;
  activityId: string;
  action: ActivityHistoryAction;
  message: string;
  authorName: string;
  createdAt: string; // ISO datetime
}

/** Prepared for a future activity_photos table; not populated in this phase. */
export interface ActivityPhoto {
  id: string;
  activityId: string;
  url: string;
  caption: string;
  createdAt: string;
}

/**
 * Revitalização is a control kept deliberately separate from the unit-based
 * painting activities above: it tracks site facilities/areas (pátio de
 * sucata, subestação, galpões, etc.) that don't correspond to any of the
 * 31 registered ATI process units, so it uses a free-text `area` instead
 * of a Unit FK. Everything else mirrors Activity's planning/control fields
 * for consistency.
 */
export interface RevitalizationItem {
  id: string;

  // Identificação
  area: string; // free-text site area/facility, e.g. "Pátio de Sucata"
  title: string;
  description: string;

  // Planejamento
  priority: Priority;
  responsibleId: string | null;
  estimatedAreaM2: number | null;
  requestDate: string | null;
  neededDate: string | null;
  programmedDate: string | null;
  actualStartDate: string | null;
  expectedEndDate: string | null;
  actualEndDate: string | null;

  // Pintura
  surfaceType: string;
  surfacePreparation: string;
  paintSystem: string;
  primer: string;
  intermediateCoat: string;
  finishCoat: string;
  coatsCount: number | null;
  technicalNotes: string;

  // Controle
  status: ActivityStatus;
  progress: number;
  impediment: string;
  generalNotes: string;
  workOrder: string;
  note: string;
  reference: string;

  createdAt: string;
  updatedAt: string;
}

export type UserRole = "ADMIN" | "GESTOR" | "EXECUTOR" | "VISUALIZACAO";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
