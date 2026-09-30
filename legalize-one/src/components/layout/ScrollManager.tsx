import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * Rola para o topo ao trocar de página e para a âncora quando houver `#hash`.
 * Páginas são carregadas sob demanda: a âncora é procurada por até 2s.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    const id = decodeURIComponent(hash.slice(1))
    let tries = 0
    let timer = 0
    const attempt = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (++tries < 20) timer = window.setTimeout(attempt, 100)
    }
    timer = window.setTimeout(attempt, 60)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  return null
}
