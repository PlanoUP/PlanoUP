import { integrations } from '@/config/site'

/**
 * MODO DUPLO da plataforma.
 * - Sem VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY: o site usa o catálogo local (src/data) e a marca
 *   padrão — exatamente o comportamento da V1. Nada é gravado.
 * - Com as duas variáveis: imobiliária, imóveis, leads e eventos passam a vir/ir para o Supabase,
 *   protegidos por RLS no banco.
 * A anon key é pública por design (a segurança está nas políticas do banco); a service_role NUNCA
 * entra no frontend.
 */
export function isBackendEnabled(): boolean {
  const { url, anonKey } = integrations.supabase
  return Boolean(url && anonKey)
}
