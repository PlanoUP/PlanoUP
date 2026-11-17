// Fiscal field-registration domain — individual Fiscal accounts, distinct
// from the single shared "editor" password, plus a dated, attributed log of
// what each one registers from a tank in the field: a running list of
// activities as they happen during the day (not tied to the tank's formal
// Gantt schedule), each with its own start/end time, observação and fotos,
// plus one "day header" per tank+date (PT número/horário, efetivo) that the
// day's PDF report is built from.

/** Quick-pick activity labels offered in Campo — a Fiscal can also type a custom one via "+ Adicionar atividade". */
export const PRESET_FIELD_ACTIVITIES = [
  "Início da pré-parada",
  "Materiais",
  "Término da pré-parada",
  "Início da parada",
] as const;

export interface FieldUser {
  id: string;
  name: string;
  /** Lowercase, unique login handle — not an email, no verification needed. */
  username: string;
  passwordHash: string;
  active: boolean;
  /** Tank TAGs this Fiscal may see and register against in /brava/campo — empty means none allocated yet. */
  allocatedTags: string[];
  createdAt: string;
  updatedAt: string;
}

/** What the client ever sees of a FieldUser — passwordHash never leaves the server. */
export type FieldUserPublic = Omit<FieldUser, "passwordHash">;

export function toPublicFieldUser(user: FieldUser): FieldUserPublic {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export interface FieldEntryInput {
  tankId: string;
  /** One of PRESET_FIELD_ACTIVITIES, or a custom label the Fiscal typed. */
  activityName: string;
  observacao: string;
  ocorrencia: boolean;
  photos: string[];
}

export interface FieldEntry {
  id: string;
  tankId: string;
  tankTag: string;
  /** YYYY-MM-DD, assigned server-side at creation — the day this entry's report groups it into. */
  date: string;
  activityName: string;
  userId: string;
  userName: string;
  observacao: string;
  ocorrencia: boolean;
  photos: string[];
  createdAt: string;
  /** Client-only — set when this is a local, not-yet-synced entry from the offline outbox. Never set by the server. */
  pendingSync?: boolean;
}

/** One per tank+date — the PT/PET release info and efetivo for that day, pinned at the top of Campo and of the day's PDF report. Upserted (last write wins), not an append-only log. */
export interface FieldDailyLog {
  id: string; // `${tankId}__${date}`
  tankId: string;
  tankTag: string;
  date: string;
  ptNumero: string;
  ptHorario: string | null;
  petHorario1: string | null;
  petHorario2: string | null;
  efetivo: string;
  updatedAt: string;
  updatedByName: string;
}
