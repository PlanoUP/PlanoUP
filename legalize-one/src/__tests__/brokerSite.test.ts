import { describe, expect, test } from 'vitest'
import { fromSiteForm, slugify, splitList, toSiteForm, type BrokerSite } from '@/dashboard/brokerSiteForm'

const base: BrokerSite = {
  id: 'b1',
  name: 'Ana Lúcia Souza',
  professional_title: null,
  tagline: null,
  headline: null,
  bio: null,
  creci: 'CRECI-RN 1234-F',
  city: 'Natal',
  state: 'RN',
  years_experience: 3,
  specialties: ['Lançamentos'],
  regions: ['Ponta Negra', 'Capim Macio'],
  languages: [],
  highlights: [],
  whatsapp: '5584999990000',
  phone: null,
  email: null,
  instagram_url: null,
  photo_url: null,
  cover_url: null,
  accent_color: null,
  profile_slug: null,
  public_profile: false,
}

describe('Meu site: formulário do perfil público', () => {
  test('sugere o endereço a partir do nome, sem acentos', () => {
    expect(slugify('Ana Lúcia Souza')).toBe('ana-lucia-souza')
    expect(toSiteForm(base).profile_slug).toBe('ana-lucia-souza')
  })

  test('listas separadas por vírgula, ponto e vírgula ou linha, sem repetidos', () => {
    expect(splitList('Natal, Parnamirim; natal\n Ponta  Negra ,')).toEqual(['Natal', 'Parnamirim', 'Ponta Negra'])
  })

  test('converte para o banco: WhatsApp com DDI, UF maiúscula, anos como número', () => {
    const form = { ...toSiteForm(base), whatsapp: '(84) 98888-7777', state: 'rn', years_experience: '5', public_profile: true }
    const { patch, errors } = fromSiteForm(form, false)
    expect(errors).toEqual({})
    expect(patch).toMatchObject({ whatsapp: '5584988887777', state: 'RN', years_experience: 5, profile_slug: 'ana-lucia-souza' })
    expect(patch).not.toHaveProperty('social_links')
  })

  test('recusa endereço reservado ou inválido e publicação sem WhatsApp', () => {
    expect(fromSiteForm({ ...toSiteForm(base), profile_slug: 'dashboard' }, false).errors.profile_slug).toMatch(/reservado/)
    expect(fromSiteForm({ ...toSiteForm(base), profile_slug: 'Ana Souza!' }, false).errors.profile_slug).toBeTruthy()
    const noWa = fromSiteForm({ ...toSiteForm(base), whatsapp: '', public_profile: true }, false)
    expect(noWa.errors.whatsapp).toMatch(/publicar/)
  })

  test('outras redes só são enviadas quando o banco já tem as colunas, e exigem https', () => {
    const form = toSiteForm(base)
    form.social.linkedin = 'https://linkedin.com/in/ana'
    form.social.youtube = 'youtube.com/ana'
    expect(fromSiteForm(form, true).errors['social.youtube']).toBeTruthy()
    form.social.youtube = ''
    const { patch } = fromSiteForm(form, true)
    expect(patch?.social_links).toEqual({ linkedin: 'https://linkedin.com/in/ana' })
  })
})
