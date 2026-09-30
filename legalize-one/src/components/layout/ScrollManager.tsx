import { useEffect } from 'react'
import { useLocation } from 'react-router'

/** Rola para o topo ao trocar de página e para a âncora quando houver `#hash`. */
export function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // Aguarda a renderização da página de destino.
      const timer = window.setTimeout(() => {
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' })
      }, 60)
      return () => window.clearTimeout(timer)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
