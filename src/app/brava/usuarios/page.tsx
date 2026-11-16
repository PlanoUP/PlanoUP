"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, UserPlus, KeyRound, Power, Boxes, Check } from "lucide-react";
import PageHeader from "@/components/brava/PageHeader";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import { useBravaData } from "@/lib/brava/context";
import { cn } from "@/lib/brava/cn";
import { formatShort } from "@/lib/brava/date-utils";

interface FieldUserPublic {
  id: string;
  name: string;
  username: string;
  active: boolean;
  allocatedTags: string[];
  createdAt: string;
  updatedAt: string;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || "Falha ao comunicar com o servidor.";
  } catch {
    return "Falha ao comunicar com o servidor.";
  }
}

function TagMultiSelect({
  allTags,
  selected,
  onToggle,
}: {
  allTags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
}) {
  return (
    <div className="grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto rounded-brava-sm border border-brava-border p-2.5 sm:grid-cols-3">
      {allTags.map((tag) => {
        const checked = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={cn(
              "flex items-center gap-1.5 rounded-brava-sm border px-2 py-1.5 font-mono text-[12px] font-semibold transition-colors",
              checked
                ? "border-brava-blue bg-brava-blue text-brava-white"
                : "border-brava-border bg-brava-white text-brava-text-secondary"
            )}
          >
            {checked && <Check className="h-3 w-3 shrink-0" />}
            <span className="truncate">{tag}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function UsuariosPage() {
  const { isEditor, requireEditor } = useEditAuth();
  const { tanks } = useBravaData();
  const allTags = useMemo(() => tanks.map((t) => t.tag).sort(), [tanks]);

  const [users, setUsers] = useState<FieldUserPublic[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newAllocatedTags, setNewAllocatedTags] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingAllocationId, setEditingAllocationId] = useState<string | null>(null);
  const [allocationDraft, setAllocationDraft] = useState<string[]>([]);
  const [savingAllocation, setSavingAllocation] = useState(false);

  function fetchUsers() {
    fetch("/api/field-users", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(await parseErrorMessage(res));
        const body = await res.json();
        setUsers(body.users);
        setStatus("ready");
        setErrorMessage(null);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Falha ao carregar.");
      });
  }

  useEffect(() => {
    if (isEditor) fetchUsers();
  }, [isEditor]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!requireEditor()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/field-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password, allocatedTags: newAllocatedTags }),
      });
      if (!res.ok) throw new Error(await parseErrorMessage(res));
      setName("");
      setUsername("");
      setPassword("");
      setNewAllocatedTags([]);
      fetchUsers();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Falha ao cadastrar.");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(user: FieldUserPublic) {
    if (!requireEditor()) return;
    await fetch(`/api/field-users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    fetchUsers();
  }

  async function handleResetPassword(user: FieldUserPublic) {
    if (!requireEditor()) return;
    const newPassword = window.prompt(`Nova senha para ${user.name} (mín. 4 caracteres):`);
    if (!newPassword) return;
    const res = await fetch(`/api/field-users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    window.alert(res.ok ? "Senha redefinida." : "Falha ao redefinir a senha.");
  }

  function openAllocationEditor(user: FieldUserPublic) {
    if (!requireEditor()) return;
    setEditingAllocationId(user.id);
    setAllocationDraft(user.allocatedTags);
  }

  async function handleSaveAllocation(userId: string) {
    if (!requireEditor()) return;
    setSavingAllocation(true);
    try {
      await fetch(`/api/field-users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocatedTags: allocationDraft }),
      });
      setEditingAllocationId(null);
      fetchUsers();
    } finally {
      setSavingAllocation(false);
    }
  }

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Visão Geral", href: "/brava" }, { label: "Usuários" }]}
        title="Usuários de Campo"
        subtitle="Contas de Fiscal para registrar avanço, fotos e observações direto do campo"
      />
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        {!isEditor ? (
          <button
            type="button"
            onClick={() => requireEditor()}
            className="flex w-full max-w-md items-center justify-center gap-2 rounded-brava-lg border border-dashed border-brava-border bg-brava-white py-6 text-[13.5px] font-semibold text-brava-text-secondary"
          >
            <Lock className="h-4 w-4" />
            Desbloqueie o modo de edição para gerenciar usuários
          </button>
        ) : (
          <div className="flex flex-col gap-6">
            <form
              onSubmit={handleCreate}
              className="flex flex-col gap-4 rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-brava-text-secondary">Nome</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Nome completo"
                    className="rounded-brava-sm border border-brava-border px-3 py-2 text-[13.5px] focus:border-brava-blue focus:outline-none"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-brava-text-secondary">Usuário</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="ex: joao.silva"
                    className="rounded-brava-sm border border-brava-border px-3 py-2 text-[13.5px] focus:border-brava-blue focus:outline-none"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-brava-text-secondary">Senha</span>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type="password"
                    minLength={4}
                    placeholder="mín. 4 caracteres"
                    className="rounded-brava-sm border border-brava-border px-3 py-2 text-[13.5px] focus:border-brava-blue focus:outline-none"
                  />
                </label>
              </div>

              <div>
                <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brava-text-secondary">
                  <Boxes className="h-3.5 w-3.5" />
                  Equipamentos/tanques alocados
                </span>
                {allTags.length === 0 ? (
                  <p className="text-[12.5px] italic text-brava-text-secondary">Nenhum tanque cadastrado ainda.</p>
                ) : (
                  <TagMultiSelect
                    allTags={allTags}
                    selected={newAllocatedTags}
                    onToggle={(tag) =>
                      setNewAllocatedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                    }
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center justify-center gap-1.5 self-start rounded-brava-sm bg-brava-blue px-4 py-2 text-[13px] font-bold text-brava-white disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                {creating ? "Cadastrando..." : "Cadastrar"}
              </button>
            </form>
            {createError && <p className="text-[12.5px] font-semibold text-brava-danger">{createError}</p>}

            <div className="rounded-brava-lg border border-brava-border bg-brava-white shadow-brava-sm">
              {status === "loading" && <p className="p-5 text-[13px] text-brava-text-secondary">Carregando...</p>}
              {status === "error" && <p className="p-5 text-[13px] text-brava-danger">{errorMessage}</p>}
              {status === "ready" && users.length === 0 && (
                <p className="p-5 text-[13px] italic text-brava-text-secondary">Nenhum Fiscal cadastrado ainda.</p>
              )}
              {status === "ready" && users.length > 0 && (
                <div className="divide-y divide-brava-border">
                  {users.map((u) => (
                    <div key={u.id} className="flex flex-col gap-3 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-semibold text-brava-text">{u.name}</p>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase",
                                u.active ? "bg-brava-success-bg text-brava-success" : "bg-brava-bg text-brava-text-secondary"
                              )}
                            >
                              {u.active ? "Ativo" : "Desativado"}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[12px] text-brava-text-secondary">
                            @{u.username} · desde {formatShort(u.createdAt.slice(0, 10))}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleResetPassword(u)}
                            className="inline-flex items-center gap-1.5 rounded-brava-sm border border-brava-border px-2.5 py-1.5 text-[12px] font-semibold text-brava-text-secondary hover:border-brava-blue/40 hover:text-brava-blue-dark"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            Redefinir senha
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(u)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-brava-sm border px-2.5 py-1.5 text-[12px] font-semibold",
                              u.active
                                ? "border-brava-danger-border text-brava-danger hover:bg-brava-danger-bg"
                                : "border-brava-success-border text-brava-success hover:bg-brava-success-bg"
                            )}
                          >
                            <Power className="h-3.5 w-3.5" />
                            {u.active ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </div>

                      {editingAllocationId === u.id ? (
                        <div className="rounded-brava-sm border border-brava-blue/25 bg-brava-blue/5 p-3">
                          <TagMultiSelect
                            allTags={allTags}
                            selected={allocationDraft}
                            onToggle={(tag) =>
                              setAllocationDraft((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                            }
                          />
                          <div className="mt-2.5 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingAllocationId(null)}
                              className="flex-1 rounded-brava-sm border border-brava-border py-2 text-[12.5px] font-semibold text-brava-text-secondary"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveAllocation(u.id)}
                              disabled={savingAllocation}
                              className="flex-1 rounded-brava-sm bg-brava-blue py-2 text-[12.5px] font-bold text-brava-white disabled:opacity-60"
                            >
                              {savingAllocation ? "Salvando..." : "Salvar alocação"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Boxes className="h-3.5 w-3.5 shrink-0 text-brava-text-secondary" />
                          {u.allocatedTags.length === 0 ? (
                            <span className="text-[12px] italic text-brava-text-secondary">Nenhum equipamento alocado</span>
                          ) : (
                            u.allocatedTags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-brava-border px-2 py-0.5 font-mono text-[11px] font-semibold text-brava-text-secondary"
                              >
                                {tag}
                              </span>
                            ))
                          )}
                          <button
                            type="button"
                            onClick={() => openAllocationEditor(u)}
                            className="ml-1 text-[11.5px] font-bold text-brava-blue"
                          >
                            Editar alocação
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
