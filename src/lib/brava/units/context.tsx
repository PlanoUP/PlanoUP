"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Equipment, EquipmentStatus, EquipmentWithDerived, EquipmentFilter, UnitView } from "./types";
import { withDerived } from "./selectors";
import { todayISO } from "../date-utils";

const POLL_INTERVAL_MS = 8000;

interface ActivityEdit {
  plannedStart?: string;
  durationDays?: number;
  progress?: number;
  actualStart?: string;
  actualEnd?: string;
}

type LoadStatus = "loading" | "ready" | "error";

interface UnitsContextValue {
  equipment: EquipmentWithDerived[];
  today: string;
  status: LoadStatus;
  errorMessage: string | null;
  filter: EquipmentFilter;
  setFilter: (filter: Partial<EquipmentFilter>) => void;
  unitView: UnitView;
  setUnitView: (view: UnitView) => void;
  getEquipment: (tag: string) => EquipmentWithDerived | undefined;
  updateActivity: (equipmentId: string, activityId: string, edit: ActivityEdit) => void;
  updateEquipmentMeta: (
    equipmentId: string,
    patch: Partial<Pick<Equipment, "status" | "notes" | "responsible">>
  ) => void;
}

const UnitsContext = createContext<UnitsContextValue | null>(null);

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || "Falha ao comunicar com o servidor.";
  } catch {
    return "Falha ao comunicar com o servidor.";
  }
}

export function UnitsDataProvider({ children }: { children: React.ReactNode }) {
  const [equipmentRaw, setEquipmentRaw] = useState<Equipment[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilterState] = useState<EquipmentFilter>({ status: "TODOS", search: "" });
  const [unitView, setUnitView] = useState<UnitView>("TODAS");
  const today = useMemo(() => todayISO(), []);
  const hasLoadedOnce = useRef(false);

  const fetchEquipment = useCallback(async () => {
    try {
      const res = await fetch("/api/equipment", { cache: "no-store" });
      if (!res.ok) {
        const message = await parseErrorMessage(res);
        if (!hasLoadedOnce.current) {
          setStatus("error");
          setErrorMessage(message);
        } else {
          console.error("Falha ao atualizar equipamentos:", message);
        }
        return;
      }
      const body = await res.json();
      setEquipmentRaw(body.equipment);
      hasLoadedOnce.current = true;
      setStatus("ready");
      setErrorMessage(null);
    } catch (err) {
      if (!hasLoadedOnce.current) {
        setStatus("error");
        setErrorMessage("Não foi possível conectar ao servidor.");
      } else {
        console.error("Falha ao atualizar equipamentos:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
    const interval = setInterval(fetchEquipment, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchEquipment]);

  const setFilter = useCallback((patch: Partial<EquipmentFilter>) => {
    setFilterState((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateActivity = useCallback(
    (equipmentId: string, activityId: string, edit: ActivityEdit) => {
      fetch(`/api/equipment/${equipmentId}/activity`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId, edit }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await parseErrorMessage(res));
          const body = await res.json();
          setEquipmentRaw((prev) => prev.map((e) => (e.id === equipmentId ? body.equipment : e)));
        })
        .catch((err) => {
          console.error("Falha ao salvar atividade:", err);
          fetchEquipment();
        });
    },
    [fetchEquipment]
  );

  const updateEquipmentMeta = useCallback(
    (equipmentId: string, patch: Partial<Pick<Equipment, "status" | "notes" | "responsible">>) => {
      setEquipmentRaw((prev) => prev.map((e) => (e.id === equipmentId ? { ...e, ...patch } : e)));
      fetch(`/api/equipment/${equipmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await parseErrorMessage(res));
          const body = await res.json();
          setEquipmentRaw((prev) => prev.map((e) => (e.id === equipmentId ? body.equipment : e)));
        })
        .catch((err) => {
          console.error("Falha ao salvar equipamento:", err);
          fetchEquipment();
        });
    },
    [fetchEquipment]
  );

  const equipment = useMemo(() => withDerived(equipmentRaw, today), [equipmentRaw, today]);

  const getEquipment = useCallback(
    (tag: string) => equipment.find((e) => e.tag.toLowerCase() === tag.toLowerCase()),
    [equipment]
  );

  const value: UnitsContextValue = {
    equipment,
    today,
    status,
    errorMessage,
    filter,
    setFilter,
    unitView,
    setUnitView,
    getEquipment,
    updateActivity,
    updateEquipmentMeta,
  };

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
}

export function useUnitsData(): UnitsContextValue {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error("useUnitsData must be used within UnitsDataProvider");
  return ctx;
}

export type { EquipmentStatus };
