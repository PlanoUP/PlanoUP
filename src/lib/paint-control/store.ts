"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Activity,
  ActivityHistoryEntry,
  Responsible,
  Unit,
} from "@/types/paint-control";
import { SEED_UNITS } from "@/data/paint-control/units";
import { SEED_ACTIVITIES } from "@/data/paint-control/activities";
import { SEED_RESPONSIBLES } from "@/data/paint-control/responsibles";
import { PRIORITY_LABELS } from "@/lib/paint-control/constants";

const AUTHOR_NAME = "Usuário";

function nowIso() {
  return new Date().toISOString();
}

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export type NewActivityInput = Omit<
  Activity,
  "id" | "createdAt" | "updatedAt" | "completedSteps"
> & { completedSteps?: Activity["completedSteps"] };

interface PaintControlState {
  units: Unit[];
  activities: Activity[];
  responsibles: Responsible[];
  history: ActivityHistoryEntry[];
  hasHydrated: boolean;

  addActivity: (input: NewActivityInput) => Activity;
  updateActivity: (id: string, patch: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;

  addResponsible: (input: Omit<Responsible, "id">) => Responsible;
  updateResponsible: (id: string, patch: Partial<Responsible>) => void;
  deleteResponsible: (id: string) => void;

  logHistory: (entry: Omit<ActivityHistoryEntry, "id" | "createdAt">) => void;
  resetToSeedData: () => void;
  setHasHydrated: (state: boolean) => void;
}

function pushHistory(
  entries: ActivityHistoryEntry[],
  entry: Omit<ActivityHistoryEntry, "id" | "createdAt">
): ActivityHistoryEntry[] {
  const record: ActivityHistoryEntry = {
    ...entry,
    id: newId(),
    createdAt: nowIso(),
  };
  return [record, ...entries];
}

export const usePaintControlStore = create<PaintControlState>()(
  persist(
    (set, get) => ({
      units: SEED_UNITS,
      activities: SEED_ACTIVITIES,
      responsibles: SEED_RESPONSIBLES,
      history: [],
      hasHydrated: false,

      addActivity: (input) => {
        const activity: Activity = {
          ...input,
          id: newId(),
          completedSteps: input.completedSteps ?? [],
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set((state) => ({
          activities: [activity, ...state.activities],
          history: pushHistory(state.history, {
            activityId: activity.id,
            action: "created",
            message: `${AUTHOR_NAME} criou o serviço de pintura.`,
            authorName: AUTHOR_NAME,
          }),
        }));
        return activity;
      },

      updateActivity: (id, patch) => {
        const state = get();
        const current = state.activities.find((a) => a.id === id);
        if (!current) return;

        const newHistoryEntries: Omit<ActivityHistoryEntry, "id" | "createdAt">[] = [];

        if (patch.priority && patch.priority !== current.priority) {
          newHistoryEntries.push({
            activityId: id,
            action: "priority_changed",
            message: `${AUTHOR_NAME} alterou prioridade de ${PRIORITY_LABELS[current.priority]} para ${PRIORITY_LABELS[patch.priority]}.`,
            authorName: AUTHOR_NAME,
          });
        }
        if ("responsibleId" in patch && patch.responsibleId !== current.responsibleId) {
          const oldName = state.responsibles.find((r) => r.id === current.responsibleId)?.name ?? "Sem responsável";
          const newName = state.responsibles.find((r) => r.id === patch.responsibleId)?.name ?? "Sem responsável";
          newHistoryEntries.push({
            activityId: id,
            action: "responsible_changed",
            message: `${AUTHOR_NAME} alterou responsável de ${oldName} para ${newName}.`,
            authorName: AUTHOR_NAME,
          });
        }
        if (
          (patch.programmedDate && patch.programmedDate !== current.programmedDate) ||
          (patch.neededDate && patch.neededDate !== current.neededDate)
        ) {
          newHistoryEntries.push({
            activityId: id,
            action: "schedule_changed",
            message: `${AUTHOR_NAME} atualizou a programação do serviço.`,
            authorName: AUTHOR_NAME,
          });
        }
        if (typeof patch.progress === "number" && patch.progress !== current.progress) {
          newHistoryEntries.push({
            activityId: id,
            action: "progress_changed",
            message: `${AUTHOR_NAME} alterou avanço de ${current.progress}% para ${patch.progress}%.`,
            authorName: AUTHOR_NAME,
          });
        }
        if (patch.status && patch.status !== current.status) {
          newHistoryEntries.push({
            activityId: id,
            action: patch.status === "Concluído" ? "completed" : "status_changed",
            message:
              patch.status === "Concluído"
                ? `${AUTHOR_NAME} concluiu o serviço de pintura.`
                : `${AUTHOR_NAME} alterou status de "${current.status}" para "${patch.status}".`,
            authorName: AUTHOR_NAME,
          });
        }
        if (newHistoryEntries.length === 0) {
          newHistoryEntries.push({
            activityId: id,
            action: "updated",
            message: `${AUTHOR_NAME} atualizou informações do serviço.`,
            authorName: AUTHOR_NAME,
          });
        }

        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === id ? { ...a, ...patch, updatedAt: nowIso() } : a
          ),
          history: newHistoryEntries.reduce((acc, e) => pushHistory(acc, e), s.history),
        }));
      },

      deleteActivity: (id) => {
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
          history: state.history.filter((h) => h.activityId !== id),
        }));
      },

      addResponsible: (input) => {
        const responsible: Responsible = { ...input, id: newId() };
        set((state) => ({ responsibles: [responsible, ...state.responsibles] }));
        return responsible;
      },

      updateResponsible: (id, patch) => {
        set((state) => ({
          responsibles: state.responsibles.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        }));
      },

      deleteResponsible: (id) => {
        set((state) => ({
          responsibles: state.responsibles.filter((r) => r.id !== id),
          activities: state.activities.map((a) =>
            a.responsibleId === id ? { ...a, responsibleId: null } : a
          ),
        }));
      },

      logHistory: (entry) => {
        set((state) => ({ history: pushHistory(state.history, entry) }));
      },

      resetToSeedData: () => {
        set({
          units: SEED_UNITS,
          activities: SEED_ACTIVITIES,
          responsibles: SEED_RESPONSIBLES,
          history: [],
        });
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "paint-control-ati-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        units: state.units,
        activities: state.activities,
        responsibles: state.responsibles,
        history: state.history,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
