"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tank, TankStatus, TankWithDerived, TankFilter, FamilyView } from "./types";
import { withDerived } from "./selectors";
import { todayISO } from "./date-utils";

// 8s was far too aggressive once multiplied across every provider mounted
// in the layout (9 of them, each polling independently) and every open
// tab — real contributor to exhausting the Neon database's request quota
// (2026-10-20). 45s keeps the dashboard feeling live without hammering it.
const POLL_INTERVAL_MS = 45000;

interface ActivityEdit {
  plannedStart?: string;
  durationDays?: number;
  progress?: number;
  /**
   * An empty string explicitly clears the field — omitting it leaves the
   * stored value untouched. There's no separate status field here: every
   * activity's status (and the tank's own) is always re-derived server-side
   * from these dates/progress, see deriveActivityStatus/deriveTankStatus.
   */
  actualStart?: string;
  actualEnd?: string;
}

type LoadStatus = "loading" | "ready" | "error";

interface BravaContextValue {
  tanks: TankWithDerived[];
  today: string;
  status: LoadStatus;
  errorMessage: string | null;
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
  /** Clears every activity's real dates/progress back to not-yet-started and re-derives status from scratch. */
  resetTankExecution: (tankId: string) => void;
}

const BravaContext = createContext<BravaContextValue | null>(null);

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || "Falha ao comunicar com o servidor.";
  } catch {
    return "Falha ao comunicar com o servidor.";
  }
}

export function BravaDataProvider({ children }: { children: React.ReactNode }) {
  const [tanksRaw, setTanksRaw] = useState<Tank[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilterState] = useState<TankFilter>({ status: "TODOS", search: "" });
  const [familyView, setFamilyView] = useState<FamilyView>("CRITICIDADE");
  const today = useMemo(() => todayISO(), []);
  const hasLoadedOnce = useRef(false);

  const fetchTanks = useCallback(async () => {
    try {
      const res = await fetch("/api/tanks", { cache: "no-store" });
      if (!res.ok) {
        const message = await parseErrorMessage(res);
        if (!hasLoadedOnce.current) {
          setStatus("error");
          setErrorMessage(message);
        } else {
          console.error("Falha ao atualizar tanques:", message);
        }
        return;
      }
      const body = await res.json();
      setTanksRaw(body.tanks);
      hasLoadedOnce.current = true;
      setStatus("ready");
      setErrorMessage(null);
    } catch (err) {
      if (!hasLoadedOnce.current) {
        setStatus("error");
        setErrorMessage("Não foi possível conectar ao servidor.");
      } else {
        console.error("Falha ao atualizar tanques:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchTanks();
    const interval = setInterval(fetchTanks, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchTanks]);

  const setFilter = useCallback((patch: Partial<TankFilter>) => {
    setFilterState((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateActivity = useCallback(
    (tankId: string, activityId: string, edit: ActivityEdit) => {
      // The dependency-chain recalculation (recalculateSchedule) only runs
      // server-side, so there's no safe client-side optimistic update here
      // without duplicating that logic — the grid updates once the response
      // (or the next poll, on failure) comes back.
      fetch(`/api/tanks/${tankId}/activity`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId, edit }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await parseErrorMessage(res));
          const body = await res.json();
          setTanksRaw((prev) => prev.map((t) => (t.id === tankId ? body.tank : t)));
        })
        .catch((err) => {
          console.error("Falha ao salvar atividade:", err);
          fetchTanks();
        });
    },
    [fetchTanks]
  );

  const updateTankMeta = useCallback(
    (tankId: string, patch: Partial<Pick<Tank, "status" | "notes" | "responsible">>) => {
      setTanksRaw((prev) => prev.map((tank) => (tank.id === tankId ? { ...tank, ...patch } : tank)));
      fetch(`/api/tanks/${tankId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await parseErrorMessage(res));
          const body = await res.json();
          setTanksRaw((prev) => prev.map((t) => (t.id === tankId ? body.tank : t)));
        })
        .catch((err) => {
          console.error("Falha ao salvar tanque:", err);
          fetchTanks();
        });
    },
    [fetchTanks]
  );

  const resetTankExecution = useCallback(
    (tankId: string) => {
      fetch(`/api/tanks/${tankId}/reset-execution`, { method: "POST" })
        .then(async (res) => {
          if (!res.ok) throw new Error(await parseErrorMessage(res));
          const body = await res.json();
          setTanksRaw((prev) => prev.map((t) => (t.id === tankId ? body.tank : t)));
        })
        .catch((err) => {
          console.error("Falha ao redefinir a execução do tanque:", err);
          fetchTanks();
        });
    },
    [fetchTanks]
  );

  const tanks = useMemo(() => withDerived(tanksRaw, today), [tanksRaw, today]);

  const getTank = useCallback(
    (tag: string) => tanks.find((t) => t.tag.toLowerCase() === tag.toLowerCase()),
    [tanks]
  );

  const value: BravaContextValue = {
    tanks,
    today,
    status,
    errorMessage,
    filter,
    setFilter,
    familyView,
    setFamilyView,
    getTank,
    updateActivity,
    updateTankMeta,
    resetTankExecution,
  };

  return <BravaContext.Provider value={value}>{children}</BravaContext.Provider>;
}

export function useBravaData(): BravaContextValue {
  const ctx = useContext(BravaContext);
  if (!ctx) throw new Error("useBravaData must be used within BravaDataProvider");
  return ctx;
}

export type { TankStatus };
