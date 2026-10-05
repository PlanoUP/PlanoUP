import { CheckCircle2, PhoneCall } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button, ButtonAnchor } from '@/components/ui/Button'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { track } from '@/lib/analytics'
import { whatsappLink } from '@/lib/whatsapp'
import { submitLead } from '@/services/leadService'
import { cn } from '@/utils/cn'

const PERIODS = ['Qualquer horário', 'Manhã', 'Tarde', 'Noite'] as const

function formatPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const input = (error?: string) =>
  cn(
    'mt-1.5 h-12 w-full rounded-lg border bg-white px-3.5 text-base text-navy-950 outline-none transition-colors placeholder:text-slate/70 focus:border-navy-800 focus:ring-2 focus:ring-navy-800/15',
    error ? 'border-red-400' : 'border-navy-950/12',
  )

interface ContactRequestProps {
  propertyId: string
  propertyTitle: string
  /** Mensagem de WhatsApp sobre este imóvel (oferecida depois do envio). */
  whatsappMessage: string
}

/**
 * "Prefere que a gente ligue?": quem não quer abrir o WhatsApp deixa nome e telefone.
 * O contato chega no painel da imobiliária (Contatos) já ligado ao imóvel.
 */
export function ContactRequest({ propertyId, propertyTitle, whatsappMessage }: ContactRequestProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(PERIODS[0])
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  function openSheet() {
    setOpen(true)
    track('property_contact_request_opened', { property_id: propertyId })
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (name.trim().length < 2) next.name = 'Informe seu nome.'
    if (phone.replace(/\D/g, '').length < 10) next.phone = 'Informe um telefone válido com DDD.'
    setErrors(next)
    if (next.name || next.phone) {
      document.getElementById(next.name ? 'cr-name' : 'cr-phone')?.focus()
      return
    }
    setSending(true)
    track('lead_submitted', { source: 'property_page', property_id: propertyId })
    await submitLead({
      channel: 'info_request',
      source: 'property_page',
      propertyId,
      name,
      phone,
      message: [`Prefere contato: ${period.toLowerCase()}.`, message.trim()].filter(Boolean).join(' '),
    })
    setSending(false)
    setSent(true)
  }

  function close() {
    setOpen(false)
    if (sent) {
      setSent(false)
      setMessage('')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-navy-800 hover:bg-sand"
      >
        <PhoneCall className="size-[18px]" aria-hidden="true" />
        Prefiro que me liguem
      </button>

      <BottomSheet open={open} onClose={close} title={sent ? 'Pedido enviado' : 'Receber uma ligação'} description={propertyTitle}>
        {sent ? (
          <div className="pb-2 text-center">
            <CheckCircle2 className="mx-auto size-10 text-tour" aria-hidden="true" />
            <p className="mt-3 font-display text-[19px] font-bold text-navy-950">Recebemos seu contato!</p>
            <p className="mt-1 text-[14px] text-slate">Um especialista vai ligar para você. Se preferir, adiante pelo WhatsApp.</p>
            <ButtonAnchor
              href={whatsappLink(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="mt-5 w-full"
              onClick={() => track('property_whatsapp_clicked', { property_id: propertyId, placement: 'contact_request_success' })}
            >
              <WhatsAppIcon className="size-5" />
              Continuar no WhatsApp
            </ButtonAnchor>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} noValidate className="space-y-3.5 pb-2">
            <div>
              <label htmlFor="cr-name" className="text-[13px] font-semibold text-navy-950">
                Nome
              </label>
              <input
                id="cr-name"
                className={input(errors.name)}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setErrors((x) => ({ ...x, name: undefined }))
                }}
                autoComplete="name"
                autoCapitalize="words"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? 'cr-name-error' : undefined}
              />
              {errors.name && (
                <p id="cr-name-error" className="mt-1.5 text-[13px] text-red-600">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="cr-phone" className="text-[13px] font-semibold text-navy-950">
                Telefone / WhatsApp
              </label>
              <input
                id="cr-phone"
                type="tel"
                inputMode="tel"
                className={input(errors.phone)}
                value={phone}
                onChange={(e) => {
                  setPhone(formatPhone(e.target.value))
                  setErrors((x) => ({ ...x, phone: undefined }))
                }}
                autoComplete="tel-national"
                placeholder="(84) 99999-9999"
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? 'cr-phone-error' : undefined}
              />
              {errors.phone && (
                <p id="cr-phone-error" className="mt-1.5 text-[13px] text-red-600">
                  {errors.phone}
                </p>
              )}
            </div>
            <fieldset>
              <legend className="text-[13px] font-semibold text-navy-950">Melhor horário</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PERIODS.map((p) => (
                  <label
                    key={p}
                    className={cn(
                      'flex h-11 cursor-pointer items-center justify-center rounded-lg border text-[13.5px] font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold-500',
                      period === p ? 'border-navy-800 bg-navy-800 text-white' : 'border-navy-950/12 text-navy-950 hover:border-navy-950/30',
                    )}
                  >
                    <input type="radio" name="cr-period" value={p} checked={period === p} onChange={() => setPeriod(p)} className="sr-only" />
                    {p}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="cr-message" className="text-[13px] font-semibold text-navy-950">
                Mensagem <span className="font-normal text-slate">(opcional)</span>
              </label>
              <textarea
                id="cr-message"
                rows={2}
                maxLength={600}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={cn(input(), 'h-auto py-3')}
                placeholder="Ex.: quero saber sobre financiamento"
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={sending}>
              Quero receber a ligação
            </Button>
            <p className="text-center text-[11.5px] text-slate">
              Usamos seus dados só para falar sobre este imóvel.{' '}
              <Link to="/privacidade" className="underline underline-offset-2" onClick={() => setOpen(false)}>
                Política de privacidade
              </Link>
            </p>
          </form>
        )}
      </BottomSheet>
    </>
  )
}
