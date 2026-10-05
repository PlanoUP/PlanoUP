import { beforeEach, describe, expect, it } from 'vitest'
import { handleTeam, temporaryPassword, type CallerSession, type TeamPort, type TeamRole } from '../../supabase/functions/team/core'

const T = 'tenant-1'
/** Sessão confirmada pelo código (aal2), sem pendências. */
const S: CallerSession = { aal: 'aal2', hasMfa: false }
let seq = 0
const random = (n: number) => Uint8Array.from({ length: n }, () => (seq++ * 37) % 256)

interface User {
  id: string
  email: string
  name: string
  platform?: boolean
  password?: string
  mustChange?: boolean
  mfa?: boolean
}

function makePort(maxUsers: number | null = null, maxBrokers: number | null = null) {
  const users: User[] = [
    { id: 'owner', email: 'dono@x.com', name: 'Dono' },
    { id: 'admin', email: 'gerente@x.com', name: 'Gerente' },
    { id: 'broker', email: 'corretor@x.com', name: 'Corretor' },
    { id: 'platform', email: 'plataforma@x.com', name: 'Plataforma', platform: true },
    { id: 'outsider', email: 'outra@x.com', name: 'Outra' },
  ]
  const members = new Map<string, TeamRole>([
    ['owner', 'owner'],
    ['admin', 'admin'],
    ['broker', 'broker'],
  ])
  const brokers = new Map<string, boolean>([['broker', true]])
  const port: TeamPort = {
    isPlatformAdmin: async (id) => Boolean(users.find((u) => u.id === id)?.platform),
    memberRole: async (_t, id) => members.get(id) ?? null,
    listMembers: async () => [...members].map(([userId, role]) => ({ userId, role })),
    getUser: async (id) => {
      const u = users.find((x) => x.id === id)
      return u ? { email: u.email, name: u.name, lastSignInAt: null, mustChangePassword: Boolean(u.mustChange), mfaEnabled: Boolean(u.mfa) } : null
    },
    findUserByEmail: async (email) => users.find((u) => u.email === email)?.id ?? null,
    createUser: async ({ email, password, name }) => {
      const id = `u${users.length}`
      users.push({ id, email, name, password, mustChange: true })
      return id
    },
    setTemporaryPassword: async (id, password) => {
      const u = users.find((x) => x.id === id)!
      u.password = password
      u.mustChange = true
    },
    resetMfa: async (id) => {
      users.find((x) => x.id === id)!.mfa = false
    },
    addMember: async (_t, id, role) => void members.set(id, role),
    setRole: async (_t, id, role) => void members.set(id, role),
    removeMember: async (_t, id) => void members.delete(id),
    setBroker: async (_t, id, { active }) => {
      if (active || brokers.has(id)) brokers.set(id, active)
    },
    limits: async () => ({ maxUsers, maxBrokers }),
    countActiveBrokers: async () => [...brokers.values()].filter(Boolean).length,
  }
  return { port, users, members, brokers }
}

