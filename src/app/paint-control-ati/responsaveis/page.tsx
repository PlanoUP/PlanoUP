"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { isOverdue } from "@/lib/paint-control/calculations";
import type { Responsible } from "@/types/paint-control";
import PageHeader from "@/components/paint-control/PageHeader";
import SearchInput from "@/components/paint-control/SearchInput";
import EmptyState from "@/components/paint-control/EmptyState";
import ConfirmDialog from "@/components/paint-control/ConfirmDialog";
import ResponsibleFormModal from "@/components/paint-control/ResponsibleFormModal";
import { Users } from "lucide-react";

export default function ResponsaveisPage() {
  const responsibles = usePaintControlStore((s) => s.responsibles);
  const activities = usePaintControlStore((s) => s.activities);
  const addResponsible = usePaintControlStore((s) => s.addResponsible);
  const updateResponsible = usePaintControlStore((s) => s.updateResponsible);
  const deleteResponsible = usePaintControlStore((s) => s.deleteResponsible);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Responsible | null>(null);
  const [deleting, setDeleting] = useState<Responsible | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return responsibles
      .filter((r) => !q || `${r.name} ${r.company} ${r.role}`.toLowerCase().includes(q))
      .map((r) => {
        const own = activities.filter((a) => a.responsibleId === r.id);
        const open = own.filter((a) => a.status !== "Concluído" && a.status !== "Cancelado");
        return {
          responsible: r,
          open: open.length,
          executing: own.filter((a) => a.status === "Em Execução").length,
          overdue: own.filter((a) => isOverdue(a)).length,
          completed: own.filter((a) => a.status === "Concluído").length,
        };
      });
  }, [responsibles, activities, search]);

  function handleSubmit(payload: Omit<Responsible, "id">) {
    if (editing) {
      updateResponsible(editing.id, payload);
    } else {
      addResponsible(payload);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="ATI Guamaré"
        title="Responsáveis"
        description="Pessoas e empresas envolvidas na execução dos serviços de pintura."
        actions={
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Novo Responsável
          </button>
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar responsável..." className="max-w-xs" />

      {rows.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum responsável encontrado" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5">Nome</th>
                <th className="px-3 py-2.5">Contato</th>
                <th className="px-3 py-2.5">Atividades abertas</th>
                <th className="px-3 py-2.5">Em execução</th>
                <th className="px-3 py-2.5">Atrasadas</th>
                <th className="px-3 py-2.5">Concluídas</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ responsible, open, executing, overdue, completed }) => (
                <tr key={responsible.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                  <td className="px-3 py-3 align-top">
                    <p className="font-semibold text-slate-900">{responsible.name}</p>
                    <p className="text-xs text-slate-500">
                      {responsible.company}
                      {responsible.role ? ` · ${responsible.role}` : ""}
                    </p>
                  </td>
                  <td className="px-3 py-3 align-top text-xs text-slate-500">
                    {responsible.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> {responsible.email}
                      </p>
                    )}
                    {responsible.phone && (
                      <p className="mt-0.5 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {responsible.phone}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-3 align-top font-semibold text-slate-800">{open}</td>
                  <td className="px-3 py-3 align-top text-slate-600">{executing}</td>
                  <td className="px-3 py-3 align-top">
                    <span className={overdue > 0 ? "font-semibold text-rose-600" : "text-slate-600"}>
                      {overdue}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top text-slate-600">{completed}</td>
                  <td className="px-3 py-3 align-top">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${
                        responsible.active
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-500"
                      }`}
                    >
                      {responsible.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(responsible);
                          setFormOpen(true);
                        }}
                        title="Editar"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(responsible)}
                        title="Excluir"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ResponsibleFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        responsible={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir responsável?"
        description={
          deleting
            ? `${deleting.name} será removido. Serviços associados ficarão sem responsável definido.`
            : undefined
        }
        confirmLabel="Excluir"
        danger
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteResponsible(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
