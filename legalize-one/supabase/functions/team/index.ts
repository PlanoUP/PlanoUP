// Edge Function `team`: gestão da equipe da imobiliária (criar acesso, nova senha, papel, remover).
// Regras em ./core.ts. A chave de serviço (SUPABASE_SERVICE_ROLE_KEY) existe só aqui, no servidor.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { handleTeam, type TeamPort, type TeamRole } from './core.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  const url = Deno.env.get('SUPABASE_URL')!
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: caller, error: callerError } = await admin.auth.getUser(token)
  if (callerError || !caller?.user) return json(401, { error: 'not_signed_in' })
  // Cliente com a sessão de quem chamou (para ler o plano com as mesmas regras do painel).
  const asCaller = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let input: Record<string, unknown>
  try {
    input = await req.json()
  } catch {
    return json(400, { error: 'invalid_body' })
  }

  const port: TeamPort = {
    async isPlatformAdmin(userId) {
      const { data } = await admin.from('profiles').select('is_platform_admin').eq('id', userId).maybeSingle()
      return Boolean(data?.is_platform_admin)
    },
    async memberRole(tenantId, userId) {
      const { data } = await admin.from('tenant_members').select('role').eq('tenant_id', tenantId).eq('user_id', userId).maybeSingle()
      return (data?.role as TeamRole | undefined) ?? null
    },
    async listMembers(tenantId) {
      const { data, error } = await admin.from('tenant_members').select('user_id, role').eq('tenant_id', tenantId).order('created_at')
      if (error) throw error
      return (data ?? []).map((m) => ({ userId: m.user_id as string, role: m.role as TeamRole }))
    },
    async getUser(userId) {
      const { data } = await admin.auth.admin.getUserById(userId)
      const u = data?.user
      if (!u) return null
      const { data: profile } = await admin.from('profiles').select('full_name').eq('id', userId).maybeSingle()
      return {
        email: u.email ?? null,
        name: (profile?.full_name as string | null) ?? (u.user_metadata?.full_name as string | undefined) ?? null,
        lastSignInAt: u.last_sign_in_at ?? null,
        mustChangePassword: Boolean(u.user_metadata?.must_change_password),
      }
    },
    async findUserByEmail(email) {
      for (let page = 1; page <= 20; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
        if (error) throw error
        const found = data.users.find((u) => u.email?.toLowerCase() === email)
        if (found) return found.id
        if (data.users.length < 200) return null
      }
      return null
    },
    async createUser({ email, password, name }) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name, must_change_password: true },
      })
      if (error || !data.user) throw error ?? new Error('create_failed')
      await admin.from('profiles').update({ full_name: name }).eq('id', data.user.id)
      return data.user.id
    },
    async setTemporaryPassword(userId, password) {
      const { data } = await admin.auth.admin.getUserById(userId)
      const meta = { ...(data?.user?.user_metadata ?? {}), must_change_password: true }
      const { error } = await admin.auth.admin.updateUserById(userId, { password, user_metadata: meta })
      if (error) throw error
    },
    async addMember(tenantId, userId, role) {
      const { error } = await admin.from('tenant_members').insert({ tenant_id: tenantId, user_id: userId, role })
      if (error) throw error
    },
    async setRole(tenantId, userId, role) {
      const { error } = await admin.from('tenant_members').update({ role }).eq('tenant_id', tenantId).eq('user_id', userId)
      if (error) throw error
    },
    async removeMember(tenantId, userId) {
      const { error } = await admin.from('tenant_members').delete().eq('tenant_id', tenantId).eq('user_id', userId)
      if (error) throw error
    },
    async setBroker(tenantId, userId, { name, email, active }) {
      const { data: existing } = await admin.from('brokers').select('id').eq('tenant_id', tenantId).eq('user_id', userId).maybeSingle()
      if (existing) {
        const { error } = await admin.from('brokers').update({ active }).eq('id', existing.id)
        if (error) throw error
      } else if (active) {
        const { error } = await admin.from('brokers').insert({ tenant_id: tenantId, user_id: userId, name: name.slice(0, 120), email, active: true })
        if (error) throw error
      }
    },
    async limits(tenantId) {
      const { data } = await asCaller.rpc('tenant_entitlements', { p_tenant_id: tenantId })
      const limits = (data as { limits?: Record<string, number | null> } | null)?.limits ?? {}
      return { maxUsers: limits.max_users ?? null, maxBrokers: limits.max_brokers ?? null }
    },
    async countActiveBrokers(tenantId) {
      const { count } = await admin.from('brokers').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('active', true)
      return count ?? 0
    },
  }

  try {
    const result = await handleTeam(port, caller.user.id, input, (n) => crypto.getRandomValues(new Uint8Array(n)))
    return json(result.status, result.body)
  } catch (error) {
    console.error('team_error', error)
    return json(500, { error: 'internal_error' })
  }
})
