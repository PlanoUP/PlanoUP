"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Activity,
  ActivityHistoryEntry,
  CostItem,
  Responsible,
  RevitalizationItem,
  Unit,
} from "@/types/paint-control";
import { SEED_UNITS } from "@/data/paint-control/units";
import { SEED_ACTIVITIES } from "@/data/paint-control/activities";
import { SEED_RESPONSIBLES } from "@/data/paint-control/responsibles";
import { SEED_REVITALIZATION_ITEMS } from "@/data/paint-control/revitalization";
import { SEED_COST_ITEMS } from "@/data/paint-control/costs";
import { PRIORITY_LABELS } from "@/lib/paint-control/constants";
import { isSupabaseConfigured, supabase } from "@/lib/paint-control/supabaseClient";
import {
  activityToRow,
  costItemToRow,
  responsibleToRow,
  revitalizationItemToRow,
  rowToActivity,
  rowToCostItem,
  rowToHistoryEntry,
  rowToResponsible,
  rowToRevitalizationItem,
  rowToUnit,
  type ActivityHistoryRow,
  type ActivityRow,
  type CostRow,
  type ResponsibleRow,
  type RevitalizationRow,
  type UnitRow,
} from "@/lib/paint-control/supabaseMappers";

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

export type NewRevitalizationInput = Omit<RevitalizationItem, "id" | "createdAt" | "updatedAt">;
export type NewCostItemInput = Omit<CostItem, "id" | "createdAt" | "updatedAt">;

interface PaintControlState {
  units: Unit[];
  activities: Activity[];
  responsibles: Responsible[];
  history: ActivityHistoryEntry[];
  revitalizationItems: RevitalizationItem[];
  costItems: CostItem[];
  hasHydrated: boolean;
  /** True once the Supabase realtime channels are live (multi-user sync active). */
  isLive: boolean;

