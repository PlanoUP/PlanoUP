"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ActivityStatus, Priority, Responsible, RevitalizationItem } from "@/types/paint-control";
import { ACTIVITY_STATUSES, PRIORITIES } from "@/types/paint-control";
import { PRIORITY_LABELS } from "@/lib/paint-control/constants";
import type { NewRevitalizationInput } from "@/lib/paint-control/store";

interface FormState {
  area: string;
  title: string;
  description: string;

  priority: Priority;
  responsibleId: string;
  estimatedAreaM2: string;
  requestDate: string;
  neededDate: string;
  programmedDate: string;
  actualStartDate: string;
  expectedEndDate: string;
  actualEndDate: string;

  surfaceType: string;
  surfacePreparation: string;
  paintSystem: string;
  primer: string;
  intermediateCoat: string;
  finishCoat: string;
  coatsCount: string;
  technicalNotes: string;

  status: ActivityStatus;
  progress: string;
  impediment: string;
  generalNotes: string;
  workOrder: string;
  note: string;
  reference: string;
}

function emptyForm(): FormState {
  return {
    area: "",
    title: "",
    description: "",
    priority: "P3",
    responsibleId: "",
    estimatedAreaM2: "",
    requestDate: "",
    neededDate: "",
    programmedDate: "",
    actualStartDate: "",
    expectedEndDate: "",
    actualEndDate: "",
    surfaceType: "",
    surfacePreparation: "",
    paintSystem: "",
    primer: "",
    intermediateCoat: "",
    finishCoat: "",
    coatsCount: "",
    technicalNotes: "",
    status: "Backlog",
    progress: "0",
    impediment: "",
    generalNotes: "",
    workOrder: "",
    note: "",
    reference: "",
  };
}

function itemToForm(item: RevitalizationItem): FormState {
  return {
    area: item.area,
    title: item.title,
    description: item.description,
    priority: item.priority,
    responsibleId: item.responsibleId ?? "",
    estimatedAreaM2: item.estimatedAreaM2 !== null ? String(item.estimatedAreaM2) : "",
    requestDate: item.requestDate ?? "",
    neededDate: item.neededDate ?? "",
    programmedDate: item.programmedDate ?? "",
    actualStartDate: item.actualStartDate ?? "",
    expectedEndDate: item.expectedEndDate ?? "",
    actualEndDate: item.actualEndDate ?? "",
    surfaceType: item.surfaceType,
    surfacePreparation: item.surfacePreparation,
    paintSystem: item.paintSystem,
    primer: item.primer,
    intermediateCoat: item.intermediateCoat,
    finishCoat: item.finishCoat,
    coatsCount: item.coatsCount !== null ? String(item.coatsCount) : "",
    technicalNotes: item.technicalNotes,
    status: item.status,
    progress: String(item.progress),
    impediment: item.impediment,
    generalNotes: item.generalNotes,
    workOrder: item.workOrder,
    note: item.note,
    reference: item.reference,
  };
}

