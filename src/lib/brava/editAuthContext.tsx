"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface EditAuthContextValue {
  isEditor: boolean;
  modalOpen: boolean;
  unlockError: string | null;
  closeModal: () => void;
  /** Returns true if already unlocked; otherwise opens the password modal and returns false. */
  requireEditor: () => boolean;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
}

const EditAuthContext = createContext<EditAuthContextValue | null>(null);

export function EditAuthProvider({ children }: { children: React.ReactNode }) {
  const [isEditor, setIsEditor] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/status", { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => setIsEditor(!!body.editable))
      .catch(() => {});
  }, []);

  const requireEditor = useCallback(() => {
    if (isEditor) return true;
    setUnlockError(null);
    setModalOpen(true);
    return false;
  }, [isEditor]);

  const unlock = useCallback(async (password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setUnlockError(body.message || "Senha incorreta.");
        return false;
      }
      setIsEditor(true);
      setModalOpen(false);
      setUnlockError(null);
      return true;
    } catch {
      setUnlockError("Falha ao conectar com o servidor.");
      return false;
    }
  }, []);

  const lock = useCallback(() => {
    setIsEditor(false);
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return (body.message as string) || "Falha ao trocar a senha.";
      }
      return null;
    } catch {
      return "Falha ao conectar com o servidor.";
    }
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const value: EditAuthContextValue = {
    isEditor,
    modalOpen,
    unlockError,
    closeModal,
    requireEditor,
    unlock,
    lock,
    changePassword,
  };

  return <EditAuthContext.Provider value={value}>{children}</EditAuthContext.Provider>;
}

export function useEditAuth(): EditAuthContextValue {
  const ctx = useContext(EditAuthContext);
  if (!ctx) throw new Error("useEditAuth must be used within EditAuthProvider");
  return ctx;
}
