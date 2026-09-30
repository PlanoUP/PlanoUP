import { useEffect, useId, type RefObject } from 'react'
import { setStickySuppressed } from '@/lib/uiStore'

/**
 * Esconde o CTA fixo do mobile enquanto o elemento estiver visível — para
 * quando a própria seção já oferece a mesma ação (ex.: busca do hero).
 */
export function useSuppressStickyCta(ref: RefObject<HTMLElement | null>) {
  const id = useId()
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setStickySuppressed(id, entry.isIntersecting), {
      threshold: 0.15,
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      setStickySuppressed(id, false)
    }
  }, [ref, id])
}
