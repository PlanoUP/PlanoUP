"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Tank, TankStatus, TankWithDerived, TankFilter, FamilyView } from "./types";
import { TANKS_SEED } from "./data/tanks";
import { recalculateSchedule } from "./schedule-engine";
import { withDerived } from "./selectors";
import { todayISO } from "./date-utils";

const STORAGE_KEY = "brava-tanks-v1";

interface ActivityEdit {
  plannedStart?: string;
  durationDays?: number;
  progress?: number;
  actualStart?: string;
  actualEnd?: string;
}

interface BravaContextValue {
  tanks: TankWithDerived[];
  today: string;
  filter: TankFilter;
  setFilter: (filter: Partial<TankFilter>) => void;
  familyView: FamilyView;
  setFamilyView: (view: FamilyView) => void;
  getTank: (tag: string) => TankWithDerived | undefined;
  updateActivity: (tankId: string, activityId: string, edit: ActivityEdit) => void;
  updateTankMeta: (
    tankId: string,
    patch: Partial<Pick<Tank, "status" | "notes" | "responsible">>
  ) => void;
  resetToSeed: () => void;
}

const BravaContext = createContext<BravaContextValue | null>(null);

export function BravaDataProvider({ children }: { children: React.ReactNode }) {
  const [tanksRaw, setTanksRaw] = useState<Tank[]>(TANKS_SEED);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilterState] = useState<TankFilter>({ status: "TODOS", search: "" });
  const [familyView, setFamilyView] = useState<FamilyView>("CRITICIDADE");
  const today = useMemo(() => todayISO(), []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setTanksRaw(JSON.parse(raw));
    } catch {
      // ignore malformed/blocked storage — fall back to seed data
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tanksRaw));
    } catch {
      // storage unavailable — edits stay in-memory for this session only
    }
  }, [tanksRaw, hydrated]);

  const setFilter = useCallback((patch: Partial<TankFilter>) => {
    setFilterState((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateActivity = useCallback(
    (tankId: string, activityId: string, edit: ActivityEdit) => {
      setTanksRaw((prev) =>
        prev.map((tank) => {
          if (tank.id !== tankId) return tank;

          let activities = tank.activities;
          if (edit.plannedStart !== undefined || edit.durationDays !== undefined) {
            activities = recalculateSchedule(activities, activityId, {
              plannedStart: edit.plannedStart,
              durationDays: edit.durationDays,
            });
          }
          if (edit.progress !== undefined || edit.actualStart !== undefined || edit.actualEnd !== undefined) {
            activities = activities.map((a) =>
              a.id === activityId
                ? {
                    ...a,
                    progress: edit.progress ?? a.progress,
                    actualStart: edit.actualStart ?? a.actualStart,
                    actualEnd: edit.actualEnd ?? a.actualEnd,
                    status: (edit.progress ?? a.progress) >= 100 ? "CONCLUIDO" : a.status === "FUTURO" ? "ATUAL" : a.status,
                  }
                : a
            );
          }

          return { ...tank, activities };
        })
      );
    },
    []
  );

  const updateTankMeta = useCallback(
    (tankId: string, patch: Partial<Pick<Tank, "status" | "notes" | "responsible">>) => {
      setTanksRaw((prev) =>
        prev.map((tank) => (tank.id === tankId ? { ...tank, ...patch } : tank))
      );
    },
    []
  );

  const resetToSeed = useCallback(() => {
    setTanksRaw(TANKS_SEED);
  }, []);

  const tanks = useMemo(() => withDerived(tanksRaw, today), [tanksRaw, today]);

  const getTank = useCallback(
    (tag: string) => tanks.find((t) => t.tag.toLowerCase() === tag.toLowerCase()),
    [tanks]
  );

  const value: BravaContextValue = {
    tanks,
    today,
    filter,
    setFilter,
    familyView,
    setFamilyView,
    getTank,
    updateActivity,
    updateTankMeta,
    resetToSeed,
  };

  return <BravaContext.Provider value={value}>{children}</BravaContext.Provider>;
}

export function useBravaData(): BravaContextValue {
  const ctx = useContext(BravaContext);
  if (!ctx) throw new Error("useBravaData must be used within BravaDataProvider");
  return ctx;
}

export type { TankStatus };