function formToPayload(form: FormState): NewRevitalizationInput {
  return {
    area: form.area.trim(),
    title: form.title.trim(),
    description: form.description.trim(),
    priority: form.priority,
    responsibleId: form.responsibleId || null,
    estimatedAreaM2: form.estimatedAreaM2 ? Number(form.estimatedAreaM2) : null,
    requestDate: form.requestDate || null,
    neededDate: form.neededDate || null,
    programmedDate: form.programmedDate || null,
    actualStartDate: form.actualStartDate || null,
    expectedEndDate: form.expectedEndDate || null,
    actualEndDate: form.actualEndDate || null,
    surfaceType: form.surfaceType.trim(),
    surfacePreparation: form.surfacePreparation.trim(),
    paintSystem: form.paintSystem.trim(),
    primer: form.primer.trim(),
    intermediateCoat: form.intermediateCoat.trim(),
    finishCoat: form.finishCoat.trim(),
    coatsCount: form.coatsCount ? Number(form.coatsCount) : null,
    technicalNotes: form.technicalNotes.trim(),
    status: form.status,
    progress: Math.max(0, Math.min(100, Number(form.progress) || 0)),
    impediment: form.impediment.trim(),
    generalNotes: form.generalNotes.trim(),
    workOrder: form.workOrder.trim(),
    note: form.note.trim(),
    reference: form.reference.trim(),
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

export default function RevitalizationFormPanel({
  open,
  onClose,
  item,
  responsibles,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  item?: RevitalizationItem | null;
  responsibles: Responsible[];
  onSubmit: (payload: NewRevitalizationInput) => void;
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.area.trim() || !form.title.trim()) return;
    onSubmit(formToPayload(form));
    onClose();
  }

  const activeResponsibles = responsibles.filter((r) => r.active || r.id === form.responsibleId);

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-slate-900/40" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {isEditing ? "Editar item de revitalização" : "Novo item de revitalização"}
            </p>
            <h2 className="text-base font-bold text-slate-900">
              {isEditing ? item?.title || item?.area : "Cadastro de Revitalização"}
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
            <Field label="Área / Instalação" required>
              <input
                className={inputClass}
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
                placeholder="Ex.: Pátio de Sucata"
                required
              />
            </Field>
            <Field label="Título do Serviço" required>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Ex.: Revitalização de Pintura — Pátio de Sucata"
                required
              />
            </Field>
            <Field label="Descrição detalhada" full>
              <textarea
                className={`${inputClass} min-h-[80px] resize-y`}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Planejamento">
            <Field label="Prioridade" required>
              <select
                className={inputClass}
                value={form.priority}
                onChange={(e) => update("priority", e.target.value as Priority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Responsável">
              <select
                className={inputClass}
                value={form.responsibleId}
                onChange={(e) => update("responsibleId", e.target.value)}
              >
                <option value="">Sem responsável definido</option>
                {activeResponsibles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.role}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Área estimada (m²)">
              <input
                type="number"
                min={0}
                step="0.1"
                className={inputClass}
                value={form.estimatedAreaM2}
                onChange={(e) => update("estimatedAreaM2", e.target.value)}
              />
            </Field>
            <Field label="Data de solicitação">
              <input
                type="date"
                className={inputClass}
                value={form.requestDate}
                onChange={(e) => update("requestDate", e.target.value)}
              />
            </Field>
            <Field label="Data necessária">
              <input
                type="date"
                className={inputClass}
                value={form.neededDate}
                onChange={(e) => update("neededDate", e.target.value)}
              />
            </Field>
            <Field label="Data programada">
              <input
                type="date"
                className={inputClass}
                value={form.programmedDate}
                onChange={(e) => update("programmedDate", e.target.value)}
              />
            </Field>
            <Field label="Data de início real">
              <input
                type="date"
                className={inputClass}
                value={form.actualStartDate}
                onChange={(e) => update("actualStartDate", e.target.value)}
              />
            </Field>
            <Field label="Data prevista de término">
              <input
                type="date"
                className={inputClass}
                value={form.expectedEndDate}
                onChange={(e) => update("expectedEndDate", e.target.value)}
              />
            </Field>
            <Field label="Data real de término">
              <input
                type="date"
                className={inputClass}
                value={form.actualEndDate}
                onChange={(e) => update("actualEndDate", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Pintura">
            <Field label="Tipo de superfície">
              <input
                className={inputClass}
                value={form.surfaceType}
                onChange={(e) => update("surfaceType", e.target.value)}
              />
            </Field>
            <Field label="Preparação de superfície">
              <input
                className={inputClass}
                value={form.surfacePreparation}
                onChange={(e) => update("surfacePreparation", e.target.value)}
              />
            </Field>
            <Field label="Sistema de pintura / especificação" full>
              <input
                className={inputClass}
                value={form.paintSystem}
                onChange={(e) => update("paintSystem", e.target.value)}
              />
            </Field>
            <Field label="Primer">
              <input
                className={inputClass}
                value={form.primer}
                onChange={(e) => update("primer", e.target.value)}
              />
            </Field>
            <Field label="Tinta intermediária">
              <input
                className={inputClass}
                value={form.intermediateCoat}
                onChange={(e) => update("intermediateCoat", e.target.value)}
              />
            </Field>
            <Field label="Acabamento">
              <input
                className={inputClass}
                value={form.finishCoat}
                onChange={(e) => update("finishCoat", e.target.value)}
              />
            </Field>
            <Field label="Quantidade de demãos">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.coatsCount}
                onChange={(e) => update("coatsCount", e.target.value)}
              />
            </Field>
            <Field label="Observações técnicas" full>
              <textarea
                className={`${inputClass} min-h-[70px] resize-y`}
                value={form.technicalNotes}
                onChange={(e) => update("technicalNotes", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Controle">
            <Field label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => update("status", e.target.value as ActivityStatus)}
              >
                {ACTIVITY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Avanço (%)">
              <input
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={form.progress}
                onChange={(e) => update("progress", e.target.value)}
              />
            </Field>
            <Field label="OS">
              <input
                className={inputClass}
                value={form.workOrder}
                onChange={(e) => update("workOrder", e.target.value)}
              />
            </Field>
            <Field label="Nota">
              <input
                className={inputClass}
                value={form.note}
                onChange={(e) => update("note", e.target.value)}
              />
            </Field>
            <Field label="Referência" full>
              <input
                className={inputClass}
                value={form.reference}
                onChange={(e) => update("reference", e.target.value)}
              />
            </Field>
            <Field label="Impedimento" full>
              <input
                className={inputClass}
                value={form.impediment}
                onChange={(e) => update("impediment", e.target.value)}
              />
            </Field>
            <Field label="Observações gerais" full>
              <textarea
                className={`${inputClass} min-h-[70px] resize-y`}
                value={form.generalNotes}
                onChange={(e) => update("generalNotes", e.target.value)}
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
