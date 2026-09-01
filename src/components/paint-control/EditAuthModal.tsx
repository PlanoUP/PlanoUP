"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";
import { useAuthStore } from "@/lib/paint-control/authStore";

export default function EditAuthModal() {
  const open = useAuthStore((s) => s.authModalOpen);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const signIn = useAuthStore((s) => s.signIn);

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn(password);
    setSubmitting(false);
    if (result) {
      setError(result);
    } else {
      setPassword("");
    }
  }

  function handleClose() {
    setPassword("");
    setError(null);
    closeAuthModal();
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 px-4"
      onClick={handleClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Entrar no modo de edição</p>
              <p className="text-xs text-slate-500">Digite a senha para cadastrar, editar ou excluir.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-600">Senha</span>
          <input
            type="password"
            autoFocus
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-slate-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !password}
            className="rounded-md bg-accent px-3.5 py-2 text-sm font-bold text-slate-900 hover:bg-accent-hover disabled:opacity-50"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
