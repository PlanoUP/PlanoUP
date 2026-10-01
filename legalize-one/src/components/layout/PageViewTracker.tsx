import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { track } from '@/lib/analytics'

/** Uma visualização de página por rota (mudanças só de ?query/#hash não contam). */
export function PageViewTracker() {
  const { pathname } = useLocation()
  useEffect(() => {
    track('page_viewed', { path: pathname })
  }, [pathname])
  return null
}