describe('equipe (Edge Function team)', () => {
  beforeEach(() => {
    seq = 1
  })

  it('senha temporária legível, sem caracteres ambíguos', () => {
    const p = temporaryPassword(random)
    expect(p).toMatch(/^[A-Za-z2-9]{4}-[A-Za-z2-9]{4}-[A-Za-z2-9]{4}$/)
    expect(p).not.toMatch(/[01OolI]/)
  })

  it('só gerente da imobiliária ou admin da plataforma', async () => {
    const { port } = makePort()
    expect((await handleTeam(port, 'broker', { action: 'list', tenantId: T }, random, S)).status).toBe(403)
    expect((await handleTeam(port, 'outsider', { action: 'list', tenantId: T }, random, S)).status).toBe(403)
    expect((await handleTeam(port, 'admin', { action: 'list', tenantId: T }, random, S)).status).toBe(200)
    const viaPlatform = await handleTeam(port, 'platform', { action: 'list', tenantId: T }, random, S)
    expect((viaPlatform.body.members as unknown[]).length).toBe(3)
  })

  it('cria corretor com senha temporária e cadastro de corretor', async () => {
    const { port, members, brokers, users } = makePort()
    const r = await handleTeam(port, 'admin', { action: 'create', tenantId: T, name: 'Nova Corretora', email: ' Nova@X.com ', role: 'broker' }, random, S)
    expect(r.status).toBe(200)
    const id = r.body.userId as string
    expect(members.get(id)).toBe('broker')
    expect(brokers.get(id)).toBe(true)
    expect(users.find((u) => u.id === id)?.email).toBe('nova@x.com')
    expect(r.body.temporaryPassword).toMatch(/^.{4}-.{4}-.{4}$/)
  })

  it('e-mail que já tem conta: só vincula (não troca a senha); repetido é recusado', async () => {
    const { port, members } = makePort()
    const r = await handleTeam(port, 'admin', { action: 'create', tenantId: T, name: 'Outra', email: 'outra@x.com', role: 'admin' }, random, S)
    expect(r.body).toMatchObject({ existingAccount: true, temporaryPassword: null })
    expect(members.get('outsider')).toBe('admin')
    const again = await handleTeam(port, 'admin', { action: 'create', tenantId: T, name: 'Outra', email: 'outra@x.com', role: 'admin' }, random, S)
    expect(again.body.error).toBe('already_member')
  })

  it('valida dados e papel (não cria responsável pelo painel)', async () => {
    const { port } = makePort()
    const call = (extra: Record<string, unknown>) => handleTeam(port, 'admin', { action: 'create', tenantId: T, name: 'Fulano', email: 'f@x.com', role: 'broker', ...extra }, random, S)
    expect((await call({ email: 'invalido' })).body.error).toBe('invalid_email')
    expect((await call({ name: 'F' })).body.error).toBe('invalid_name')
    expect((await call({ role: 'owner' })).body.error).toBe('invalid_role')
  })

  it('admin da plataforma cria o responsável (owner) de uma imobiliária nova', async () => {
    const { port, members, brokers } = makePort()
    members.clear()
    brokers.clear()
    const r = await handleTeam(port, 'platform', { action: 'create', tenantId: T, name: 'Dona Nova', email: 'dona@nova.com', role: 'owner' }, random, S)
    expect(r.status).toBe(200)
    expect(r.body.temporaryPassword).toMatch(/^[A-Za-z2-9]{4}-/)
    expect(members.get(r.body.userId as string)).toBe('owner')
    expect(brokers.size).toBe(0)
  })

  it('verificação em duas etapas: sem o código não faz nada; plataforma só com aal2', async () => {
    const { port } = makePort()
    const semCodigo = await handleTeam(port, 'admin', { action: 'list', tenantId: T }, random, { aal: 'aal1', hasMfa: true })
    expect(semCodigo).toEqual({ status: 401, body: { error: 'mfa_required' } })
    const plataformaAal1 = await handleTeam(port, 'platform', { action: 'list', tenantId: T }, random, { aal: 'aal1', hasMfa: false })
    expect(plataformaAal1.status).toBe(403)
    const gerenteSemMfa = await handleTeam(port, 'admin', { action: 'list', tenantId: T }, random, { aal: 'aal1', hasMfa: false })
    expect(gerenteSemMfa.status).toBe(200)
  })

  it('gerente desativa a verificação de quem perdeu o celular (não a do responsável)', async () => {
    const { port, users } = makePort()
    users.find((u) => u.id === 'broker')!.mfa = true
    const list = await handleTeam(port, 'admin', { action: 'list', tenantId: T }, random, S)
    expect((list.body.members as { userId: string; mfaEnabled: boolean }[]).find((m) => m.userId === 'broker')?.mfaEnabled).toBe(true)
    expect((await handleTeam(port, 'admin', { action: 'reset_mfa', tenantId: T, userId: 'broker' }, random, S)).status).toBe(200)
    expect(users.find((u) => u.id === 'broker')!.mfa).toBe(false)
    expect((await handleTeam(port, 'admin', { action: 'reset_mfa', tenantId: T, userId: 'owner' }, random, S)).status).toBe(403)
    expect((await handleTeam(port, 'admin', { action: 'reset_mfa', tenantId: T, userId: 'admin' }, random, S)).body.error).toBe('not_on_self')
  })

  it('limites do plano', async () => {
    expect((await handleTeam(makePort(3).port, 'admin', { action: 'create', tenantId: T, name: 'X Y', email: 'n@x.com', role: 'admin' }, random, S)).body.error).toBe('plan_limit_users')
    expect((await handleTeam(makePort(null, 1).port, 'admin', { action: 'create', tenantId: T, name: 'X Y', email: 'n@x.com', role: 'broker' }, random, S)).body.error).toBe('plan_limit_brokers')
  })

  it('nova senha: gerente reseta corretor; não reseta o responsável nem a si mesmo', async () => {
    const { port, users } = makePort()
    const r = await handleTeam(port, 'admin', { action: 'reset_password', tenantId: T, userId: 'broker' }, random, S)
    expect(r.status).toBe(200)
    expect(users.find((u) => u.id === 'broker')).toMatchObject({ password: r.body.temporaryPassword, mustChange: true })
    expect((await handleTeam(port, 'admin', { action: 'reset_password', tenantId: T, userId: 'owner' }, random, S)).status).toBe(403)
    expect((await handleTeam(port, 'owner', { action: 'reset_password', tenantId: T, userId: 'admin' }, random, S)).status).toBe(200)
    expect((await handleTeam(port, 'admin', { action: 'reset_password', tenantId: T, userId: 'admin' }, random, S)).body.error).toBe('not_on_self')
    expect((await handleTeam(port, 'platform', { action: 'reset_password', tenantId: T, userId: 'owner' }, random, S)).status).toBe(200)
  })

  it('trocar papel mantém o cadastro de corretor coerente; remover desativa', async () => {
    const { port, members, brokers } = makePort()
    await handleTeam(port, 'admin', { action: 'set_role', tenantId: T, userId: 'broker', role: 'admin' }, random, S)
    expect(members.get('broker')).toBe('admin')
    expect(brokers.get('broker')).toBe(false)
    await handleTeam(port, 'admin', { action: 'set_role', tenantId: T, userId: 'broker', role: 'broker' }, random, S)
    expect(brokers.get('broker')).toBe(true)
    expect((await handleTeam(port, 'admin', { action: 'set_role', tenantId: T, userId: 'owner', role: 'broker' }, random, S)).status).toBe(403)
    const removed = await handleTeam(port, 'admin', { action: 'remove', tenantId: T, userId: 'broker' }, random, S)
    expect(removed.status).toBe(200)
    expect(members.has('broker')).toBe(false)
    expect(brokers.get('broker')).toBe(false)
    expect((await handleTeam(port, 'owner', { action: 'remove', tenantId: T, userId: 'owner' }, random, S)).body.error).toBe('not_on_self')
    expect((await handleTeam(port, 'admin', { action: 'remove', tenantId: T, userId: 'outsider' }, random, S)).status).toBe(404)
  })
})
