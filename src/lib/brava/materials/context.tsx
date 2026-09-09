"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Material, MaterialInput, MaterialHistoryEntry } from "./types";
import { MATERIAL_STATUS_META } from "./meta";

// Bump whenever the Material shape changes in a way that must override a
// browser's previously cached data — same rationale as brava-tanks-vN in
// lib/brava/context.tsx.
const STORAGE_KEY = "brava-materials-v1";

function genId(): string {
  return `mat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface MaterialsContextValue {
  materials: Material[];
  addMaterial: (input: MaterialInput) => Material;
  updateMaterial: (id: string, patch: Partial<MaterialInput>) => void;
  deleteMaterial: (id: string) => void;
  duplicateMaterial: (id: string) => void;
  getMaterial: (id: string) => Material | undefined;
}

const MaterialsContext = createContext<MaterialsContextValue | null>(null);

export function MaterialsDataProvider({ children }: { children: React.ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setMaterials(JSON.parse(raw));
    } catch {
      // ignore malformed/blocked storage — fall back to the empty seed
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
    } catch {
      // storage unavailable — edits stay in-memory for this session only
    }
  }, [materials, hydrated]);

  const addMaterial = useCallback((input: MaterialInput): Material => {
    const now = new Date().toISOString();
    const material: Material = {
      ...input,
      id: genId(),
      tankFamily: input.tankFamily ?? null,
      attachments: [],
      history: [
        { id: genId(), timestamp: now, field: "status", fromValue: null, toValue: input.status },
      ],
      createdAt: now,
      updatedAt: now,
    };
    setMaterials((prev) => [...prev, material]);
    return material;
  }, []);

  const updateMaterial = useCallback((id: string, patch: Partial<MaterialInput>) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const now = new Date().toISOString();
        const history: MaterialHistoryEntry[] = m.history;
        const nextHistory =
          patch.status && patch.status !== m.status
            ? [
                ...history,
                { id: genId(), timestamp: now, field: "status", fromValue: MATERIAL_STATUS_META[m.status].label, toValue: MATERIAL_STATUS_META[patch.status].label },
              ]
            : history;
        return { ...m, ...patch, history: nextHistory, updatedAt: now };
      })
    );
  }, []);

  const deleteMaterial = useCallback((id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const duplicateMaterial = useCallback((id: string) => {
    setMaterials((prev) => {
      const source = prev.find((m) => m.id === id);
      if (!source) return prev;
      const now = new Date().toISOString();
      const copy: Material = {
        ...source,
        id: genId(),
        description: `${source.description} (cópia)`,
        code: source.code ? `${source.code}-COPIA` : source.code,
        attachments: [],
        history: [
          { id: genId(), timestamp: now, field: "status", fromValue: null, toValue: MATERIAL_STATUS_META[source.status].label },
        ],
        createdAt: now,
        updatedAt: now,
      };
      return [...prev, copy];
    });
  }, []);

  const getMaterial = useCallback((id: string) => materials.find((m) => m.id === id), [materials]);

  const value = useMemo<MaterialsContextValue>(
    () => ({ materials, addMaterial, updateMaterial, deleteMaterial, duplicateMaterial, getMaterial }),
    [materials, addMaterial, updateMaterial, deleteMaterial, duplicateMaterial, getMaterial]
  );

  return <MaterialsContext.Provider value={value}>{children}</MaterialsContext.Provider>;
}

export function useMaterialsData(): MaterialsContextValue {
  const ctx = useContext(MaterialsContext);
  if (!ctx) throw new Error("useMaterialsData must be used within MaterialsDataProvider");
  return ctx;
}
