import { Outlet } from 'react-router'
import { AuthProvider } from '@/auth/AuthProvider'

/** Área logada (/entrar, /dashboard): carregada sob demanda; o site público não usa. */
export default function AuthRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
