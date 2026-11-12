"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Lock, CheckCircle2, PlayCircle, Minus, Plus } from "lucide-react";
import StatusBadge from "@/components/brava/StatusBadge";
import ProgressBar from "@/components/brava/ProgressBar";
import TankNotes from "@/components/brava/TankNotes";
import FieldLoginCard from "@/components/brava/campo/FieldLoginCard";
import FieldEntryForm from "@/components/brava/campo/FieldEntryForm";
import FieldEntryHistory from "@/components/brava/campo/FieldEntryHistory";
import { useBravaData } from "@/lib/brava/context";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import { useFieldAuth } from "@/lib/brava/fieldAuthContext";
import { formatShort } from "@/lib/brava/date-utils";
import { Activity } from "@/lib/brava/types";
import { FieldEntry } from "@/lib/brava/field/types";
import { cn } from "@/lib/brava/cn";
import { useEffect, useState } from "react";

const QUICK_PROGRESS_VALUES = [25, 50, 75, 100];

export default function CampoTankPage() {
  const params = useParams<{ tag: string }>();
  const { getTank, updateActivity, today } = useBravaData();
  const { isEditor, requireEditor } = useEditAuth();
  const { fieldUser } = useFieldAuth();
  const [savedPulse, setSavedPulse] = useState(false);
  const [fieldEntries, setFieldEntries] = useState<FieldEntry[]>([]);
  const tank = getTank(decodeURIComponent(params.tag));

  useEffect(() => {
    if (!tank) return;
    fetch(`/api/field-entries?tankId=${encodeURIComponent(tank.id)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => setFieldEntries(body.entries ?? []))
      .catch(() => {});
  }, [tank?.id]);

  function flashSaved() {
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 1200);
  }

  function handleEdit(activity: Activity, edit: Parameters<typeof updateActivity>[2]) {
    if (!requireEditor()) return;
    updateActivity(tank!.id, activity.id, edit);
    flashSaved();
  }

  function handleStart(activity: Activity) {
    handleEdit(activity, { actualStart: today });
  }

  function handleComplete(activity: Activity) {
    handleEdit(activity, {
      actualStart: activity.actualStart ?? today,
      actualEnd: today,
      progress: 100,
    });
  }

  function handleProgress(activity: Activity, progress: number) {
    handleEdit(activity, {
      actualStart: activity.actualStart ?? today,
      progress,
    });
  }

  if (!tank) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-8 text-center">
        <p className="text-[15px] font-semibold text-brava-text">Tanque não encontrado</p>
        <Link href="/brava/campo" className="mt-2 text-[13px] font-semibold text-brava-blue">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const ordered = [...tank.activities].sort((a, b) => a.order - b.order);
  const activeActivity = ordered.find((a) => a.status !== "CONCLUIDO") ?? null;
  const activeIndex = activeActivity ? ordered.indexOf(activeActivity) : -1;

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-20 border-b border-brava-border bg-brava-white/95 px-4 py-3 backdrop-blur">
        <Link href="/brava/campo" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brava-text-secondary">
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      <div className="space-y-5 px-4 py-5">
        <div className="rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[20px] font-extrabold tracking-tight text-brava-blue-dark">{tank.tag}</p>
              <p className="mt-0.5 truncate text-[13px] text-brava-text-secondary">
                {tank.area} · {tank.product}
              </p>
            </div>
            <StatusBadge status={tank.status} />
          </div>

          {tank.status !== "SEM_PROJETO" && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-[12px] text-brava-text-secondary">
                <span>Avanço geral</span>
                <span className="font-mono font-bold text-brava-text">{tank.derived.progress}%</span>
              </div>
              <ProgressBar value={tank.derived.progress} accent />
            </div>
          )}
        </div>

        {!isEditor && (
          <div className="space-y-2.5">
            <FieldLoginCard />
            {!fieldUser && (
              <button
                type="button"
                onClick={() => requireEditor()}
                className="flex w-full items-center justify-center gap-2 rounded-brava-lg border border-dashed border-brava-border bg-brava-white py-3 text-[13px] font-semibold text-brava-text-secondary"
              >
                <Lock className="h-4 w-4" />
                Ou desbloqueie a edição completa
              </button>
            )}
          </div>
        )}

        {fieldUser && !isEditor && (
          <>
            {tank.activities.length > 0 && !activeActivity ? (
              <div className="flex flex-col items-center gap-2 rounded-brava-lg border border-brava-success-border bg-brava-success-bg py-10 text-center">
                <CheckCircle2 className="h-7 w-7 text-brava-success" />
                <p className="text-[13.5px] font-semibold text-brava-success">Todas as etapas concluídas</p>
              </div>
            ) : (
              <FieldEntryForm
                tank={tank}
                activity={activeActivity}
                onSubmitted={(entry) => setFieldEntries((prev) => [entry, ...prev])}
              />
            )}
          </>
        )}

        {isEditor && activeActivity ? (
          <div className="rounded-brava-lg border border-brava-blue/25 bg-brava-white p-5 shadow-brava-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-brava-blue">
                Etapa {activeIndex + 1} de {ordered.length}
              </p>
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  activeActivity.status === "ATRASADO" ? "text-brava-warning" : "text-brava-text-secondary"
                )}
              >
                {activeActivity.status === "ATRASADO" ? "Atrasada" : "Em andamento"}
              </span>
            </div>
            <p className="mt-1 text-[17px] font-bold text-brava-text">{activeActivity.name}</p>
            <p className="mt-0.5 text-[12px] text-brava-text-secondary">
              Previsto: {formatShort(activeActivity.plannedStart)} — {formatShort(activeActivity.plannedEnd)}
            </p>

            <div className="mt-5 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleProgress(activeActivity, Math.max(0, activeActivity.progress - 10))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brava-border bg-brava-white text-brava-text active:bg-brava-bg"
                aria-label="Diminuir progresso"
              >
                <Minus className="h-5 w-5" />
              </button>
              <p className="w-20 text-center font-mono text-[32px] font-extrabold text-brava-blue-dark">
                {activeActivity.progress}%
              </p>
              <button
                type="button"
                onClick={() => handleProgress(activeActivity, Math.min(100, activeActivity.progress + 10))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brava-border bg-brava-white text-brava-text active:bg-brava-bg"
                aria-label="Aumentar progresso"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {QUICK_PROGRESS_VALUES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleProgress(activeActivity, v)}
                  className={cn(
                    "rounded-brava-sm border py-2 text-[13px] font-bold transition-colors",
                    activeActivity.progress === v
                      ? "border-brava-blue bg-brava-blue text-brava-white"
                      : "border-brava-border bg-brava-white text-brava-text active:bg-brava-bg"
                  )}
                >
                  {v}%
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              {!activeActivity.actualStart && (
                <button
                  type="button"
                  onClick={() => handleStart(activeActivity)}
                  className="flex items-center justify-center gap-2 rounded-brava-lg bg-brava-blue py-3.5 text-[14px] font-bold text-brava-white active:bg-brava-blue-dark"
                >
                  <PlayCircle className="h-5 w-5" />
                  Marcar início
                </button>
              )}
              <button
                type="button"
                onClick={() => handleComplete(activeActivity)}
                className="flex items-center justify-center gap-2 rounded-brava-lg border-2 border-brava-success bg-brava-success-bg py-3.5 text-[14px] font-bold text-brava-success active:bg-brava-success/20"
              >
                <CheckCircle2 className="h-5 w-5" />
                Marcar etapa concluída
              </button>
            </div>

            {savedPulse && (
              <p className="mt-3 text-center text-[12px] font-semibold text-brava-success">Salvo ✓</p>
            )}
          </div>
        ) : (
          isEditor &&
          tank.activities.length > 0 && (
            <div className="flex flex-col items-center gap-2 rounded-brava-lg border border-brava-success-border bg-brava-success-bg py-10 text-center">
              <CheckCircle2 className="h-7 w-7 text-brava-success" />
              <p className="text-[13.5px] font-semibold text-brava-success">Todas as etapas concluídas</p>
            </div>
          )
        )}

        {ordered.length > 0 && (
          <div className="rounded-brava-lg border border-brava-border bg-brava-white p-4 shadow-brava-sm">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-brava-text-secondary">
              Todas as etapas
            </p>
            <div className="space-y-2.5">
              {ordered.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      a.status === "CONCLUIDO" && "bg-brava-success",
                      a.status === "ATUAL" && "bg-brava-blue",
                      a.status === "ATRASADO" && "bg-brava-warning",
                      a.status === "FUTURO" && "bg-brava-border"
                    )}
                  />
                  <p
                    className={cn(
                      "flex-1 truncate text-[12.5px]",
                      a.id === activeActivity?.id ? "font-bold text-brava-text" : "text-brava-text-secondary"
                    )}
                  >
                    {a.name}
                  </p>
                  <span className="shrink-0 font-mono text-[11px] text-brava-text-secondary">{a.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <FieldEntryHistory entries={fieldEntries} />

        <TankNotes tank={tank} />
      </div>
    </div>
  );
}
