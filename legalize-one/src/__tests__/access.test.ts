import { describe, expect, it } from 'vitest'
import { canAdd, hasFeature, limitOf, parseEntitlements, PLANS } from '@/lib/entitlements'
import { hasPermission, ROLE_PERMISSIONS } from '@/lib/permissions'

describe('permissões', () => {
  it('corretor não publica nem exclui; admin sim; super admin gerencia a plataforma', () => {
    expect(hasPermission('broker', 'properties.edit_assigned')).toBe(true)
    expect(hasPermission('broker', 'properties.publish')).toBe(false)
    expect(hasPermission('broker', 'leads.view_all')).toBe(false)
    expect(hasPermission('admin', 'properties.delete')).toBe(true)
    expect(hasPermission('owner', 'platform.tenants.manage')).toBe(false)
    expect(hasPermission('platform_admin', 'platform.tenants.manage')).toBe(true)
    expect(hasPermission(null, 'properties.view')).toBe(false)
    expect(ROLE_PERMISSIONS.owner).toEqual(ROLE_PERMISSIONS.admin)
  })
})

describe('planos', () => {
  it('resposta do banco é normalizada; desconhecido = Start', () => {
    const pro = parseEntitlements({ plan: 'pro', limits: { max_properties: 150 }, features: { model3d: true } })
    expect(hasFeature(pro, 'model3d')).toBe(true)
    expect(limitOf(pro, 'max_properties')).toBe(150)
    const unknown = parseEntitlements({ plan: 'gold' })
    expect(unknown.plan).toBe('start')
    expect(hasFeature(unknown, 'model3d')).toBe(false)
  })

  it('limites: null é ilimitado', () => {
    expect(canAdd(PLANS.start, 'max_properties', 29)).toBe(true)
    expect(canAdd(PLANS.start, 'max_properties', 30)).toBe(false)
    expect(canAdd(PLANS.premium, 'max_properties', 10_000)).toBe(true)
    expect(canAdd(parseEntitlements({ plan: 'pro', limits: { max_users: null } }), 'max_users', 99)).toBe(true)
  })
})
