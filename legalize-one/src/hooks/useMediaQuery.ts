import { useCallback, useSyncExternalStore } from 'react'

/** Assina uma media query. Útil quando o layout mobile/desktop muda a árvore, não só o estilo. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const useIsSmUp = () => useMediaQuery('(min-width: 640px)')
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
