"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, CloudUpload } from "lucide-react";
import { useOfflineQueueForTank } from "@/lib/brava/field/useOfflineQueue";
import { flushOfflineQueue } from "@/lib/brava/field/offlineSync";

const KIND_LABEL: Record<string, string> = {
  "field-entry": "registro de atividade",
  "daily-log": "PT/Efetivo",
  "action-plan": "plano de ação",
};

export default function OfflineStatusBar({ tankId }: { tankId: string }) {
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const pending = useOfflineQueueForTank(tankId);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online && pending.length === 0) return null;

  async function handleSyncNow() {
    setSyncing(true);
    await flushOfflineQueue();
    setSyncing(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-brava-lg border border-brava-warning-border bg-brava-warning-bg px-4 py-3">
      {!online ? (
        <>
          <WifiOff className="h-4 w-4 shrink-0 text-brava-warning" />
          <p className="min-w-0 flex-1 text-[12.5px] font-semibold text-brava-warning">
            Sem conexão — seus registros ficam salvos no aparelho e enviam sozinhos quando a internet voltar.
          </p>
        </>
      ) : (
        <>
          <CloudUpload className="h-4 w-4 shrink-0 text-brava-warning" />
          <p className="min-w-0 flex-1 text-[12.5px] font-semibold text-brava-warning">
            {pending.length} {pending.length === 1 ? "registro pendente" : "registros pendentes"} de envio
            {pending[0] ? ` (${KIND_LABEL[pending[0].kind] ?? "registro"}${pending.length > 1 ? "..." : ""})` : ""}
          </p>
          <button
            type="button"
            onClick={handleSyncNow}
            disabled={syncing}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-brava-sm border border-brava-warning-border bg-brava-white px-2.5 py-1.5 text-[12px] font-bold text-brava-warning disabled:opacity-60"
          >
            <RefreshCw className={syncing ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
            {syncing ? "Enviando..." : "Enviar agora"}
          </button>
        </>
      )}
    </div>
  );
}
