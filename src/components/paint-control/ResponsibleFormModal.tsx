"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Responsible } from "@/types/paint-control";

interface FormState {
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  active: boolean;
}

function emptyForm(): FormState {
  return { name: "", company: "", role: "", email: "", phone: "", active: true };
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-slate-400";

export default function ResponsibleFormModal({
  open,
  onClose,
  responsible,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  responsible?: Responsible | null;
  onSubmit: (payload: Omit<Responsible, "id">) => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm());

  useEffect(() => {
    if (!open) return;
    setForm(
      responsible
        ? {
            name: responsible.name,
            company: responsible.company,
            role: responsible.role,
            email: responsible.email,
            phone: responsible.phone,
            active: responsible.active,
          }
        : emptyForm()
    );
  }, [open, responsible]);

  if (!open) return null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({
      name: form.name.trim(),
      company: form.company.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      active: form.active,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">
            {responsible ? "Editar responsável" : "Novo responsável"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3.5 px-5 py-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Nome<span className="ml-0.5 text-rose-500">*</span>
            </span>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Empresa</span>
            <input
              className={inputClass}
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Função</span>
            <input
              className={inputClass}
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-600">E-mail</span>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-600">Telefone</span>
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </label>
          </div>
          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-0"
            />
            <span className="text-sm font-medium text-slate-700">Responsável ativo</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-slate-900 hover:bg-accent-hover"
          >
            {responsible ? "Salvar alterações" : "Cadastrar responsável"}
          </button>
        </div>
      </form>
    </div>
  );
}
