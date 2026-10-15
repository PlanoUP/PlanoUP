"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useUnitsData } from "@/lib/brava/units/context";
import { useEquipmentMaterialsData } from "@/lib/brava/units/materials/context";
import { EquipmentMaterial, EquipmentMaterialInput } from "@/lib/brava/units/materials/types";
import { MaterialCriticality, MaterialStatus } from "@/lib/brava/materials/types";
import {
  DEFAULT_CATEGORIES,
  MATERIAL_CRITICALITY_META,
  MATERIAL_STATUS_META,
  MATERIAL_STATUS_ORDER,
  RESPONSIBLE_SUGGESTIONS,
  UNIT_OPTIONS,
} from "@/lib/brava/materials/meta";
import { calculateMaterialRisk, formatMaterialRiskDetail } from "@/lib/brava/units/materials/calculations";
import { cn } from "@/lib/brava/cn";
import MaterialRiskBadge from "../../materials/MaterialRiskBadge";

const CUSTOM_OPTION = "__custom__";

const INPUT_CLASS =
  "w-full rounded-brava-sm border border-brava-border bg-brava-white px-3 py-2 text-[13px] text-brava-text focus:border-brava-blue focus:outline-none focus:ring-1 focus:ring-brava-blue";

type FormState = {
  code: string;
  description: string;
  category: string;
  equipmentId: string;
  activityId: string;
  quantityRequired: string;
  unit: string;
  quantityAvailable: string;
  requiredDate: string;
  requestDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate: string;
  status: MaterialStatus;
  criticality: MaterialCriticality;
  supplier: string;
  purchaseOrder: string;
  responsible: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  code: "",
  description: "",
  category: DEFAULT_CATEGORIES[0],
  equipmentId: "",
  activityId: "",
  quantityRequired: "",
  unit: UNIT_OPTIONS[0],
  quantityAvailable: "0",
  requiredDate: "",
  requestDate: "",
  expectedDeliveryDate: "",
  actualDeliveryDate: "",
  status: "NAO_SOLICITADO",
  criticality: "NORMAL",
  supplier: "",
  purchaseOrder: "",
  responsible: "",
  notes: "",
};

function materialToForm(m: EquipmentMaterial): FormState {
  return {
    code: m.code,
    description: m.description,
    category: m.category,
    equipmentId: m.equipmentId,
    activityId: m.activityId ?? "",
    quantityRequired: String(m.quantityRequired ?? ""),
    unit: m.unit,
    quantityAvailable: String(m.quantityAvailable ?? 0),
    requiredDate: m.requiredDate ?? "",
    requestDate: m.requestDate ?? "",
    expectedDeliveryDate: m.expectedDeliveryDate ?? "",
    actualDeliveryDate: m.actualDeliveryDate ?? "",
    status: m.status,
    criticality: m.criticality,
    supplier: m.supplier ?? "",
    purchaseOrder: m.purchaseOrder ?? "",
    responsible: m.responsible ?? "",
    notes: m.notes ?? "",
  };
}

