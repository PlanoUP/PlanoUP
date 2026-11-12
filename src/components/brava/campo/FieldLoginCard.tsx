"use client";

import { useState } from "react";
import { LogIn, LogOut, UserCircle2 } from "lucide-react";
import { useFieldAuth } from "@/lib/brava/fieldAuthContext";

export default function FieldLoginCard() {
  const { fieldUser, loading, login, logout } = useFieldAuth();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;

  if (fieldUser) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-brava-lg border border-brava-blue/25 bg-brava-blue/5 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <UserCircle2 className="h-5 w-5 shrink-0 text-brava-blue" />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-bold text-brava-blue-dark">{fieldUser.name}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brava-blue">Fiscal</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-brava-sm border border-brava-border bg-brava-white px-2.5 py-1.5 text-[12px] font-semibold text-brava-text-secondary active:bg-brava-bg"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const message = await login(username, password);
    setSubmitting(false);
    if (message) {
      setError(message);
    } else {
      setOpen(false);
      setUsername("");
      setPassword("");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-brava-lg border border-dashed border-brava-border bg-brava-white py-3 text-[13px] font-semibold text-brava-text-secondary active:bg-brava-bg"
      >
        <LogIn className="h-4 w-4" />
        Entrar como Fiscal
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 rounded-brava-lg border border-brava-border bg-brava-white p-4 shadow-brava-sm">
      <p className="text-[13px] font-bold text-brava-text">Entrar como Fiscal</p>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Usuário"
        autoFocus
        required
        className="rounded-brava-sm border border-brava-border px-3 py-2.5 text-[14px] focus:border-brava-blue focus:outline-none"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Senha"
        required
        className="rounded-brava-sm border border-brava-border px-3 py-2.5 text-[14px] focus:border-brava-blue focus:outline-none"
      />
      {error && <p className="text-[12px] font-semibold text-brava-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-brava-sm border border-brava-border py-2.5 text-[13px] font-semibold text-brava-text-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-brava-sm bg-brava-blue py-2.5 text-[13px] font-bold text-brava-white disabled:opacity-60"
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </form>
  );
}
