import type { SupabaseClient, User } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getSupabase } from '@/lib/supabase'
import { AuthContext, friendlyAuthError, type AuthState, type Membership } from './context'

type Snapshot = Pick<AuthState, 'status' | 'userId' | 'email' | 'fullName' | 'isPlatformAdmin' | 'memberships'>

const SIGNED_OUT: Snapshot = { status: 'signed_out', userId: null, email: null, fullName: null, isPlatformAdmin: false, memberships: [] }

async function loadUser(supabase: SupabaseClient, user: User): Promise<Snapshot> {
  const [{ data: profile }, { data: members }] = await Promise.all([
    supabase.from('profiles').select('full_name, is_platform_admin').eq('id', user.id).maybeSingle(),
    supabase.from('tenant_members').select('tenant_id, role, tenants(name, slug)').eq('user_id', user.id),
  ])
  const memberships: Membership[] = (members ?? []).map((m) => {
    const tenant = (Array.isArray(m.tenants) ? m.tenants[0] : m.tenants) as { name: string; slug: string } | null
    return { tenantId: m.tenant_id as string, role: m.role as Membership['role'], tenantName: tenant?.name ?? '', tenantSlug: tenant?.slug ?? '' }
  })
  return {
    status: 'signed_in',
    userId: user.id,
    email: user.email ?? null,
    fullName: (profile?.full_name as string | null) ?? null,
    isPlatformAdmin: Boolean(profile?.is_platform_admin),
    memberships,
  }
}

/** Sessão do Supabase Auth + vínculos do usuário (imobiliárias e papéis). Só usado no painel. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const client = getSupabase()
  const [snapshot, setSnapshot] = useState<Snapshot>(() =>
    client ? { ...SIGNED_OUT, status: 'loading' } : { ...SIGNED_OUT, status: 'disabled' },
  )

  useEffect(() => {
    if (!client) return
    let active = true
    let unsubscribe = () => {}
    void client.then((supabase) => {
      const apply = (user: User | null) => {
        if (!user) return active && setSnapshot(SIGNED_OUT)
        void loadUser(supabase, user).then((s) => active && setSnapshot(s))
      }
      void supabase.auth.getSession().then(({ data }) => apply(data.session?.user ?? null))
      const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user ?? null))
      unsubscribe = () => data.subscription.unsubscribe()
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [client])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!client) return { error: 'O painel ainda não está ativado neste ambiente.' }
      const supabase = await client
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      return error ? { error: friendlyAuthError(error.message) } : {}
    },
    [client],
  )

  const signOut = useCallback(async () => {
    if (client) await (await client).auth.signOut()
  }, [client])

  const value = useMemo<AuthState>(() => ({ ...snapshot, signIn, signOut }), [snapshot, signIn, signOut])
  return <AuthContext value={value}>{children}</AuthContext>
}
