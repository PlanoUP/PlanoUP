import type {
  Activity,
  ActivityHistoryEntry,
  ActivityStatus,
  ExecutionStepKey,
  Priority,
  Responsible,
  RevitalizationItem,
  Unit,
} from "@/types/paint-control";

// Supabase/Postgres uses snake_case columns; the app's domain types stay
// camelCase everywhere else. These mappers are the only place that knows
// about the DB row shape.

export interface UnitRow {
  id: string;
  tag: string;
  name: string;
}

export interface ResponsibleRow {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  active: boolean;
}

export interface ActivityRow {
  id: string;
  unit_id: string;
  tag: string;
  local: string;
  title: string;
  description: string;
  priority: Priority;
  responsible_id: string | null;
  participant_ids: string[];
  estimated_area_m2: number | null;
  request_date: string | null;
  needed_date: string | null;
  programmed_date: string | null;
  actual_start_date: string | null;
  expected_end_date: string | null;
  actual_end_date: string | null;
  surface_type: string;
  surface_preparation: string;
  paint_system: string;
  primer: string;
  intermediate_coat: string;
  finish_coat: string;
  coats_count: number | null;
  technical_notes: string;
  status: ActivityStatus;
  progress: number;
  impediment: string;
  general_notes: string;
  work_order: string;
  note: string;
  reference: string;
  completed_steps: ExecutionStepKey[];
  created_at: string;
  updated_at: string;
}

export interface ActivityHistoryRow {
  id: string;
  activity_id: string;
  action: ActivityHistoryEntry["action"];
  message: string;
  author_name: string;
  created_at: string;
}

export function rowToUnit(row: UnitRow): Unit {
  return { id: row.id, tag: row.tag, name: row.name };
}

export function rowToResponsible(row: ResponsibleRow): Responsible {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    role: row.role,
    email: row.email,
    phone: row.phone,
    active: row.active,
  };
}

export function responsibleToRow(input: Omit<Responsible, "id">): Omit<ResponsibleRow, "id"> {
  return {
    name: input.name,
    company: input.company,
    role: input.role,
    email: input.email,
    phone: input.phone,
    active: input.active,
  };
}

export function rowToActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    unitId: row.unit_id,
    tag: row.tag,
    local: row.local,
    title: row.title,
    description: row.description,
    priority: row.priority,
    responsibleId: row.responsible_id,
    participantIds: row.participant_ids ?? [],
    estimatedAreaM2: row.estimated_area_m2,
    requestDate: row.request_date,
    neededDate: row.needed_date,
    programmedDate: row.programmed_date,
    actualStartDate: row.actual_start_date,
    expectedEndDate: row.expected_end_date,
    actualEndDate: row.actual_end_date,
    surfaceType: row.surface_type,
    surfacePreparation: row.surface_preparation,
    paintSystem: row.paint_system,
    primer: row.primer,
    intermediateCoat: row.intermediate_coat,
    finishCoat: row.finish_coat,
    coatsCount: row.coats_count,
    technicalNotes: row.technical_notes,
    status: row.status,
    progress: row.progress,
    impediment: row.impediment,
    generalNotes: row.general_notes,
    workOrder: row.work_order,
    note: row.note,
    reference: row.reference,
    completedSteps: row.completed_steps ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function activityToRow(
  input: Omit<Activity, "id" | "createdAt" | "updatedAt">
): Omit<ActivityRow, "id" | "created_at" | "updated_at"> {
  return {
    unit_id: input.unitId,
    tag: input.tag,
    local: input.local,
    title: input.title,
    description: input.description,
    priority: input.priority,
    responsible_id: input.responsibleId,
    participant_ids: input.participantIds,
    estimated_area_m2: input.estimatedAreaM2,
    request_date: input.requestDate,
    needed_date: input.neededDate,
    programmed_date: input.programmedDate,
    actual_start_date: input.actualStartDate,
    expected_end_date: input.expectedEndDate,
    actual_end_date: input.actualEndDate,
    surface_type: input.surfaceType,
    surface_preparation: input.surfacePreparation,
    paint_system: input.paintSystem,
    primer: input.primer,
    intermediate_coat: input.intermediateCoat,
    finish_coat: input.finishCoat,
    coats_count: input.coatsCount,
    technical_notes: input.technicalNotes,
    status: input.status,
    progress: input.progress,
    impediment: input.impediment,
    general_notes: input.generalNotes,
    work_order: input.workOrder,
    note: input.note,
    reference: input.reference,
    completed_steps: input.completedSteps,
  };
}

