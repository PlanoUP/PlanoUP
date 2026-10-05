import { createContext, useContext } from 'react'
import type { Role } from '@/lib/permissions'
import type { MfaStatus } from './mfa'

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
  /** Senha temporária (criada pelo gerente): o painel pede uma senha pessoal antes de continuar. */
  mustChangePassword: boolean
  /** Verificação em duas etapas: pendente de código, obrigatória a ativar, ou ok. */
  mfa: MfaStatus
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  /** Troca a senha de quem está logado (e encerra a pendência de senha temporária). */
  changePassword: (password: string) => Promise<{ error?: string }>
  updateName: (name: string) => Promise<{ error?: string }>
  /** Confere o código do aplicativo autenticador (segunda etapa do login). */
  verifyMfa: (code: string) => Promise<{ error?: string }>
  /** Relê usuário, vínculos e situação da verificação (ex.: depois de ativar/desativar). */
  refresh: () => Promise<void>
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

/** Erros ao trocar a senha, em linguagem simples. */
export function friendlyPasswordError(message: string): string {
  if (/should be different|same/i.test(message)) return 'A nova senha precisa ser diferente da atual.'
  if (/weak|at least|characters|pwned|leaked/i.test(message)) return 'Senha fraca ou já exposta em vazamentos. Escolha outra, com pelo menos 8 caracteres.'
  if (/reauthentication|session/i.test(message)) return 'Sua sessão expirou. Entre novamente para trocar a senha.'
  return 'Não foi possível trocar a senha agora. Tente novamente.'
}
