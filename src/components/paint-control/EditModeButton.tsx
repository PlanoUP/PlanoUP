"use client";

import { Lock, Unlock } from "lucide-react";
import { useAuthStore } from "@/lib/paint-control/authStore";
import { isSupabaseConfigured } from "@/lib/paint-control/supabaseClient";

export default function EditModeButton({ collapsed }: { collapsed: boolean }) {
  const isEditor = useAuthStore((s) => s.isEditor);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const signOut = useAuthStore((s) => s.signOut);

  // Local-only mode has no shared backend to protect — nothing to gate.
  if (!isSupabaseConfigured) return null;

  return (
    <button
      onClick={isEditor ? signOut : openAuthModal}
      title={collapsed ? (isEditor ? "Sair do modo de edição" : "Entrar no modo de edição") : undefined}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
        isEditor
          ? "text-emerald-600 hover:bg-emerald-50"
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {isEditor ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
      {!collapsed && (isEditor ? "Modo de edição" : "Somente visualização")}
    </button>
  );
}
