"use client";

import { useState } from "react";
import { RotateCcw, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { usePaintControlStore } from "@/lib/paint-control/store";
import { isSupabaseConfigured } from "@/lib/paint-control/supabaseClient";
import PageHeader from "@/components/paint-control/PageHeader";
import ConfirmDialog from "@/components/paint-control/ConfirmDialog";
import type { UserRole } from "@/types/paint-control";

const ROLES: { role: UserRole; description: string }[] = [
  { role: "ADMIN", description: "Pode fazer tudo: cadastrar, editar, priorizar, programar, excluir e configurar o sistema." },
  { role: "GESTOR", description: "Pode cadastrar, editar, priorizar, programar e visualizar todos os serviços." },
  { role: "EXECUTOR", description: "Pode atualizar avanço, status, fotos e observações das atividades associadas a ele." },
  { role: "VISUALIZACAO", description: "Acesso somente de consulta, sem permissão de edição." },
];

export default function ConfiguracoesPage() {
  const units = usePaintControlStore((s) => s.units);
  const activities = usePaintControlStore((s) => s.activities);
  const responsibles = usePaintControlStore((s) => s.responsibles);
  const resetToSeedData = usePaintControlStore((s) => s.resetToSeedData);
  const isLive = usePaintControlStore((s) => s.isLive);

  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="ATI Guamaré"
        title="Configurações"
        description="Preferências do sistema e preparação para integração futura."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Armazenamento de Dados</h2>
          {isSupabaseConfigured ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                isLive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <Wifi className="h-3.5 w-3.5" />
              {isLive ? "Sincronizado em tempo real" : "Conectando..."}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
              <WifiOff className="h-3.5 w-3.5" />
              Modo local
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {isSupabaseConfigured
            ? "Os dados ficam em um banco Supabase compartilhado: qualquer alteração feita por um gestor aparece em tempo real para todas as pessoas com o link."
            : "Nesta etapa, os dados do PAINT CONTROL ATI são armazenados localmente no navegador (localStorage) — cada pessoa vê só as próprias alterações. Conecte um projeto Supabase (variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY) para compartilhar os dados entre todos."}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:max-w-md">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-center">
            <p className="text-lg font-bold text-slate-900">{units.length}</p>
            <p className="text-[11px] font-medium text-slate-400">Unidades</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-center">
            <p className="text-lg font-bold text-slate-900">{activities.length}</p>
            <p className="text-[11px] font-medium text-slate-400">Serviços</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-center">
            <p className="text-lg font-bold text-slate-900">{responsibles.length}</p>
            <p className="text-[11px] font-medium text-slate-400">Responsáveis</p>
          </div>
        </div>
        <button
          onClick={() => setConfirmReset(true)}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          {isSupabaseConfigured ? "Recarregar dados do servidor" : "Restaurar dados de exemplo"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-900">Perfis de Usuário</h2>
        </div>
        <p className="text-sm text-slate-500">
          Estrutura preparada para autenticação e controle de acesso por perfil. A autenticação
          completa será implementada em uma próxima etapa.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ROLES.map((r) => (
            <div key={r.role} className="rounded-lg border border-slate-200 p-3.5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">{r.role}</p>
              <p className="mt-1 text-xs text-slate-500">{r.description}</p>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title={isSupabaseConfigured ? "Recarregar dados do servidor?" : "Restaurar dados de exemplo?"}
        description={
          isSupabaseConfigured
            ? "Busca novamente todos os serviços, responsáveis e histórico direto do banco Supabase — útil se algo parecer desatualizado."
            : "Todos os serviços, responsáveis e históricos cadastrados nesta sessão serão substituídos pelos dados de demonstração originais."
        }
        confirmLabel={isSupabaseConfigured ? "Recarregar" : "Restaurar"}
        danger={!isSupabaseConfigured}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetToSeedData();
          setConfirmReset(false);
        }}
      />
    </div>
  );
}
