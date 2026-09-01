"use client";

import { useEffect, useState } from "react";
import { X, RefreshCw } from "lucide-react";
import type { CostCategory, CostItem } from "@/types/paint-control";
import { COST_CATEGORIES } from "@/types/paint-control";
import type { NewCostItemInput } from "@/lib/paint-control/store";

interface FormState {
  category: CostCategory;
  name: string;
  regime: string;
  quantity: string;
  hourlyRate: string;
  hoursPerDay: string;
  daysPerYear: string;
  plannedMonthlyCost: string;
  plannedAnnualCost: string;
  actualMonthlyCost: string;
  actualAnnualCost: string;
  notes: string;
}

function emptyForm(): FormState {
  return {
    category: "Mão de Obra",
    name: "",
    regime: "",
    quantity: "1",
    hourlyRate: "",
    hoursPerDay: "",
    daysPerYear: "",
    plannedMonthlyCost: "0",
    plannedAnnualCost: "0",
    actualMonthlyCost: "",
    actualAnnualCost: "",
    notes: "",
  };
}

function itemToForm(item: CostItem): FormState {
  return {
    category: item.category,
    name: item.name,
    regime: item.regime,
    quantity: String(item.quantity),
    hourlyRate: item.hourlyRate !== null ? String(item.hourlyRate) : "",
    hoursPerDay: item.hoursPerDay !== null ? String(item.hoursPerDay) : "",
    daysPerYear: item.daysPerYear !== null ? String(item.daysPerYear) : "",
    plannedMonthlyCost: String(item.plannedMonthlyCost),
    plannedAnnualCost: String(item.plannedAnnualCost),
    actualMonthlyCost: item.actualMonthlyCost !== null ? String(item.actualMonthlyCost) : "",
    actualAnnualCost: item.actualAnnualCost !== null ? String(item.actualAnnualCost) : "",
    notes: item.notes,
  };
}

function formToPayload(form: FormState): NewCostItemInput {
  return {
    category: form.category,
    name: form.name.trim(),
    regime: form.regime.trim(),
    quantity: Number(form.quantity) || 0,
    hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
    hoursPerDay: form.hoursPerDay ? Number(form.hoursPerDay) : null,
    daysPerYear: form.daysPerYear ? Number(form.daysPerYear) : null,
    plannedMonthlyCost: Number(form.plannedMonthlyCost) || 0,
    plannedAnnualCost: Number(form.plannedAnnualCost) || 0,
    actualMonthlyCost: form.actualMonthlyCost ? Number(form.actualMonthlyCost) : null,
    actualAnnualCost: form.actualAnnualCost ? Number(form.actualAnnualCost) : null,
    notes: form.notes.trim(),
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-100 px-5 py-5 first:border-t-0">
      <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wide text-slate-400">{title}</h3>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-slate-400";

export default function CostFormPanel({
  open,
  onClose,
  item,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  item?: CostItem | null;
  onSubmit: (payload: NewCostItemInput) => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const isEditing = Boolean(item);

  useEffect(() => {
    if (!open) return;
    setForm(item ? itemToForm(item) : emptyForm());
  }, [open, item]);

  if (!open) return null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function recalcPlanned() {
    const rate = Number(form.hourlyRate) || 0;
    const hours = Number(form.hoursPerDay) || 0;
    const days = Number(form.daysPerYear) || 0;
    const annual = Math.round(rate * hours * days * 100) / 100;
    const monthly = Math.round((annual / 12) * 100) / 100;
    setForm((prev) => ({
      ...prev,
      plannedAnnualCost: String(annual),
      plannedMonthlyCost: String(monthly),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(formToPayload(form));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-slate-900/40" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {isEditing ? "Editar item de custo" : "Novo item de custo"}
            </p>
            <h2 className="text-base font-bold text-slate-900">
              {isEditing ? item?.name : "Cadastro de Custo"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <Section title="Identificação">
            <Field label="Categoria" required>
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => update("category", e.target.value as CostCategory)}
              >
                {COST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Item / Cargo" required>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Ex.: Pintor, Gerador..."
                required
              />
            </Field>
            <Field label="Regime">
              <input
                className={inputClass}
                value={form.regime}
                onChange={(e) => update("regime", e.target.value)}
                placeholder="Ex.: Mensalista, Locação, Objeto Contratado..."
              />
            </Field>
            <Field label="Quantidade">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Previsto">
            <Field label="Valor / Hora (equipe)">
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.hourlyRate}
                onChange={(e) => update("hourlyRate", e.target.value)}
                placeholder="Só para Mão de Obra"
              />
            </Field>
            <Field label="Horas / Dia">
              <input
                type="number"
                min={0}
                step="0.5"
                className={inputClass}
                value={form.hoursPerDay}
                onChange={(e) => update("hoursPerDay", e.target.value)}
              />
            </Field>
            <Field label="Dias / Ano">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.daysPerYear}
                onChange={(e) => update("daysPerYear", e.target.value)}
              />
            </Field>
            <Field label=" ">
              <button
                type="button"
                onClick={recalcPlanned}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Recalcular previsto
              </button>
            </Field>
            <Field label="Custo Mensal Previsto" required>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.plannedMonthlyCost}
                onChange={(e) => update("plannedMonthlyCost", e.target.value)}
              />
            </Field>
            <Field label="Custo Anual Previsto" required>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.plannedAnnualCost}
                onChange={(e) => update("plannedAnnualCost", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Realizado">
            <Field label="Custo Mensal Realizado">
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.actualMonthlyCost}
                onChange={(e) => update("actualMonthlyCost", e.target.value)}
                placeholder="Preencher conforme apuração"
              />
            </Field>
            <Field label="Custo Anual Realizado">
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.actualAnnualCost}
                onChange={(e) => update("actualAnnualCost", e.target.value)}
                placeholder="Preencher conforme apuração"
              />
            </Field>
            <Field label="Observações" full>
              <textarea
                className={`${inputClass} min-h-[70px] resize-y`}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </Field>
          </Section>
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            onClick={onClose}
            type="button"
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-slate-900 hover:bg-accent-hover"
          >
            {isEditing ? "Salvar alterações" : "Cadastrar item"}
          </button>
        </div>
      </div>
    </div>
  );
}
