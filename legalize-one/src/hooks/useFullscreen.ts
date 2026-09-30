import { useCallback, useEffect, useState, type RefObject } from 'react'

/**
 * Tela cheia para um elemento. Usa a Fullscreen API quando disponível e,
 * em navegadores sem suporte (ex.: Safari no iPhone), cai para um modo
 * "tela cheia" via CSS controlado por `pseudo`.
 */
export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [native, setNative] = useState(false)
  const [pseudo, setPseudo] = useState(false)

  useEffect(() => {
    const onChange = () => setNative(document.fullscreenElement === ref.current && ref.current !== null)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [ref])

  useEffect(() => {
    if (!pseudo) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPseudo(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [pseudo])

  const toggle = useCallback(async () => {
    const el = ref.current
    if (!el) return
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined)
      return
    }
    if (pseudo) {
      setPseudo(false)
      return
    }
    if (document.fullscreenEnabled && typeof el.requestFullscreen === 'function') {
      try {
        await el.requestFullscreen()
        return
      } catch {
        // Recusado pelo navegador: usa o modo via CSS.
      }
    }
    setPseudo(true)
  }, [ref, pseudo])

  return { isFullscreen: native || pseudo, pseudo, toggle }
}
