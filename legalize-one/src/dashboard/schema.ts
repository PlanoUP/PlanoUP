import { requireSupabase } from '@/lib/supabase'

let probe: Promise<boolean> | null = null

/**
 * O banco já recebeu as migrations da Fase 01 do Legalize Corretor (0013 e 0014)?
 * Enquanto não, as telas usam só o que já existe (funil de 6 etapas, perfil sem outras redes):
 * o mesmo código roda antes e depois da migração, sem quebrar.
 */
export function hasCorretorSchema(): Promise<boolean> {
  probe ??= (async () => {
    const supabase = await requireSupabase()
    const { error } = await supabase.from('crm_tasks').select('id', { head: true, count: 'exact' }).limit(1)
    return !error
  })().catch(() => false)
  return probe
}
