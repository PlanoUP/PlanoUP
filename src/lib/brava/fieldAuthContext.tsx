"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface FieldUserPublic {
  id: string;
  name: string;
  username: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FieldAuthContextValue {
  fieldUser: FieldUserPublic | null;
  loading: boolean;
  /** Returns an error message on failure, or null on success. */
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const FieldAuthContext = createContext<FieldAuthContextValue | null>(null);

export function FieldAuthProvider({ children }: { children: React.ReactNode }) {
  const [fieldUser, setFieldUser] = useState<FieldUserPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/field-auth/status", { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => setFieldUser(body.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch("/api/field-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return (body.message as string) || "Usuário ou senha incorretos.";
      }
      const body = await res.json();
      setFieldUser(body.user);
      return null;
    } catch {
      return "Falha ao conectar com o servidor.";
    }
  }, []);

  const logout = useCallback(() => {
    setFieldUser(null);
    fetch("/api/field-auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  const value: FieldAuthContextValue = { fieldUser, loading, login, logout };

  return <FieldAuthContext.Provider value={value}>{children}</FieldAuthContext.Provider>;
}

export function useFieldAuth(): FieldAuthContextValue {
  const ctx = useContext(FieldAuthContext);
  if (!ctx) throw new Error("useFieldAuth must be used within FieldAuthProvider");
  return ctx;
}
