import { describe, expect, it } from 'vitest'
import { defaultTenant, isDefaultBrand } from '@/tenant/defaultTenant'
import { mapTenantProfile } from '@/tenant/mapProfile'
import { themeVariables } from '@/tenant/theme'
import type { PublicTenantProfileRow } from '@/tenant/types'
import { formatPhoneBR } from '@/utils/format'

const row: PublicTenantProfileRow = {
  tenant_id: '7f1c2d3e-0000-4000-8000-000000000abc',
  slug: 'imob-sol',
  display_name: 'Imobiliária Sol',
  legal_name: 'Sol Negócios Imobiliários Ltda',
  tagline: 'Seu lar ao sol.',
  creci: 'CRECI-RN 1234-J',
  phone: null,
  whatsapp: '5584988887777',
  whatsapp_message: null,
  email: 'contato@sol.com.br',
  address_line: null,
  city: 'Natal',
  state: 'RN',
  logo_url: 'https://cdn.example.com/logo.png',
  favicon_url: null,
  primary_color: '#123456',
  secondary_color: 'invalid',
  instagram_url: 'https://instagram.com/sol',
  facebook_url: null,
  business_hours: 'Seg. a sex., 9h às 18h',
}

describe('tenant', () => {
  it('modo sem backend: imobiliária padrão = valores da V1', () => {
    expect(defaultTenant.id).toBeNull()
    expect(defaultTenant.slug).toBe('legalize')
    expect(defaultTenant.contact.whatsapp).toBe('5584999999999')
    expect(defaultTenant.contact.phoneDisplay).toBe('(84) 99999-9999')
    expect(defaultTenant.contact.businessHours).toBe('Seg. a sáb., 8h às 18h')
    expect(isDefaultBrand(defaultTenant)).toBe(true)
  })

  it('perfil do banco vira configuração do site, sem herdar contato da Legalize', () => {
    const t = mapTenantProfile(row)
    expect(t.id).toBe(row.tenant_id)
    expect(t.name).toBe('Imobiliária Sol')
    expect(t.legalName).toBe('Sol Negócios Imobiliários Ltda')
    expect(t.contact.phoneDisplay).toBe('(84) 98888-7777')
    expect(t.contact.address).toBe('Natal — RN')
    expect(t.contact.whatsappMessage).toContain('Imobiliária Sol')
    expect(t.branding.primaryColor).toBe('#123456')
    expect(t.branding.secondaryColor).toBe('#d9b47a') // cor inválida cai no padrão
    expect(t.source).toBe('backend')
    expect(isDefaultBrand(t)).toBe(false)
  })

  it('tema: cores padrão não sobrescrevem nada; cores próprias geram os tons', () => {
    expect(themeVariables('#071B2E', '#D9B47A')).toEqual({})
    const vars = themeVariables('#123456', '#d9b47a')
    expect(vars['--color-navy-950']).toBe('#123456')
    expect(vars['--color-navy-800']).toContain('color-mix')
    expect(vars['--color-gold-500']).toBeUndefined()
  })

  it('formata telefones brasileiros', () => {
    expect(formatPhoneBR('5584999999999')).toBe('(84) 99999-9999')
    expect(formatPhoneBR('8433334444')).toBe('(84) 3333-4444')
    expect(formatPhoneBR('')).toBe('')
  })
})
