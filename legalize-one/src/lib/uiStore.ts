import { useSyncExternalStore } from 'react'

/**
 * Estado global mínimo de UI (sem bibliotecas):
 * - pilha de camadas sobrepostas (menu, bottom sheets, tour imersivo) para
 *   saber qual camada responde ao Esc, travar o scroll e esconder o CTA fixo;
 * - ações contextuais do CTA fixo do mobile (ex.: página do imóvel).
 */

export interface StickyAction {
  label: string
  href?: string
  to?: string
  kind: 'whatsapp' | 'primary'
  icon?: 'whatsapp' | 'search' | 'calendar'
  onClick?: () => void
  external?: boolean
}

interface UiState {
  overlays: string[]
  stickyActions: StickyAction[] | null
  /** Elementos que dispensam o CTA fixo enquanto visíveis (ex.: busca do hero). */
  stickySuppressors: string[]
}

let state: UiState = { overlays: [], stickyActions: null, stickySuppressors: [] }
const listeners = new Set<() => void>()

function emit(next: Partial<UiState>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function syncScrollLock() {
  document.documentElement.style.overflow = state.overlays.length ? 'hidden' : ''
}

/** Registra uma camada sobreposta. Retorna a função que a remove. */
export function pushOverlay(id: string): () => void {
  emit({ overlays: [...state.overlays.filter((o) => o !== id), id] })
  syncScrollLock()
  return () => {
    emit({ overlays: state.overlays.filter((o) => o !== id) })
    syncScrollLock()
  }
}

export function isTopOverlay(id: string): boolean {
  return state.overlays[state.overlays.length - 1] === id
}

export function setStickyActions(actions: StickyAction[] | null) {
  emit({ stickyActions: actions })
}

export function useOverlayCount(): number {
  return useSyncExternalStore(subscribe, () => state.overlays.length, () => 0)
}

export function useIsOverlayOpen(id: string): boolean {
  return useSyncExternalStore(subscribe, () => state.overlays.includes(id), () => false)
}

export function useStickyActions(): StickyAction[] | null {
  return useSyncExternalStore(subscribe, () => state.stickyActions, () => null)
}

export function setStickySuppressed(id: string, suppressed: boolean) {
  const others = state.stickySuppressors.filter((s) => s !== id)
  emit({ stickySuppressors: suppressed ? [...others, id] : others })
}

export function useStickySuppressed(): boolean {
  return useSyncExternalStore(subscribe, () => state.stickySuppressors.length > 0, () => false)
}
