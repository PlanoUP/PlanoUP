import { describe, expect, it } from 'vitest'
import { storedEventTypes } from '@/lib/analytics'
import { externalReferrer, parseUtm } from '@/lib/attribution'
import { pickMetadata, resolvePropertyId, setAnalyticsContext } from '@/lib/eventSink'

describe('analytics', () => {
  it('eventos principais são gravados com os tipos do banco', () => {
    expect(storedEventTypes.property_viewed).toBe('property_view')
    expect(storedEventTypes.model3d_started).toBe('3d_open')
    expect(storedEventTypes.property_whatsapp_clicked).toBe('whatsapp_click')
    expect(storedEventTypes.model3d_schedule_clicked).toBe('visit_request')
    expect(storedEventTypes.page_viewed).toBe('page_view')
    expect(storedEventTypes.model3d_loaded).toBeUndefined() // técnico: só no dataLayer
  })

  it('metadados: só chaves permitidas, sem dados pessoais', () => {
    expect(pickMetadata({ placement: 'hero', name: 'Maria', phone: '849', device: 'mobile', extra: { a: 1 } })).toEqual({
      placement: 'hero',
      device: 'mobile',
    })
  })

  it('imóvel do evento: do payload ou do contexto da página, só UUIDs', () => {
    const uuid = '0b8f6d2a-1111-4222-8333-444455556666'
    setAnalyticsContext({ propertyId: uuid })
    expect(resolvePropertyId(undefined)).toBe(uuid)
    expect(resolvePropertyId('lg-006')).toBeNull()
    setAnalyticsContext({ propertyId: null })
    expect(resolvePropertyId(undefined)).toBeNull()
  })

  it('UTMs e referrer externo', () => {
    expect(parseUtm('?utm_source=instagram&utm_medium=social&x=1')).toEqual({ utm_source: 'instagram', utm_medium: 'social' })
    expect(externalReferrer('https://www.google.com/search?q=casa', 'legalize-one.vercel.app')).toBe('https://www.google.com/search')
    expect(externalReferrer('https://legalize-one.vercel.app/imoveis', 'legalize-one.vercel.app')).toBe('')
  })
})
