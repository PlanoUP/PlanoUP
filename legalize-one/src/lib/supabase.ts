import type { SupabaseClient } from '@supabase/supabase-js'
import { integrations } from '@/config/site'
import { isBackendEnabled } from './backend'

let clientPromise: Promise<SupabaseClient> | null = null

/**
 * Cliente Supabase carregado sob demanda (chunk separado): quem não usa o backend
 * não baixa a biblioteca. Retorna `null` quando o backend não está configurado.
 */
export function getSupabase(): Promise<SupabaseClient> | null {
  if (!isBackendEnabled()) return null
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(integrations.supabase.url, integrations.supabase.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    }),
  )
  return clientPromise
}

/** Versão que exige o backend (para fluxos que só existem com ele, ex.: painel). */
export async function requireSupabase(): Promise<SupabaseClient> {
  const client = getSupabase()
  if (!client) throw new Error('backend_not_configured')
  return client
}
