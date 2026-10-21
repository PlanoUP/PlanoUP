"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { EquipmentMapCoordinateOverride, EquipmentMapCoordinateOverrideInput } from "./types";

// See the same constant in lib/brava/context.tsx for why this isn't 8s anymore.
const POLL_INTERVAL_MS = 45000;

type LoadStatus = "loading" | "ready" | "error";

interface EquipmentMapCoordinatesContextValue {
  coordinates: EquipmentMapCoordinateOverride[];
  status: LoadStatus;
  saveCoordinate: (input: EquipmentMapCoordinateOverrideInput) => void;
  deleteCoordinate: (id: string) => void;
}

const EquipmentMapCoordinatesContext = createContext<EquipmentMapCoordinatesContextValue | null>(null);

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || "Falha ao comunicar com o servidor.";
  } catch {
    return "Falha ao comunicar com o servidor.";
  }
}

export function EquipmentMapCoordinatesProvider({ children }: { children: React.ReactNode }) {
  const [coordinates, setCoordinates] = useState<EquipmentMapCoordinateOverride[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const hasLoadedOnce = useRef(false);

  const fetchCoordinates = useCallback(async () => {
    try {
      const res = await fetch("/api/equipment-map-coordinates", { cache: "no-store" });
      if (!res.ok) {
        if (!hasLoadedOnce.current) setStatus("error");
        else console.error("Falha ao atualizar coordenadas:", await parseErrorMessage(res));
        return;
      }
      const body = await res.json();
      setCoordinates(body.coordinates);
      hasLoadedOnce.current = true;
      setStatus("ready");
    } catch (err) {
      if (!hasLoadedOnce.current) setStatus("error");
      else console.error("Falha ao atualizar coordenadas:", err);
    }
  }, []);

  useEffect(() => {
    fetchCoordinates();
    const interval = setInterval(fetchCoordinates, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchCoordinates]);

  const saveCoordinate = useCallback(
    (input: EquipmentMapCoordinateOverrideInput) => {
      const id = `${input.mapId}:${input.tag.toUpperCase()}`;
      const now = new Date().toISOString();
      setCoordinates((prev) => {
        const optimistic: EquipmentMapCoordinateOverride = {
          id,
          ...input,
          tag: input.tag.toUpperCase(),
          createdAt: now,
          updatedAt: now,
        };
        const withoutExisting = prev.filter((c) => c.id !== id);
        return [...withoutExisting, optimistic];
      });
      fetch("/api/equipment-map-coordinates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await parseErrorMessage(res));
          const body = await res.json();
          setCoordinates((prev) => [...prev.filter((c) => c.id !== body.coordinate.id), body.coordinate]);
        })
        .catch((err) => {
          console.error("Falha ao salvar coordenada:", err);
          fetchCoordinates();
        });
    },
    [fetchCoordinates]
  );

  const deleteCoordinate = useCallback(
    (id: string) => {
      setCoordinates((prev) => prev.filter((c) => c.id !== id));
      fetch(`/api/equipment-map-coordinates/${encodeURIComponent(id)}`, { method: "DELETE" }).catch((err) => {
        console.error("Falha ao remover coordenada:", err);
        fetchCoordinates();
      });
    },
    [fetchCoordinates]
  );

  const value: EquipmentMapCoordinatesContextValue = { coordinates, status, saveCoordinate, deleteCoordinate };

  return <EquipmentMapCoordinatesContext.Provider value={value}>{children}</EquipmentMapCoordinatesContext.Provider>;
}

export function useEquipmentMapCoordinatesData(): EquipmentMapCoordinatesContextValue {
  const ctx = useContext(EquipmentMapCoordinatesContext);
  if (!ctx) throw new Error("useEquipmentMapCoordinatesData must be used within EquipmentMapCoordinatesProvider");
  return ctx;
}
