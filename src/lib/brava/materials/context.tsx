"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Material, MaterialInput } from "./types";

const POLL_INTERVAL_MS = 8000;

type LoadStatus = "loading" | "ready" | "error";

interface MaterialsContextValue {
  materials: Material[];
  status: LoadStatus;
  errorMessage: string | null;
  addMaterial: (input: MaterialInput) => void;
  updateMaterial: (id: string, patch: Partial<MaterialInput>) => void;
  deleteMaterial: (id: string) => void;
  duplicateMaterial: (id: string) => void;
  getMaterial: (id: string) => Material | undefined;
}

const MaterialsContext = createContext<MaterialsContextValue | null>(null);

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || "Falha ao comunicar com o servidor.";
  } catch {
    return "Falha ao comunicar com o servidor.";
  }
}

export function MaterialsDataProvider({ children }: { children: React.ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  const fetchMaterials = useCallback(async () => {
    try {
      const res = await fetch("/api/materials", { cache: "no-store" });
      if (!res.ok) {
        const message = await parseErrorMessage(res);
        if (!hasLoadedOnce.current) {
          setStatus("error");
          setErrorMessage(message);
        } else {
          console.error("Falha ao atualizar materiais:", message);
        }
        return;
      }
      const body = await res.json();
      setMaterials(body.materials);
      hasLoadedOnce.current = true;
      setStatus("ready");
      setErrorMessage(null);
    } catch (err) {
      if (!hasLoadedOnce.current) {
        setStatus("error");
        setErrorMessage("Não foi possível conectar ao servidor.");
      } else {
        console.error("Falha ao atualizar materiais:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
    const interval = setInterval(fetchMaterials, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchMaterials]);

  const addMaterial = useCallback(
    (input: MaterialInput) => {
      fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await parseErrorMessage(res));
          const body = await res.json();
          setMaterials((prev) => [...prev, body.material]);
        })
        .catch((err) => {
          console.error("Falha ao cadastrar material:", err);
          fetchMaterials();
        });
    },
    [fetchMaterials]
  );

  const updateMaterial = useCallback(
    (id: string, patch: Partial<MaterialInput>) => {
      setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
      fetch(`/api/materials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await parseErrorMessage(res));
          const body = await res.json();
          setMaterials((prev) => prev.map((m) => (m.id === id ? body.material : m)));
        })
        .catch((err) => {
          console.error("Falha ao atualizar material:", err);
          fetchMaterials();
        });
    },
    [fetchMaterials]
  );

  const deleteMaterial = useCallback(
    (id: string) => {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      fetch(`/api/materials/${id}`, { method: "DELETE" }).catch((err) => {
        console.error("Falha ao excluir material:", err);
        fetchMaterials();
      });
    },
    [fetchMaterials]
  );

  const duplicateMaterial = useCallback(
    (id: string) => {
      fetch(`/api/materials/${id}/duplicate`, { method: "POST" })
        .then(async (res) => {
          if (!res.ok) throw new Error(await parseErrorMessage(res));
          const body = await res.json();
          setMaterials((prev) => [...prev, body.material]);
        })
        .catch((err) => {
          console.error("Falha ao duplicar material:", err);
          fetchMaterials();
        });
    },
    [fetchMaterials]
  );

  const getMaterial = useCallback((id: string) => materials.find((m) => m.id === id), [materials]);

  const value: MaterialsContextValue = {
    materials,
    status,
    errorMessage,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    duplicateMaterial,
    getMaterial,
  };

  return <MaterialsContext.Provider value={value}>{children}</MaterialsContext.Provider>;
}

export function useMaterialsData(): MaterialsContextValue {
  const ctx = useContext(MaterialsContext);
  if (!ctx) throw new Error("useMaterialsData must be used within MaterialsDataProvider");
  return ctx;
}
