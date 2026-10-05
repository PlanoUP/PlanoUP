/**
 * Equipe da imobiliária — regras (sem dependências de Deno/Supabase, testadas no Vitest).
 * A Edge Function `team` (index.ts) liga estas regras à API de administração do Supabase,
 * que exige a chave de serviço e por isso nunca roda no navegador.
 */
export type TeamRole = 'owner' | 'admin' | 'broker'

export interface TeamMember {
  userId: string
  name: string | null
  email: string | null
  role: TeamRole
  lastSignInAt: string | null
  mustChangePassword: boolean
}

export interface TeamPort {
  isPlatformAdmin(userId: string): Promise<boolean>
  memberRole(tenantId: string, userId: string): Promise<TeamRole | null>
  listMembers(tenantId: string): Promise<{ userId: string; role: TeamRole }[]>
  getUser(userId: string): Promise<{ email: string | null; name: string | null; lastSignInAt: string | null; mustChangePassword: boolean } | null>
  findUserByEmail(email: string): Promise<string | null>
  createUser(input: { email: string; password: string; name: string }): Promise<string>
  setTemporaryPassword(userId: string, password: string): Promise<void>
  addMember(tenantId: string, userId: string, role: TeamRole): Promise<void>
  setRole(tenantId: string, userId: string, role: TeamRole): Promise<void>
  removeMember(tenantId: string, userId: string): Promise<void>
  /** Cadastro de corretor (ativo/inativo) ligado ao login. */
  setBroker(tenantId: string, userId: string, info: { name: string; email: string | null; active: boolean }): Promise<void>
  limits(tenantId: string): Promise<{ maxUsers: number | null; maxBrokers: number | null }>
  countActiveBrokers(tenantId: string): Promise<number>
}

export interface TeamResult {
  status: number
  body: Record<string, unknown>
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

/** Senha temporária legível: 3 blocos de 4 (sem 0/O, 1/l/I). ~70 bits. */
export function temporaryPassword(random: (n: number) => Uint8Array): string {
  const bytes = random(12)
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length])
  return [chars.slice(0, 4), chars.slice(4, 8), chars.slice(8, 12)].map((c) => c.join('')).join('-')
}

const fail = (status: number, error: string): TeamResult => ({ status, body: { error } })
const isManagerRole = (r: TeamRole | null) => r === 'owner' || r === 'admin'

export async function handleTeam(
  port: TeamPort,
  callerId: string,
  input: Record<string, unknown>,
  random: (n: number) => Uint8Array,
): Promise<TeamResult> {
  const action = String(input.action ?? '')
  const tenantId = String(input.tenantId ?? '')
  if (!tenantId) return fail(400, 'tenant_required')

  const platform = await port.isPlatformAdmin(callerId)
  const callerRole = await port.memberRole(tenantId, callerId)
  if (!platform && !isManagerRole(callerRole)) return fail(403, 'not_allowed')

  if (action === 'list') {
    const members = await port.listMembers(tenantId)
    const out: TeamMember[] = []
    for (const m of members) {
      const u = await port.getUser(m.userId)
      out.push({
        userId: m.userId,
        role: m.role,
        name: u?.name ?? null,
        email: u?.email ?? null,
        lastSignInAt: u?.lastSignInAt ?? null,
        mustChangePassword: u?.mustChangePassword ?? false,
      })
    }
    return { status: 200, body: { members: out } }
  }

  if (action === 'create') {
    const name = String(input.name ?? '').trim()
    const email = String(input.email ?? '').trim().toLowerCase()
    const role = input.role as TeamRole
    if (name.length < 2 || name.length > 120) return fail(400, 'invalid_name')
    if (!EMAIL.test(email)) return fail(400, 'invalid_email')
    // O responsável (owner) só é definido pela plataforma, ao implantar uma imobiliária nova.
    if (role !== 'admin' && role !== 'broker' && !(role === 'owner' && platform)) return fail(400, 'invalid_role')

    const { maxUsers, maxBrokers } = await port.limits(tenantId)
    const members = await port.listMembers(tenantId)
    if (maxUsers !== null && members.length >= maxUsers) return fail(409, 'plan_limit_users')
    if (role === 'broker' && maxBrokers !== null && (await port.countActiveBrokers(tenantId)) >= maxBrokers)
      return fail(409, 'plan_limit_brokers')

    let userId = await port.findUserByEmail(email)
    let password: string | null = null
    if (userId) {
      if (members.some((m) => m.userId === userId)) return fail(409, 'already_member')
    } else {
      password = temporaryPassword(random)
      userId = await port.createUser({ email, password, name })
    }
    await port.addMember(tenantId, userId, role)
    if (role === 'broker') await port.setBroker(tenantId, userId, { name, email, active: true })
    return { status: 200, body: { userId, temporaryPassword: password, existingAccount: password === null } }
  }

  // Ações sobre uma pessoa da equipe.
  const userId = String(input.userId ?? '')
  if (!userId) return fail(400, 'user_required')
  if (userId === callerId) return fail(400, 'not_on_self')
  const targetRole = await port.memberRole(tenantId, userId)
  if (!targetRole) return fail(404, 'not_member')
  const targetIsPlatform = await port.isPlatformAdmin(userId)
  // Responsável (owner) e admin da plataforma só são alterados por quem está acima deles.
  if (targetRole === 'owner' && !platform && callerRole !== 'owner') return fail(403, 'not_allowed')
  if (targetIsPlatform && !platform) return fail(403, 'not_allowed')

  if (action === 'reset_password') {
    const password = temporaryPassword(random)
    await port.setTemporaryPassword(userId, password)
    return { status: 200, body: { temporaryPassword: password } }
  }

  if (action === 'set_role') {
    const role = input.role as TeamRole
    if (role !== 'admin' && role !== 'broker') return fail(400, 'invalid_role')
    if (targetRole === 'owner') return fail(400, 'owner_role_fixed')
    if (role === targetRole) return { status: 200, body: { ok: true } }
    if (role === 'broker') {
      const { maxBrokers } = await port.limits(tenantId)
      if (maxBrokers !== null && (await port.countActiveBrokers(tenantId)) >= maxBrokers) return fail(409, 'plan_limit_brokers')
    }
    await port.setRole(tenantId, userId, role)
    const u = await port.getUser(userId)
    await port.setBroker(tenantId, userId, { name: u?.name || u?.email || 'Corretor', email: u?.email ?? null, active: role === 'broker' })
    return { status: 200, body: { ok: true } }
  }

  if (action === 'remove') {
    if (targetRole === 'owner') return fail(400, 'owner_cannot_be_removed')
    await port.removeMember(tenantId, userId)
    const u = await port.getUser(userId)
    await port.setBroker(tenantId, userId, { name: u?.name || u?.email || 'Corretor', email: u?.email ?? null, active: false })
    return { status: 200, body: { ok: true } }
  }

  return fail(400, 'unknown_action')
}
