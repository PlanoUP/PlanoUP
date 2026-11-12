// Fiscal field-registration domain — individual Fiscal accounts, distinct
// from the single shared "editor" password, plus a dated, attributed log of
// what each one registers from a tank in the field (progress, observação,
// ocorrência, material consumido, fotos). Never a source of truth for a
// tank's own fields — a field entry's progress update still lands through
// tanksRepo.updateTankActivity exactly like an editor's own edit would.

export interface FieldUser {
  id: string;
  name: string;
  /** Lowercase, unique login handle — not an email, no verification needed. */
  username: string;
  passwordHash: string;
  active: boolean;
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
  activityId: string | null;
  /** New progress (0-100) for that activity, or null when this entry only carries an observação/fotos without touching progress. */
  progress: number | null;
  observacao: string;
  ocorrencia: boolean;
  materialDescricao: string;
  materialQuantidade: string;
  photos: string[];
}

export interface FieldEntry {
  id: string;
  tankId: string;
  tankTag: string;
  activityId: string | null;
  activityName: string | null;
  userId: string;
  userName: string;
  progressBefore: number | null;
  progressAfter: number | null;
  observacao: string;
  ocorrencia: boolean;
  materialDescricao: string;
  materialQuantidade: string;
  photos: string[];
  createdAt: string;
}
