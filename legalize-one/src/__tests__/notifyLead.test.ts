import { describe, expect, it } from 'vitest'
import { buildLeadEmail, recipients, shouldNotify, type LeadForNotice } from '../../supabase/functions/notify-lead/core'

const now = new Date('2026-10-05T12:00:00Z')
const lead = (over: Partial<LeadForNotice> = {}): LeadForNotice => ({
  id: 'l1',
  name: 'Maria <Souza>',
  phone: '84999990000',
  email: null,
  message: 'Quero visitar',
  channel: 'visit_request',
  source: 'property_page',
  created_at: '2026-10-05T11:58:00Z',
  notified_at: null,
  ...over,
})

describe('aviso de contato novo (notify-lead)', () => {
  it('avisa só contato recente, identificado e ainda não avisado', () => {
    expect(shouldNotify(lead(), now)).toBe(true)
    expect(shouldNotify(null, now)).toBe(false)
    expect(shouldNotify(lead({ notified_at: '2026-10-05T11:59:00Z' }), now)).toBe(false)
    expect(shouldNotify(lead({ created_at: '2026-10-05T11:30:00Z' }), now)).toBe(false)
    expect(shouldNotify(lead({ name: null, channel: 'whatsapp' }), now)).toBe(false)
    expect(shouldNotify(lead({ phone: null, email: null }), now)).toBe(false)
  })

  it('destinatários únicos e válidos', () => {
    expect(recipients(['A@x.com', 'a@x.com ', null, 'invalido', 'b@y.com.br'])).toEqual(['a@x.com', 'b@y.com.br'])
  })

  it('e-mail com dados do contato, links e texto escapado', () => {
    const mail = buildLeadEmail({ tenantName: 'Legalize', lead: lead(), propertyTitle: 'Casa em condomínio', panelUrl: 'https://x.com/dashboard/contatos/l1' })
    expect(mail.subject).toBe('Novo contato: Maria <Souza> · Casa em condomínio')
    expect(mail.text).toContain('Telefone: (84) 99999-0000')
    expect(mail.text).toContain('Responder no WhatsApp: https://wa.me/5584999990000')
    expect(mail.html).toContain('Maria &lt;Souza&gt;')
    expect(mail.html).not.toContain('<Souza>')
    expect(mail.html).toContain('https://x.com/dashboard/contatos/l1')
  })
})
