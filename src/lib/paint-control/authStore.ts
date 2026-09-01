"use client";

import { create } from "zustand";
import { isSupabaseConfigured, supabase } from "@/lib/paint-control/supabaseClient";

// Single shared "editor" account behind a Supabase Auth login. This is the
// real security boundary — RLS policies (see supabase/schema.sql) only
// allow INSERT/UPDATE/DELETE for authenticated users, so a write attempt
// still fails server-side even if someone bypasses this UI. Everyone can
// read without logging in.
const EDITOR_EMAIL = "equipe@paintcontrol.ati";

interface AuthState {
  isEditor: boolean;
  authModalOpen: boolean;
  signIn: (password: string) => Promise<string | null>;
  signOut: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  /** Call before any write action. Returns true if allowed to proceed; otherwise opens the login modal and returns false. */
  requireEditor: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // Local-only mode has no shared backend to protect — editing is always allowed.
  isEditor: !isSupabaseConfigured,
  authModalOpen: false,

  signIn: async (password) => {
    if (!isSupabaseConfigured) return null;
    const { error } = await supabase!.auth.signInWithPassword({
      email: EDITOR_EMAIL,
      password,
    });
    if (error) return "Senha incorreta.";
    set({ isEditor: true, authModalOpen: false });
    return null;
  },

  signOut: () => {
    if (!isSupabaseConfigured) return;
    void supabase!.auth.signOut();
    set({ isEditor: false });
  },

  openAuthModal: () => set({ authModalOpen: true }),
  closeAuthModal: () => set({ authModalOpen: false }),

  requireEditor: () => {
    if (get().isEditor) return true;
    set({ authModalOpen: true });
    return false;
  },
}));

if (isSupabaseConfigured && typeof window !== "undefined") {
  supabase!.auth.getSession().then(({ data }) => {
    useAuthStore.setState({ isEditor: Boolean(data.session) });
  });
  supabase!.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ isEditor: Boolean(session) });
  });
}