export function rowToHistoryEntry(row: ActivityHistoryRow): ActivityHistoryEntry {
  return {
    id: row.id,
    activityId: row.activity_id,
    action: row.action,
    message: row.message,
    authorName: row.author_name,
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------
// Revitalização — separate table, no unit_id (free-text `area` instead).
// ---------------------------------------------------------------------
export interface RevitalizationRow {
  id: string;
  area: string;
  title: string;
  description: string;
  priority: Priority;
  responsible_id: string | null;
  estimated_area_m2: number | null;
  request_date: string | null;
  needed_date: string | null;
  programmed_date: string | null;
  actual_start_date: string | null;
  expected_end_date: string | null;
  actual_end_date: string | null;
  surface_type: string;
  surface_preparation: string;
  paint_system: string;
  primer: string;
  intermediate_coat: string;
  finish_coat: string;
  coats_count: number | null;
  technical_notes: string;
  status: ActivityStatus;
  progress: number;
  impediment: string;
  general_notes: string;
  work_order: string;
  note: string;
  reference: string;
  created_at: string;
  updated_at: string;
}

export function rowToRevitalizationItem(row: RevitalizationRow): RevitalizationItem {
  return {
    id: row.id,
    area: row.area,
    title: row.title,
    description: row.description,
    priority: row.priority,
    responsibleId: row.responsible_id,
    estimatedAreaM2: row.estimated_area_m2,
    requestDate: row.request_date,
    neededDate: row.needed_date,
    programmedDate: row.programmed_date,
    actualStartDate: row.actual_start_date,
    expectedEndDate: row.expected_end_date,
    actualEndDate: row.actual_end_date,
    surfaceType: row.surface_type,
    surfacePreparation: row.surface_preparation,
    paintSystem: row.paint_system,
    primer: row.primer,
    intermediateCoat: row.intermediate_coat,
    finishCoat: row.finish_coat,
    coatsCount: row.coats_count,
    technicalNotes: row.technical_notes,
    status: row.status,
    progress: row.progress,
    impediment: row.impediment,
    generalNotes: row.general_notes,
    workOrder: row.work_order,
    note: row.note,
    reference: row.reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function revitalizationItemToRow(
  input: Omit<RevitalizationItem, "id" | "createdAt" | "updatedAt">
): Omit<RevitalizationRow, "id" | "created_at" | "updated_at"> {
  return {
    area: input.area,
    title: input.title,
    description: input.description,
    priority: input.priority,
    responsible_id: input.responsibleId,
    estimated_area_m2: input.estimatedAreaM2,
    request_date: input.requestDate,
    needed_date: input.neededDate,
    programmed_date: input.programmedDate,
    actual_start_date: input.actualStartDate,
    expected_end_date: input.expectedEndDate,
    actual_end_date: input.actualEndDate,
    surface_type: input.surfaceType,
    surface_preparation: input.surfacePreparation,
    paint_system: input.paintSystem,
    primer: input.primer,
    intermediate_coat: input.intermediateCoat,
    finish_coat: input.finishCoat,
    coats_count: input.coatsCount,
    technical_notes: input.technicalNotes,
    status: input.status,
    progress: input.progress,
    impediment: input.impediment,
    general_notes: input.generalNotes,
    work_order: input.workOrder,
    note: input.note,
    reference: input.reference,
  };
}
