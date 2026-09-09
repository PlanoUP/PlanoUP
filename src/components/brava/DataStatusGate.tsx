"use client";

import { AlertTriangle } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";

/**
 * Gates the whole /brava tree on the initial tank fetch — data now lives in
 * a shared Postgres database (see src/lib/db/) rather than per-browser
 * localStorage, so every user needs a real response (or a clear error)
 * before seeing a dashboard that would otherwise look confusingly empty.
 * Subsequent poll failures don't re-trigger this screen — see
 * BravaDataProvider's hasLoadedOnce guard.
 */
export default function DataStatusGate({ children }: { children: React.ReactNode }) {
  const { status, errorMessage } = useBravaData();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-brava-bg px-8 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brava-border border-t-brava-blue" />
        <p className="text-[13px] font-medium text-brava-text-secondary">Carregando dados do sistema…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-brava-bg px-8 text-center">
        <AlertTriangle className="h-8 w-8 text-brava-danger" strokeWidth={1.5} />
        <p className="text-[15px] font-semibold text-brava-text">Não foi possível carregar os dados</p>
        <p className="max-w-md text-[13px] text-brava-text-secondary">
          {errorMessage ?? "Verifique a conexão com o banco de dados."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
