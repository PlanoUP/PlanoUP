import { requireSupabase } from '@/lib/supabase'
import { PanelError } from './propertiesApi'

/** Equipe da imobiliária via Edge Function `team` (a criação de logins exige a chave de serviço, que fica no servidor). */

export type TeamRole = 'owner' | 'admin' | 'broker'

export interface TeamMember {
  userId: string
  name: string | null
  email: string | null
  role: TeamRole
  lastSignInAt: string | null
  mustChangePassword: boolean
}

const MESSAGES: Record<string, string> = {
  not_allowed: 'Você não tem permissão para esta ação.',
  not_signed_in: 'Sua sessão expirou. Entre novamente.',
  invalid_name: 'Informe o nome completo.',
  invalid_email: 'E-mail inválido.',
  invalid_role: 'Papel inválido.',
  already_member: 'Esta pessoa já faz parte da equipe.',
  plan_limit_users: 'O plano atingiu o limite de usuários.',
  plan_limit_brokers: 'O plano atingiu o limite de corretores.',
  not_on_self: 'Para alterar seus próprios dados, use "Minha conta".',
  not_member: 'Esta pessoa não faz parte da equipe.',
  owner_role_fixed: 'O papel do responsável pela imobiliária não pode ser alterado aqui.',
  owner_cannot_be_removed: 'O responsável pela imobiliária não pode ser removido.',
}

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.functions.invoke('team', { body })
  if (error) {
    let code = ''
    try {
      code = ((await (error as { context?: Response }).context?.json()) as { error?: string } | undefined)?.error ?? ''
    } catch {
      /* resposta sem corpo */
    }
    throw new PanelError(MESSAGES[code] ?? 'Não foi possível concluir agora. Tente novamente em instantes.')
  }
  return data as T
}

export const listTeam = (tenantId: string) =>
  call<{ members: TeamMember[] }>({ action: 'list', tenantId }).then((r) => r.members)

export const addTeamMember = (tenantId: string, input: { name: string; email: string; role: 'owner' | 'admin' | 'broker' }) =>
  call<{ userId: string; temporaryPassword: string | null; existingAccount: boolean }>({ action: 'create', tenantId, ...input })

export const resetTeamPassword = (tenantId: string, userId: string) =>
  call<{ temporaryPassword: string }>({ action: 'reset_password', tenantId, userId })

export const setTeamRole = (tenantId: string, userId: string, role: 'admin' | 'broker') =>
  call<{ ok: true }>({ action: 'set_role', tenantId, userId, role })

export const removeTeamMember = (tenantId: string, userId: string) =>
  call<{ ok: true }>({ action: 'remove', tenantId, userId })

/** Mensagem pronta para enviar o acesso por WhatsApp. */
export function accessMessage(opts: { name: string; email: string; password: string; tenantName: string; loginUrl: string }): string {
  const first = opts.name.trim().split(/\s+/)[0]
  return [
    `Olá, ${first}! Seu acesso ao painel da ${opts.tenantName}:`,
    `Link: ${opts.loginUrl}`,
    `E-mail: ${opts.email}`,
    `Senha temporária: ${opts.password}`,
    'No primeiro acesso, o painel pede para você criar sua senha pessoal.',
  ].join('\n')
}