  addActivity: (input: NewActivityInput) => Activity;
  updateActivity: (id: string, patch: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;

  addResponsible: (input: Omit<Responsible, "id">) => Responsible;
  updateResponsible: (id: string, patch: Partial<Responsible>) => void;
  deleteResponsible: (id: string) => void;

  addRevitalizationItem: (input: NewRevitalizationInput) => RevitalizationItem;
  updateRevitalizationItem: (id: string, patch: Partial<RevitalizationItem>) => void;
  deleteRevitalizationItem: (id: string) => void;

  addCostItem: (input: NewCostItemInput) => CostItem;
  updateCostItem: (id: string, patch: Partial<CostItem>) => void;
  deleteCostItem: (id: string) => void;

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

/** Builds the same history entries as before, given the pre-patch activity. */
function buildHistoryEntries(
  id: string,
  current: Activity,
  patch: Partial<Activity>,
  responsibles: Responsible[]
): Omit<ActivityHistoryEntry, "id" | "createdAt">[] {
  const entries: Omit<ActivityHistoryEntry, "id" | "createdAt">[] = [];

  if (patch.priority && patch.priority !== current.priority) {
    entries.push({
      activityId: id,
      action: "priority_changed",
      message: `${AUTHOR_NAME} alterou prioridade de ${PRIORITY_LABELS[current.priority]} para ${PRIORITY_LABELS[patch.priority]}.`,
      authorName: AUTHOR_NAME,
    });
  }
  if ("responsibleId" in patch && patch.responsibleId !== current.responsibleId) {
    const oldName = responsibles.find((r) => r.id === current.responsibleId)?.name ?? "Sem responsável";
    const newName = responsibles.find((r) => r.id === patch.responsibleId)?.name ?? "Sem responsável";
    entries.push({
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
    entries.push({
      activityId: id,
      action: "schedule_changed",
      message: `${AUTHOR_NAME} atualizou a programação do serviço.`,
      authorName: AUTHOR_NAME,
    });
  }
  if (typeof patch.progress === "number" && patch.progress !== current.progress) {
    entries.push({
      activityId: id,
      action: "progress_changed",
      message: `${AUTHOR_NAME} alterou avanço de ${current.progress}% para ${patch.progress}%.`,
      authorName: AUTHOR_NAME,
    });
  }
  if (patch.status && patch.status !== current.status) {
    entries.push({
      activityId: id,
      action: patch.status === "Concluído" ? "completed" : "status_changed",
      message:
        patch.status === "Concluído"
          ? `${AUTHOR_NAME} concluiu o serviço de pintura.`
          : `${AUTHOR_NAME} alterou status de "${current.status}" para "${patch.status}".`,
      authorName: AUTHOR_NAME,
    });
  }
  if (entries.length === 0) {
    entries.push({
      activityId: id,
      action: "updated",
      message: `${AUTHOR_NAME} atualizou informações do serviço.`,
      authorName: AUTHOR_NAME,
    });
  }
  return entries;
}

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const idx = list.findIndex((item) => item.id === row.id);
  if (idx === -1) return [row, ...list];
  const next = list.slice();
  next[idx] = row;
  return next;
}

// ---------------------------------------------------------------------
// Local-only store: original localStorage-backed demo, used whenever
// NEXT_PUBLIC_SUPABASE_URL/ANON_KEY aren't set (e.g. before setup, or
// running the app locally without a database).
// ---------------------------------------------------------------------
function createLocalStore() {
  return create<PaintControlState>()(
    persist(
      (set, get) => ({
        units: SEED_UNITS,
        activities: SEED_ACTIVITIES,
        responsibles: SEED_RESPONSIBLES,
        history: [],
        revitalizationItems: SEED_REVITALIZATION_ITEMS,
        costItems: SEED_COST_ITEMS,
        hasHydrated: false,
        isLive: false,

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
          const entries = buildHistoryEntries(id, current, patch, state.responsibles);
          set((s) => ({
            activities: s.activities.map((a) =>
              a.id === id ? { ...a, ...patch, updatedAt: nowIso() } : a
            ),
            history: entries.reduce((acc, e) => pushHistory(acc, e), s.history),
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

        addRevitalizationItem: (input) => {
          const item: RevitalizationItem = {
            ...input,
            id: newId(),
            createdAt: nowIso(),
            updatedAt: nowIso(),
          };
          set((state) => ({ revitalizationItems: [item, ...state.revitalizationItems] }));
          return item;
        },

        updateRevitalizationItem: (id, patch) => {
          set((state) => ({
            revitalizationItems: state.revitalizationItems.map((r) =>
              r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r
            ),
          }));
        },

        deleteRevitalizationItem: (id) => {
          set((state) => ({
            revitalizationItems: state.revitalizationItems.filter((r) => r.id !== id),
          }));
        },

        addCostItem: (input) => {
          const item: CostItem = {
            ...input,
            id: newId(),
            createdAt: nowIso(),
            updatedAt: nowIso(),
          };
          set((state) => ({ costItems: [item, ...state.costItems] }));
          return item;
        },

        updateCostItem: (id, patch) => {
          set((state) => ({
            costItems: state.costItems.map((c) =>
              c.id === id ? { ...c, ...patch, updatedAt: nowIso() } : c
            ),
          }));
        },

        deleteCostItem: (id) => {
          set((state) => ({
            costItems: state.costItems.filter((c) => c.id !== id),
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
            revitalizationItems: SEED_REVITALIZATION_ITEMS,
            costItems: SEED_COST_ITEMS,
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
          revitalizationItems: state.revitalizationItems,
          costItems: state.costItems,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    )
  );
}

// ---------------------------------------------------------------------
// Supabase-backed store: every read/write hits the shared database, and a
// Realtime subscription keeps every open browser (any user, any device)
// in sync — a change one gestor makes shows up for everyone else live.
// ---------------------------------------------------------------------
function createSupabaseStore() {
  const db = supabase!;

  const useStore = create<PaintControlState>()((set, get) => ({
    units: [],
    activities: [],
    responsibles: [],
    history: [],
    revitalizationItems: [],
    costItems: [],
    hasHydrated: false,
    isLive: false,

    addActivity: (input) => {
      const activity: Activity = {
        ...input,
        id: newId(),
        completedSteps: input.completedSteps ?? [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      const historyEntry: ActivityHistoryEntry = {
        id: newId(),
        activityId: activity.id,
        action: "created",
        message: `${AUTHOR_NAME} criou o serviço de pintura.`,
        authorName: AUTHOR_NAME,
        createdAt: nowIso(),
      };
      set((state) => ({
        activities: [activity, ...state.activities],
        history: [historyEntry, ...state.history],
      }));

      db.from("activities")
        .insert({ id: activity.id, ...activityToRow(activity) })
        .then(({ error }) => error && console.error("Falha ao criar serviço", error));
      db.from("activity_history")
        .insert({
          id: historyEntry.id,
          activity_id: historyEntry.activityId,
          action: historyEntry.action,
          message: historyEntry.message,
          author_name: historyEntry.authorName,
        })
        .then(({ error }) => error && console.error("Falha ao registrar histórico", error));

      return activity;
    },

    updateActivity: (id, patch) => {
      const state = get();
      const current = state.activities.find((a) => a.id === id);
      if (!current) return;
      const entries = buildHistoryEntries(id, current, patch, state.responsibles);
      const historyRecords: ActivityHistoryEntry[] = entries.map((e) => ({
        ...e,
        id: newId(),
        createdAt: nowIso(),
      }));

      set((s) => ({
        activities: s.activities.map((a) =>
          a.id === id ? { ...a, ...patch, updatedAt: nowIso() } : a
        ),
        history: [...historyRecords, ...s.history],
      }));

      const updated = { ...current, ...patch };
      const row = activityToRow(updated);
      db.from("activities")
        .update({ ...row, updated_at: nowIso() })
        .eq("id", id)
        .then(({ error }) => error && console.error("Falha ao atualizar serviço", error));
      db.from("activity_history")
        .insert(
          historyRecords.map((h) => ({
            id: h.id,
            activity_id: h.activityId,
            action: h.action,
            message: h.message,
            author_name: h.authorName,
          }))
        )
        .then(({ error }) => error && console.error("Falha ao registrar histórico", error));
    },

    deleteActivity: (id) => {
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
        history: state.history.filter((h) => h.activityId !== id),
      }));
      db.from("activities")
        .delete()
        .eq("id", id)
        .then(({ error }) => error && console.error("Falha ao excluir serviço", error));
    },

    addResponsible: (input) => {
      const responsible: Responsible = { ...input, id: newId() };
      set((state) => ({ responsibles: [responsible, ...state.responsibles] }));
      db.from("responsibles")
        .insert({ id: responsible.id, ...responsibleToRow(input) })
        .then(({ error }) => error && console.error("Falha ao criar responsável", error));
      return responsible;
    },

    updateResponsible: (id, patch) => {
      set((state) => ({
        responsibles: state.responsibles.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      }));
      db.from("responsibles")
        .update(patch)
        .eq("id", id)
        .then(({ error }) => error && console.error("Falha ao atualizar responsável", error));
    },

    deleteResponsible: (id) => {
      set((state) => ({
        responsibles: state.responsibles.filter((r) => r.id !== id),
        activities: state.activities.map((a) =>
          a.responsibleId === id ? { ...a, responsibleId: null } : a
        ),
      }));
      db.from("responsibles")
        .delete()
        .eq("id", id)
        .then(({ error }) => error && console.error("Falha ao excluir responsável", error));
    },

    addRevitalizationItem: (input) => {
      const item: RevitalizationItem = {
        ...input,
        id: newId(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      set((state) => ({ revitalizationItems: [item, ...state.revitalizationItems] }));
      db.from("revitalization_activities")
        .insert({ id: item.id, ...revitalizationItemToRow(item) })
        .then(({ error }) => error && console.error("Falha ao criar item de revitalização", error));
      return item;
    },

    updateRevitalizationItem: (id, patch) => {
      const state = get();
      const current = state.revitalizationItems.find((r) => r.id === id);
      if (!current) return;
      set((s) => ({
        revitalizationItems: s.revitalizationItems.map((r) =>
          r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r
        ),
      }));
      const updated = { ...current, ...patch };
      db.from("revitalization_activities")
        .update({ ...revitalizationItemToRow(updated), updated_at: nowIso() })
        .eq("id", id)
        .then(({ error }) => error && console.error("Falha ao atualizar item de revitalização", error));
    },

    deleteRevitalizationItem: (id) => {
      set((state) => ({
        revitalizationItems: state.revitalizationItems.filter((r) => r.id !== id),
      }));
      db.from("revitalization_activities")
        .delete()
        .eq("id", id)
        .then(({ error }) => error && console.error("Falha ao excluir item de revitalização", error));
    },

    addCostItem: (input) => {
      const item: CostItem = {
        ...input,
        id: newId(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      set((state) => ({ costItems: [item, ...state.costItems] }));
      db.from("cost_items")
        .insert({ id: item.id, ...costItemToRow(item) })
        .then(({ error }) => error && console.error("Falha ao criar item de custo", error));
      return item;
    },

    updateCostItem: (id, patch) => {
      const state = get();
      const current = state.costItems.find((c) => c.id === id);
      if (!current) return;
      set((s) => ({
        costItems: s.costItems.map((c) =>
          c.id === id ? { ...c, ...patch, updatedAt: nowIso() } : c
        ),
      }));
      const updated = { ...current, ...patch };
      db.from("cost_items")
        .update({ ...costItemToRow(updated), updated_at: nowIso() })
        .eq("id", id)
        .then(({ error }) => error && console.error("Falha ao atualizar item de custo", error));
    },

    deleteCostItem: (id) => {
      set((state) => ({
        costItems: state.costItems.filter((c) => c.id !== id),
      }));
      db.from("cost_items")
        .delete()
        .eq("id", id)
        .then(({ error }) => error && console.error("Falha ao excluir item de custo", error));
    },

    logHistory: (entry) => {
      set((state) => ({ history: pushHistory(state.history, entry) }));
    },

    resetToSeedData: () => {
      // Shared database — never wipe everyone's data from the client.
      // This just re-syncs from the current server state instead.
      void loadAll();
    },

    setHasHydrated: (value) => set({ hasHydrated: value }),
  }));

  async function loadAll() {
    const [unitsRes, responsiblesRes, activitiesRes, historyRes, revitalizationRes, costItemsRes] =
      await Promise.all([
        db.from("units").select("*").order("tag"),
        db.from("responsibles").select("*").order("name"),
        db.from("activities").select("*").order("created_at", { ascending: false }),
        db.from("activity_history").select("*").order("created_at", { ascending: false }),
        db.from("revitalization_activities").select("*").order("created_at", { ascending: false }),
        db.from("cost_items").select("*").order("created_at", { ascending: false }),
      ]);

    if (unitsRes.error) console.error("Falha ao carregar unidades", unitsRes.error);
    if (responsiblesRes.error) console.error("Falha ao carregar responsáveis", responsiblesRes.error);
    if (activitiesRes.error) console.error("Falha ao carregar serviços", activitiesRes.error);
    if (historyRes.error) console.error("Falha ao carregar histórico", historyRes.error);
    if (revitalizationRes.error) console.error("Falha ao carregar revitalização", revitalizationRes.error);
    if (costItemsRes.error) console.error("Falha ao carregar custos", costItemsRes.error);

    useStore.setState({
      units: ((unitsRes.data ?? []) as UnitRow[]).map(rowToUnit),
      responsibles: ((responsiblesRes.data ?? []) as ResponsibleRow[]).map(rowToResponsible),
      activities: ((activitiesRes.data ?? []) as ActivityRow[]).map(rowToActivity),
      history: ((historyRes.data ?? []) as ActivityHistoryRow[]).map(rowToHistoryEntry),
      revitalizationItems: ((revitalizationRes.data ?? []) as RevitalizationRow[]).map(
        rowToRevitalizationItem
      ),
      costItems: ((costItemsRes.data ?? []) as CostRow[]).map(rowToCostItem),
      hasHydrated: true,
    });
  }

  function subscribeRealtime() {
    db.channel("paint-control-ati")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activities" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id?: string }).id;
            if (!oldId) return;
            useStore.setState((s) => ({ activities: s.activities.filter((a) => a.id !== oldId) }));
            return;
          }
          const activity = rowToActivity(payload.new as ActivityRow);
          useStore.setState((s) => ({ activities: upsertById(s.activities, activity) }));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "responsibles" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id?: string }).id;
            if (!oldId) return;
            useStore.setState((s) => ({ responsibles: s.responsibles.filter((r) => r.id !== oldId) }));
            return;
          }
          const responsible = rowToResponsible(payload.new as ResponsibleRow);
          useStore.setState((s) => ({ responsibles: upsertById(s.responsibles, responsible) }));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_history" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id?: string }).id;
            if (!oldId) return;
            useStore.setState((s) => ({ history: s.history.filter((h) => h.id !== oldId) }));
            return;
          }
          const entry = rowToHistoryEntry(payload.new as ActivityHistoryRow);
          useStore.setState((s) => ({ history: upsertById(s.history, entry) }));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "revitalization_activities" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id?: string }).id;
            if (!oldId) return;
            useStore.setState((s) => ({
              revitalizationItems: s.revitalizationItems.filter((r) => r.id !== oldId),
            }));
            return;
          }
          const item = rowToRevitalizationItem(payload.new as RevitalizationRow);
          useStore.setState((s) => ({
            revitalizationItems: upsertById(s.revitalizationItems, item),
          }));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cost_items" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id?: string }).id;
            if (!oldId) return;
            useStore.setState((s) => ({ costItems: s.costItems.filter((c) => c.id !== oldId) }));
            return;
          }
          const item = rowToCostItem(payload.new as CostRow);
          useStore.setState((s) => ({ costItems: upsertById(s.costItems, item) }));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") useStore.setState({ isLive: true });
      });
  }

  if (typeof window !== "undefined") {
    void loadAll().then(subscribeRealtime);
  }

  return useStore;
}

export const usePaintControlStore = isSupabaseConfigured ? createSupabaseStore() : createLocalStore();
