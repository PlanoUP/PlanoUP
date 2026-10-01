import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from './context'

/** Rotas do painel: exige sessão; sem backend, explica que o painel não está ativo. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const location = useLocation()
  if (auth.status === 'loading') return <div className="min-h-dvh bg-sand" aria-busy="true" />
  if (auth.status !== 'signed_in') {
    return <Navigate to="/entrar" replace state={{ from: `${location.pathname}${location.search}` }} />
  }
  return children
}
