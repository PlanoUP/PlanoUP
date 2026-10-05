import type { Factor, SupabaseClient } from '@supabase/supabase-js'
import { requireSupabase } from '@/lib/supabase'

/**
 * Verificação em duas etapas (senha + código de 6 dígitos de um aplicativo autenticador).
 * A exigência real está no banco (migration 0007) e na função `team`; aqui fica a interface.
 *
 * - `challenge`: o usuário ativou a verificação e ainda não digitou o código nesta sessão.
 * - `enroll_required`: administrador da plataforma sem verificação ativada (obrigatória para ele).
 */
export type MfaStatus = 'ok' | 'challenge' | 'enroll_required'

/** Nome que aparece no aplicativo autenticador. */
const ISSUER = 'Painel Legalize One'

export async function mfaStatusOf(supabase: SupabaseClient, isPlatformAdmin: boolean): Promise<MfaStatus> {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (data?.currentLevel === 'aal1' && data.nextLevel === 'aal2') return 'challenge'
  if (isPlatformAdmin && data?.currentLevel !== 'aal2') return 'enroll_required'
  return 'ok'
}

export function friendlyMfaError(message: string): string {
  if (/invalid|code|totp/i.test(message)) return 'Código incorreto ou expirado. Confira o aplicativo e digite o código atual.'
  if (/rate|too many/i.test(message)) return 'Muitas tentativas. Aguarde um minuto e tente de novo.'
  if (/aal2|assurance/i.test(message)) return 'Confirme seu código de verificação antes de alterar esta configuração.'
  return 'Não foi possível concluir agora. Tente novamente em instantes.'
}

/** Confere o código de um fator já ativado (login) ou recém-cadastrado (ativação). */
export async function verifyTotp(code: string, factorId?: string): Promise<{ error?: string }> {
  const supabase = await requireSupabase()
  let id = factorId
  if (!id) {
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error) return { error: friendlyMfaError(error.message) }
    id = data.totp[0]?.id
    if (!id) return { error: 'Nenhum aplicativo autenticador ativado nesta conta.' }
  }
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: id, code: code.replace(/\D/g, '') })
  return error ? { error: friendlyMfaError(error.message) } : {}
}

/** Fatores TOTP confirmados do usuário logado. */
export async function verifiedFactors(): Promise<Factor[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) throw new Error(friendlyMfaError(error.message))
  return data.totp
}

export interface Enrollment {
  factorId: string
  /** Imagem do QR code (data URL SVG). */
  qrCode: string
  /** Chave para digitar no aplicativo, se não der para ler o QR. */
  secret: string
  /** Link otpauth:// (abre o aplicativo direto no celular). */
  uri: string
}

/** Começa a ativação: gera o QR code. Cadastros anteriores não confirmados são descartados. */
export async function startEnrollment(): Promise<Enrollment> {
  const supabase = await requireSupabase()
  const { data: list } = await supabase.auth.mfa.listFactors()
  for (const f of list?.all ?? []) {
    if (f.status === 'unverified') await supabase.auth.mfa.unenroll({ factorId: f.id })
  }
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: ISSUER,
    friendlyName: `Celular ${new Date().toISOString().slice(0, 16)}`,
  })
  if (error) throw new Error(friendlyMfaError(error.message))
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret, uri: data.totp.uri }
}

export async function removeFactor(factorId: string): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.auth.mfa.unenroll({ factorId })
  if (error) throw new Error(friendlyMfaError(error.message))
  await supabase.auth.refreshSession()
}
