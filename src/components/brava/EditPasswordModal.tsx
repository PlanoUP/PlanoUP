"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";
import { useEditAuth } from "@/lib/brava/editAuthContext";

export default function EditPasswordModal() {
  const { modalOpen, closeModal, unlock, unlockError } = useEditAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!modalOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    const ok = await unlock(password);
    setLoading(false);
    if (ok) setPassword("");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button
        aria-label="Fechar"
        onClick={closeModal}
        className="absolute inset-0 bg-brava-blue-dark/40 backdrop-blur-[1px]"
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-[380px] rounded-brava-lg border border-brava-border bg-brava-white p-6 shadow-brava-lg"
      >
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 rounded-brava-sm p-1 text-brava-text-secondary transition-colors hover:bg-brava-bg hover:text-brava-text"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brava-blue/10">
          <Lock className="h-5 w-5 text-brava-blue" strokeWidth={1.75} />
        </div>
        <h2 className="text-[16px] font-bold tracking-tight text-brava-blue-dark">Modo de Edição</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-brava-text-secondary">
          A visualização é livre para todos. Para criar, editar ou excluir algo, digite a senha compartilhada da
          equipe.
        </p>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="mt-4 w-full rounded-brava-sm border border-brava-border bg-brava-white px-3 py-2 text-[13px] text-brava-text focus:border-brava-blue focus:outline-none focus:ring-1 focus:ring-brava-blue"
        />

        {unlockError && <p className="mt-2 text-[12px] font-medium text-brava-danger">{unlockError}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-4 w-full rounded-brava-sm bg-brava-blue px-4 py-2 text-[13px] font-semibold text-brava-white transition-colors hover:bg-brava-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Verificando…" : "Desbloquear"}
        </button>
      </form>
    </div>
  );
}
