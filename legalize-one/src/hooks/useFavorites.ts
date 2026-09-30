import { useCallback, useSyncExternalStore } from 'react'
import { track } from '@/lib/analytics'

const STORAGE_KEY = 'legalize:favorites'
const listeners = new Set<() => void>()

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

let cache: string[] = typeof window === 'undefined' ? [] : read()

function write(next: string[]) {
  cache = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Armazenamento indisponível (modo privado): mantém apenas em memória.
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Favoritos locais. Futuramente sincronizados com o perfil do usuário no Supabase. */
export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, () => cache, () => cache)

  const toggle = useCallback((id: string) => {
    const isFavorite = cache.includes(id)
    write(isFavorite ? cache.filter((v) => v !== id) : [...cache, id])
    track('property_favorited', { property_id: id, value: !isFavorite })
  }, [])

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])

  return { favorites, toggle, isFavorite }
}
