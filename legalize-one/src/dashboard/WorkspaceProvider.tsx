import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/auth/context'
import { useAsyncData } from '@/hooks/useAsyncData'
import { requireSupabase } from '@/lib/supabase'
import { WorkspaceContext, type Workspace, type WorkspaceState } from './workspace'

const STORAGE_KEY = 'legalize:panel-tenant'

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

interface TenantRow {
  id: string
  name: string
  slug: string
}

/**
 * Define a imobiliária ativa do painel. Membro: as imobiliárias em que trabalha.
 * Admin da plataforma: todas (com o papel dele, ou "admin da plataforma" onde não é membro).
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const [selected, setSelected] = useState<string | null>(readStored)
  const [version, setVersion] = useState(0)

  const { data: allTenants, loading: loadingTenants } = useAsyncData(async (): Promise<TenantRow[]> => {
    if (!auth.isPlatformAdmin) return []
    const supabase = await requireSupabase()
    const { data, error } = await supabase.from('tenants').select('id, name, slug').order('name')
    if (error) throw error
    return (data ?? []) as TenantRow[]
  }, `${auth.userId}:${auth.isPlatformAdmin}:${version}`)

  const options = useMemo(() => {
    const map = new Map<string, { tenantId: string; tenantName: string; tenantSlug: string }>()
    for (const m of auth.memberships) map.set(m.tenantId, { tenantId: m.tenantId, tenantName: m.tenantName, tenantSlug: m.tenantSlug })
    for (const t of allTenants ?? []) if (!map.has(t.id)) map.set(t.id, { tenantId: t.id, tenantName: t.name, tenantSlug: t.slug })
    return [...map.values()]
  }, [auth.memberships, allTenants])

  const active = options.find((o) => o.tenantId === selected) ?? options[0] ?? null
  const membership = active ? auth.memberships.find((m) => m.tenantId === active.tenantId) : undefined

  const { data: brokerId, loading: loadingBroker } = useAsyncData(async () => {
    if (!active || !auth.userId) return null
    const supabase = await requireSupabase()
    const { data } = await supabase
      .from('brokers')
      .select('id')
      .eq('tenant_id', active.tenantId)
      .eq('user_id', auth.userId)
      .eq('active', true)
      .maybeSingle()
    return (data?.id as string | undefined) ?? null
  }, `${active?.tenantId}:${auth.userId}`)

  const allowed = Boolean(active && (membership || auth.isPlatformAdmin))
  const role = membership?.role ?? 'platform_admin'
  const current = useMemo<Workspace | null>(
    () => (active && allowed ? { ...active, role, brokerId: brokerId ?? null } : null),
    [active, allowed, role, brokerId],
  )

  const select = useCallback((tenantId: string) => {
    setSelected(tenantId)
    try {
      localStorage.setItem(STORAGE_KEY, tenantId)
    } catch {
      /* preferência opcional */
    }
  }, [])

  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  const value = useMemo<WorkspaceState>(() => ({ current, options, select, refresh }), [current, options, select, refresh])

  if ((auth.isPlatformAdmin && loadingTenants && !allTenants) || (active && loadingBroker && brokerId === undefined)) {
    return <div className="min-h-dvh bg-sand" aria-busy="true" />
  }
  return <WorkspaceContext value={value}>{children}</WorkspaceContext>
}