export default function EquipmentMaterialFormDrawer({
  open,
  onClose,
  material,
  defaultEquipmentId,
  defaultActivityId,
}: {
  open: boolean;
  onClose: () => void;
  material?: EquipmentMaterial;
  defaultEquipmentId?: string;
  defaultActivityId?: string;
}) {
  const { equipment, today } = useUnitsData();
  const { materials, addMaterial, updateMaterial } = useEquipmentMaterialsData();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [categoryCustom, setCategoryCustom] = useState("");
  const [unitCustom, setUnitCustom] = useState("");
  const [error, setError] = useState<string | null>(null);

  const usedCategories = useMemo(
    () => Array.from(new Set(materials.map((m) => m.category))).filter((c) => !DEFAULT_CATEGORIES.includes(c)),
    [materials]
  );
  const categoryOptions = [...DEFAULT_CATEGORIES, ...usedCategories];
  const isCustomCategory = form.category !== "" && !categoryOptions.includes(form.category);
  const isCustomUnit = form.unit !== "" && !UNIT_OPTIONS.includes(form.unit);

  useEffect(() => {
    if (!open) return;
    if (material) {
      setForm(materialToForm(material));
    } else {
      setForm({
        ...EMPTY_FORM,
        equipmentId: defaultEquipmentId ?? "",
        activityId: defaultActivityId ?? "",
      });
    }
    setError(null);
  }, [open, material, defaultEquipmentId, defaultActivityId]);

  const selectedEquipment = equipment.find((e) => e.id === form.equipmentId);
  const activityOptions = selectedEquipment?.activities ?? [];

  const previewRisk = useMemo(() => {
    if (!form.requiredDate) return null;
    const fake: EquipmentMaterial = {
      id: "preview",
      code: form.code,
      description: form.description,
      category: form.category,
      equipmentId: form.equipmentId,
      processUnit: selectedEquipment?.unit ?? null,
      activityId: form.activityId || undefined,
      quantityRequired: Number(form.quantityRequired) || 0,
      unit: form.unit,
      quantityAvailable: Number(form.quantityAvailable) || 0,
      requiredDate: form.requiredDate || undefined,
      requestDate: form.requestDate || undefined,
      expectedDeliveryDate: form.expectedDeliveryDate || undefined,
      actualDeliveryDate: form.actualDeliveryDate || undefined,
      status: form.status,
      criticality: form.criticality,
      supplier: form.supplier,
      purchaseOrder: form.purchaseOrder,
      responsible: form.responsible,
      notes: form.notes,
      attachments: [],
      history: [],
      createdAt: today,
      updatedAt: today,
    };
    return calculateMaterialRisk(fake, today);
  }, [form, selectedEquipment, today]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) {
      setError("Informe a descrição do material.");
      return;
    }
    if (!form.equipmentId) {
      setError("Selecione o equipamento associado.");
      return;
    }

    const input: EquipmentMaterialInput = {
      code: form.code.trim(),
      description: form.description.trim(),
      category: form.category.trim() || "Materiais Diversos",
      equipmentId: form.equipmentId,
      processUnit: selectedEquipment?.unit ?? null,
      activityId: form.activityId || undefined,
      quantityRequired: Number(form.quantityRequired) || 0,
      unit: form.unit.trim() || "UN",
      quantityAvailable: Number(form.quantityAvailable) || 0,
      requiredDate: form.requiredDate || undefined,
      requestDate: form.requestDate || undefined,
      expectedDeliveryDate: form.expectedDeliveryDate || undefined,
      actualDeliveryDate: form.actualDeliveryDate || undefined,
      status: form.status,
      criticality: form.criticality,
      supplier: form.supplier.trim() || undefined,
      purchaseOrder: form.purchaseOrder.trim() || undefined,
      responsible: form.responsible.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    if (material) {
      updateMaterial(material.id, input);
    } else {
      addMaterial(input);
    }
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-brava-blue-dark/40 backdrop-blur-[1px]"
      />
      <form
        onSubmit={handleSubmit}
        className="relative flex h-full w-full max-w-[560px] flex-col overflow-hidden bg-brava-white shadow-brava-lg"
      >
        <div className="flex items-center justify-between border-b border-brava-border px-6 py-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brava-blue">
              {material ? "Editar Material" : "Cadastrar Material"}
            </p>
            <h2 className="text-[18px] font-bold tracking-tight text-brava-blue-dark">
              {material ? material.description : "Novo Item de Material"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-brava-sm p-1.5 text-brava-text-secondary transition-colors hover:bg-brava-bg hover:text-brava-text"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="brava-scrollbar flex-1 space-y-5 overflow-y-auto px-6 py-6">
          {error && (
            <p className="rounded-brava-sm border border-brava-danger-border bg-brava-danger-bg px-3 py-2 text-[12.5px] font-medium text-brava-danger">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3.5">
            <Field label="TAG / Código do Material" span={1}>
              <input
                value={form.code}
                onChange={(e) => set("code", e.target.value)}
                placeholder="Ex: MAT-CH-001"
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Categoria" span={1}>
              <select
                value={isCustomCategory ? CUSTOM_OPTION : form.category}
                onChange={(e) => {
                  if (e.target.value === CUSTOM_OPTION) {
                    set("category", categoryCustom || "");
                  } else {
                    set("category", e.target.value);
                  }
                }}
                className={INPUT_CLASS}
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value={CUSTOM_OPTION}>+ Nova categoria…</option>
              </select>
              {(isCustomCategory || form.category === CUSTOM_OPTION) && (
                <input
                  value={categoryCustom || form.category}
                  onChange={(e) => {
                    setCategoryCustom(e.target.value);
                    set("category", e.target.value);
                  }}
                  placeholder="Nome da nova categoria"
                  className={cn(INPUT_CLASS, "mt-1.5")}
                />
              )}
            </Field>
          </div>

          <Field label="Descrição do Material *">
            <input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Ex: Feixe tubular para permutador"
              className={INPUT_CLASS}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Equipamento Associado *">
              <select
                value={form.equipmentId}
                onChange={(e) => set("equipmentId", e.target.value)}
                className={INPUT_CLASS}
                required
              >
                <option value="">Selecione…</option>
                {equipment.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.tag}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Unidade de Processo">
              <input
                readOnly
                value={selectedEquipment?.unit ?? "—"}
                className={cn(INPUT_CLASS, "cursor-not-allowed bg-brava-bg text-brava-text-secondary")}
              />
            </Field>
          </div>

          <Field label="Atividade Associada">
            <select
              value={form.activityId}
              onChange={(e) => set("activityId", e.target.value)}
              className={INPUT_CLASS}
              disabled={!selectedEquipment || activityOptions.length === 0}
            >
              <option value="">
                {selectedEquipment
                  ? activityOptions.length
                    ? "Nenhuma (geral do equipamento)"
                    : "Equipamento sem atividades cadastradas"
                  : "Selecione um equipamento primeiro"}
              </option>
              {activityOptions
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </Field>

          <div className="grid grid-cols-3 gap-3.5">
            <Field label="Qtd. Necessária">
              <input
                type="number"
                min={0}
                value={form.quantityRequired}
                onChange={(e) => set("quantityRequired", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Unidade">
              <select
                value={isCustomUnit ? CUSTOM_OPTION : form.unit}
                onChange={(e) => {
                  if (e.target.value === CUSTOM_OPTION) set("unit", unitCustom || "");
                  else set("unit", e.target.value);
                }}
                className={INPUT_CLASS}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
                <option value={CUSTOM_OPTION}>Outra…</option>
              </select>
              {(isCustomUnit || form.unit === CUSTOM_OPTION) && (
                <input
                  value={unitCustom || form.unit}
                  onChange={(e) => {
                    setUnitCustom(e.target.value);
                    set("unit", e.target.value);
                  }}
                  placeholder="Unidade"
                  className={cn(INPUT_CLASS, "mt-1.5")}
                />
              )}
            </Field>
            <Field label="Qtd. Disponível">
              <input
                type="number"
                min={0}
                value={form.quantityAvailable}
                onChange={(e) => set("quantityAvailable", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Data de Necessidade">
              <input
                type="date"
                value={form.requiredDate}
                onChange={(e) => set("requiredDate", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Data da Solicitação">
              <input
                type="date"
                value={form.requestDate}
                onChange={(e) => set("requestDate", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Previsão de Entrega">
              <input
                type="date"
                value={form.expectedDeliveryDate}
                onChange={(e) => set("expectedDeliveryDate", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Data Real de Entrega">
              <input
                type="date"
                value={form.actualDeliveryDate}
                onChange={(e) => set("actualDeliveryDate", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
          </div>

          {previewRisk && (
            <div className="flex items-center gap-2 rounded-brava-sm border border-dashed border-brava-border bg-brava-bg px-3 py-2.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-wide text-brava-text-secondary">
                Risco calculado
              </span>
              <MaterialRiskBadge result={previewRisk} size="sm" />
              {!formatMaterialRiskDetail(previewRisk) && previewRisk.level === "SEM_RISCO" && (
                <span className="text-[11px] text-brava-text-secondary">recalculado ao salvar</span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Status">
              <select value={form.status} onChange={(e) => set("status", e.target.value as MaterialStatus)} className={INPUT_CLASS}>
                {MATERIAL_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {MATERIAL_STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Criticidade">
              <select
                value={form.criticality}
                onChange={(e) => set("criticality", e.target.value as MaterialCriticality)}
                className={INPUT_CLASS}
              >
                {(Object.keys(MATERIAL_CRITICALITY_META) as MaterialCriticality[]).map((c) => (
                  <option key={c} value={c}>
                    {MATERIAL_CRITICALITY_META[c].label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Fornecedor">
              <input value={form.supplier} onChange={(e) => set("supplier", e.target.value)} className={INPUT_CLASS} />
            </Field>
            <Field label="Número do Pedido">
              <input
                value={form.purchaseOrder}
                onChange={(e) => set("purchaseOrder", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
          </div>

          <Field label="Responsável">
            <input
              value={form.responsible}
              onChange={(e) => set("responsible", e.target.value)}
              list="equipment-material-responsible-suggestions"
              placeholder="Ex: Suprimentos"
              className={INPUT_CLASS}
            />
            <datalist id="equipment-material-responsible-suggestions">
              {RESPONSIBLE_SUGGESTIONS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </Field>

          <Field label="Observações">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder='Ex: "Fornecedor confirmou entrega"'
              className={cn(INPUT_CLASS, "resize-none")}
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-brava-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-brava-sm border border-brava-border px-4 py-2 text-[13px] font-semibold text-brava-text-secondary transition-colors hover:bg-brava-bg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-brava-sm bg-brava-blue px-4 py-2 text-[13px] font-semibold text-brava-white transition-colors hover:bg-brava-blue-dark"
          >
            {material ? "Salvar Alterações" : "Cadastrar Material"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  span,
}: {
  label: string;
  children: React.ReactNode;
  span?: number;
}) {
  return (
    <label className={cn("block", span === 1 ? "" : "")}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-brava-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}
