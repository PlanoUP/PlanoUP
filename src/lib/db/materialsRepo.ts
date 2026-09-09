import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { Material, MaterialHistoryEntry, MaterialInput } from "../brava/materials/types";
import { MATERIAL_STATUS_META } from "../brava/materials/meta";

function genId(): string {
  return `mat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listMaterials(): Promise<Material[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM materials ORDER BY id");
  return rows.map((r: Record<string, unknown>) => r.data as Material);
}

async function getMaterial(id: string): Promise<Material | null> {
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM materials WHERE id = $1", [id]);
  return rows[0]?.data ?? null;
}

async function saveMaterial(material: Material): Promise<void> {
  const sql = getSql();
  await sql.query(
    "INSERT INTO materials (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()",
    [material.id, JSON.stringify(material)]
  );
}

export async function createMaterial(input: MaterialInput): Promise<Material> {
  await ensureSchema();
  const now = new Date().toISOString();
  const material: Material = {
    ...input,
    id: genId(),
    tankFamily: input.tankFamily ?? null,
    attachments: [],
    history: [{ id: genId(), timestamp: now, field: "status", fromValue: null, toValue: input.status }],
    createdAt: now,
    updatedAt: now,
  };
  await saveMaterial(material);
  return material;
}

export async function updateMaterial(id: string, patch: Partial<MaterialInput>): Promise<Material | null> {
  await ensureSchema();
  const material = await getMaterial(id);
  if (!material) return null;

  const now = new Date().toISOString();
  const history: MaterialHistoryEntry[] =
    patch.status && patch.status !== material.status
      ? [
          ...material.history,
          {
            id: genId(),
            timestamp: now,
            field: "status",
            fromValue: MATERIAL_STATUS_META[material.status].label,
            toValue: MATERIAL_STATUS_META[patch.status].label,
          },
        ]
      : material.history;

  const updated: Material = { ...material, ...patch, history, updatedAt: now };
  await saveMaterial(updated);
  return updated;
}

export async function deleteMaterial(id: string): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql.query("DELETE FROM materials WHERE id = $1", [id]);
}

export async function duplicateMaterial(id: string): Promise<Material | null> {
  await ensureSchema();
  const source = await getMaterial(id);
  if (!source) return null;

  const now = new Date().toISOString();
  const copy: Material = {
    ...source,
    id: genId(),
    description: `${source.description} (cópia)`,
    code: source.code ? `${source.code}-COPIA` : source.code,
    attachments: [],
    history: [
      { id: genId(), timestamp: now, field: "status", fromValue: null, toValue: MATERIAL_STATUS_META[source.status].label },
    ],
    createdAt: now,
    updatedAt: now,
  };
  await saveMaterial(copy);
  return copy;
}
