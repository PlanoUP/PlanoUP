import { getSql } from "./client";
import { ensureSchema } from "./schema";
import { EquipmentMaterial, EquipmentMaterialInput } from "../brava/units/materials/types";
import { MaterialHistoryEntry } from "../brava/materials/types";
import { MATERIAL_STATUS_META } from "../brava/materials/meta";

function genId(): string {
  return `eqmat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listEquipmentMaterials(): Promise<EquipmentMaterial[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM equipment_materials ORDER BY id");
  return rows.map((r: Record<string, unknown>) => r.data as EquipmentMaterial);
}

async function getEquipmentMaterial(id: string): Promise<EquipmentMaterial | null> {
  const sql = getSql();
  const rows = await sql.query("SELECT data FROM equipment_materials WHERE id = $1", [id]);
  return rows[0]?.data ?? null;
}

async function saveEquipmentMaterial(material: EquipmentMaterial): Promise<void> {
  const sql = getSql();
  await sql.query(
    "INSERT INTO equipment_materials (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()",
    [material.id, JSON.stringify(material)]
  );
}

export async function createEquipmentMaterial(input: EquipmentMaterialInput): Promise<EquipmentMaterial> {
  await ensureSchema();
  const now = new Date().toISOString();
  const material: EquipmentMaterial = {
    ...input,
    id: genId(),
    processUnit: input.processUnit ?? null,
    attachments: [],
    history: [{ id: genId(), timestamp: now, field: "status", fromValue: null, toValue: input.status }],
    createdAt: now,
    updatedAt: now,
  };
  await saveEquipmentMaterial(material);
  return material;
}

export async function updateEquipmentMaterial(
  id: string,
  patch: Partial<EquipmentMaterialInput>
): Promise<EquipmentMaterial | null> {
  await ensureSchema();
  const material = await getEquipmentMaterial(id);
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

  const updated: EquipmentMaterial = { ...material, ...patch, history, updatedAt: now };
  await saveEquipmentMaterial(updated);
  return updated;
}

export async function deleteEquipmentMaterial(id: string): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql.query("DELETE FROM equipment_materials WHERE id = $1", [id]);
}

export async function duplicateEquipmentMaterial(id: string): Promise<EquipmentMaterial | null> {
  await ensureSchema();
  const source = await getEquipmentMaterial(id);
  if (!source) return null;

  const now = new Date().toISOString();
  const copy: EquipmentMaterial = {
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
  await saveEquipmentMaterial(copy);
  return copy;
}
