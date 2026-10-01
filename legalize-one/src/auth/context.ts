import { createContext, useContext } from 'react'
import type { Role } from '@/lib/permissions'

export interface Membership {
  tenantId: string
  tenantName: string
  tenantSlug: string
  role: Exclude<Role, 'platform_admin'>
}

export interface AuthState {
  /** `disabled` = backend não configurado neste ambiente. */
  status: 'disabled' | 'loading' | 'signed_out' | 'signed_in'
  userId: string | null
  email: string | null
  fullName: string | null
  isPlatformAdmin: boolean
  memberships: Membership[]
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}

/** Mensagens do Supabase Auth em linguagem simples. */
export function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'E-mail ou senha incorretos.'
  if (/email not confirmed/i.test(message)) return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).'
  if (/rate limit|too many/i.test(message)) return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'
  return 'Não foi possível entrar agora. Tente novamente em instantes.'
}
