"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertOctagon, Check, Loader2 } from "lucide-react";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import { subscribeActionPlansChanged } from "@/lib/brava/field/actionPlanBus";
import { ActionPlan } from "@/lib/brava/field/actionPlan";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.round(hours / 24)}d`;
}

// Global, open-the-painel-and-see-it alert for an active "Plano de Ação"
// flagged by a Fiscal in the field — mounted once in the Brava layout so it
// shows on every page, not just the tank the impediment was raised on.
export default function ActionPlanBanner() {
  const { isEditor } = useEditAuth();
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchPlans = useCallback(() => {
    fetch("/api/action-plans", { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => setPlans(Array.isArray(body.plans) ? body.plans : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPlans();
    return subscribeActionPlansChanged(fetchPlans);
  }, [fetchPlans]);

  async function handleResolve(id: string) {
    setResolvingId(id);
    try {
      await fetch(`/api/action-plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: true }),
      });
      fetchPlans();
    } finally {
      setResolvingId(null);
    }
  }

  if (plans.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 border-b border-brava-danger-border bg-brava-danger-bg px-4 py-2.5 sm:px-8">
      {plans.map((plan) => (
        <div key={plan.id} className="flex items-start gap-2.5">
          <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-brava-danger" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-brava-danger">
              Impedimento — <span className="font-mono">{plan.tankTag}</span>
            </p>
            <p className="text-[12.5px] text-brava-text">{plan.description}</p>
            <p className="text-[11px] text-brava-text-secondary">
              {plan.createdByName} · {timeAgo(plan.createdAt)}
            </p>
          </div>
          {isEditor && (
            <button
              type="button"
              onClick={() => handleResolve(plan.id)}
              disabled={resolvingId === plan.id}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-brava-sm border border-brava-danger-border bg-brava-white px-2.5 py-1.5 text-[11.5px] font-bold text-brava-danger disabled:opacity-60"
            >
              {resolvingId === plan.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Resolver
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
