"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { EquipmentCostEntry, EquipmentCostEntryInput } from "./types";

const POLL_INTERVAL_MS = 8000;

type LoadStatus = "loading" | "ready" | "error";

interface EquipmentCostsContextValue {
  costs: EquipmentCostEntry[];
  status: LoadStatus;
  errorMessage: string | null;
  addCost: (input: EquipmentCostEntryInput) => void;
  updateCost: (id: string, patch: Partial<EquipmentCostEntryInput>) => void;
  deleteCost: (id: string) => void;
}

const EquipmentCostsContext = createContext<EquipmentCostsContextValue | null>(null);

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || "Falha ao comunicar com o servidor.";
  } catch {
    return "Falha ao comunicar com o servidor.";
  }
}

export function EquipmentCostsDataProvider({ children }: { children: React.ReactNode }) {
  const [costs, setCosts] = useState<EquipmentCostEntry[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  const fetchCosts = useCallback(async () => {
    try {
      const res = await fetch("/api/equipment-costs", { cache: "no-store" });
      if (!res.ok) {
        const message = await parseErrorMessage(res);
        if (!hasLoadedOnce.current) {
          setStatus("error");
          setErrorMessage(message);
        } else {
          console.error("Falha ao atualizar custos:", message);
        }
        return;
      }
      const body = await res.json();
      setCosts(body.costs);
      hasLoadedOnce.current = true;
      setStatus("ready");
      setErrorMessage(null);
    } catch (err) {
      if (!hasLoadedOnce.current) {
        setStatus("error");
        setErrorMessage("Não foi possível conectar ao servidor.");
      } else {
        console.error("Falha ao atualizar custos:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchCosts();
    const interval = setInterval(fetchCosts, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchCosts]);

  const addCost = useCallback(
    (input: EquipmentCostEntryInput) => {
      fetch("/api/equipment-costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await parseErrorMessage(res));
          const body = await res.json();
          setCosts((prev) => [...prev, body.cost]);
        })
        .catch((err) => {
          console.error("Falha ao cadastrar custo:", err);
          fetchCosts();
        });
    },
    [fetchCosts]
  );

  const updateCost = useCallback(
    (id: string, patch: Partial<EquipmentCostEntryInput>) => {
      setCosts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      fetch(`/api/equipment-costs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await parseErrorMessage(res));
          const body = await res.json();
          setCosts((prev) => prev.map((c) => (c.id === id ? body.cost : c)));
        })
        .catch((err) => {
          console.error("Falha ao atualizar custo:", err);
          fetchCosts();
        });
    },
    [fetchCosts]
  );

  const deleteCost = useCallback(
    (id: string) => {
      setCosts((prev) => prev.filter((c) => c.id !== id));
      fetch(`/api/equipment-costs/${id}`, { method: "DELETE" }).catch((err) => {
        console.error("Falha ao excluir custo:", err);
        fetchCosts();
      });
    },
    [fetchCosts]
  );

  const value: EquipmentCostsContextValue = { costs, status, errorMessage, addCost, updateCost, deleteCost };

  return <EquipmentCostsContext.Provider value={value}>{children}</EquipmentCostsContext.Provider>;
}

export function useEquipmentCostsData(): EquipmentCostsContextValue {
  const ctx = useContext(EquipmentCostsContext);
  if (!ctx) throw new Error("useEquipmentCostsData must be used within EquipmentCostsDataProvider");
  return ctx;
}
