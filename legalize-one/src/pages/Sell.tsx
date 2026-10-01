import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useState, type FocusEvent, type FormEvent, type ReactNode } from 'react'
import { Button, ButtonAnchor } from '@/components/ui/Button'
import { IconCircle } from '@/components/ui/IconCircle'
import { SmartImage } from '@/components/ui/SmartImage'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { sellSteps } from '@/data/content'
import { propertyTypeOptions } from '@/data/filters'
import { usePageTitle } from '@/hooks/usePageTitle'
import { track } from '@/lib/analytics'
import { whatsappLink } from '@/lib/whatsapp'
import { submitLead } from '@/services/leadService'
import { cn } from '@/utils/cn'
import { unsplash } from '@/lib/images'

interface SellLead {
  name: string
  phone: string
  neighborhood: string
  type: string
  hasDocs: 'sim' | 'nao' | 'nao-sei'
}

const initialLead: SellLead = { name: '', phone: '', neighborhood: '', type: '', hasDocs: 'sim' }

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export default function Sell() {
  usePageTitle('Vender meu imóvel')
  const [lead, setLead] = useState<SellLead>(initialLead)
  const [errors, setErrors] = useState<Partial<Record<keyof SellLead, string>>>({})
  const [sent, setSent] = useState(false)

  function update<K extends keyof SellLead>(key: K, value: SellLead[K]) {
    setLead((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (lead.name.trim().length < 2) next.name = 'Informe seu nome.'
    if (lead.phone.replace(/\D/g, '').length < 10) next.phone = 'Informe um telefone válido com DDD.'
    if (!lead.neighborhood.trim()) next.neighborhood = 'Informe o bairro ou cidade.'
    setErrors(next)
    const firstInvalid = (['name', 'phone', 'neighborhood'] as const).find((k) => next[k])
    if (firstInvalid) {
      document.getElementById(`lead-${firstInvalid}`)?.focus()
      return
    }
    track('lead_submitted', { source: 'sell_page', type: lead.type, has_docs: lead.hasDocs })
    // Com o backend ligado, o contato fica registrado no painel da imobiliária
    // (sem backend, segue só pelo WhatsApp, como na V1). Nunca bloqueia a confirmação.
    void submitLead({
      channel: 'form',
      source: 'sell_page',
      name: lead.name,
      phone: lead.phone,
      message: `Quer vender: ${lead.type || 'tipo não informado'} em ${lead.neighborhood}. Documentação em dia: ${lead.hasDocs}.`,
    })
    setSent(true)
  }

  const whatsappMessage = `Olá! Sou ${lead.name} e quero vender meu imóvel (${lead.type || 'tipo não informado'}) em ${lead.neighborhood}. Documentação em dia: ${lead.hasDocs}.`

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        <SmartImage
          src={unsplash('photo-1600585154340-be6161a56a0c', 2000, 75)}
          alt=""
          fallback="townhouse"
          sizes="100vw"
          className="absolute inset-0 -z-10"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-950/90 to-navy-950/40" />
        {/* Mobile: título → formulário → etapas. Desktop: texto e etapas à esquerda, formulário à direita. */}
        <div className="container-page grid gap-8 py-10 sm:py-20 lg:grid-cols-[1fr_440px] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-10">
          <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
            <p className="eyebrow text-[11px] text-gold-400">Vender com a Legalize</p>
            <h1 className="mt-3 font-display text-[clamp(34px,10vw,40px)] leading-[0.98] font-extrabold tracking-[-0.05em] sm:mt-4 sm:text-[58px]">
              Venda seu imóvel
              <span className="block text-gold-400">com segurança jurídica.</span>
            </h1>
            <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-white/80 sm:mt-5">
              Cuidamos da documentação, da divulgação estratégica e da negociação — do documento à chave.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 text-navy-950 shadow-2xl sm:p-7 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            {sent ? (
              <div className="py-6 text-center" role="status">
                <CheckCircle2 className="mx-auto size-12 text-[#3f9a6b]" strokeWidth={1.5} />
                <h2 className="mt-4 font-display text-2xl font-bold tracking-[-0.03em]">Recebemos seus dados!</h2>
                <p className="mt-2 text-[14px] text-slate">
                  Um especialista entrará em contato. Se preferir, adiante a conversa pelo WhatsApp.
                </p>
                <ButtonAnchor
                  href={whatsappLink(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full"
                  size="lg"
                  onClick={() => track('whatsapp_clicked', { placement: 'sell_success' })}
                >
                  <WhatsAppIcon className="size-5" />
                  Continuar no WhatsApp
                </ButtonAnchor>
                <button
                  type="button"
                  onClick={() => {
                    setLead(initialLead)
                    setSent(false)
                  }}
                  className="mt-4 text-[13px] font-medium text-navy-800 underline-offset-4 hover:underline"
                >
                  Enviar outro imóvel
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate onFocus={keepFieldVisible}>
                <h2 className="font-display text-[22px] font-bold tracking-[-0.03em]">Avaliação gratuita</h2>
                <p className="mt-1 text-[13.5px] text-slate">Resposta em até 1 dia útil.</p>
                <div className="mt-5 space-y-3.5">
                  <Field id="lead-name" label="Nome" error={errors.name}>
                    <input
                      {...fieldProps('lead-name', errors.name)}
                      type="text"
                      value={lead.name}
                      onChange={(e) => update('name', e.target.value)}
                      autoComplete="name"
                      autoCapitalize="words"
                      enterKeyHint="next"
                    />
                  </Field>
                  <Field id="lead-phone" label="WhatsApp" error={errors.phone}>
                    <input
                      {...fieldProps('lead-phone', errors.phone)}
                      type="tel"
                      value={lead.phone}
                      onChange={(e) => update('phone', formatPhone(e.target.value))}
                      inputMode="tel"
                      autoComplete="tel-national"
                      enterKeyHint="next"
                      placeholder="(84) 99999-9999"
                    />
                  </Field>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <Field id="lead-neighborhood" label="Bairro / cidade" error={errors.neighborhood}>
                      <input
                        {...fieldProps('lead-neighborhood', errors.neighborhood)}
                        type="text"
                        value={lead.neighborhood}
                        onChange={(e) => update('neighborhood', e.target.value)}
                        autoComplete="address-level2"
                        autoCapitalize="words"
                        enterKeyHint="done"
                      />
                    </Field>
                    <Field id="lead-type" label="Tipo de imóvel">
                      <select id="lead-type" value={lead.type} onChange={(e) => update('type', e.target.value)} className={inputClass()}>
                        {propertyTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value === '' ? '' : opt.label}>
                            {opt.value === '' ? 'Selecione' : opt.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <fieldset>
                    <legend className="text-[13px] font-semibold">A documentação está em dia?</legend>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {(
                        [
                          ['sim', 'Sim'],
                          ['nao', 'Não'],
                          ['nao-sei', 'Não sei'],
                        ] as const
                      ).map(([value, label]) => (
                        <label
                          key={value}
                          className={cn(
                            'flex h-12 cursor-pointer items-center justify-center rounded-lg border text-[14px] font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold-500',
                            lead.hasDocs === value
                              ? 'border-navy-800 bg-navy-800 text-white'
                              : 'border-navy-950/12 hover:border-navy-950/30',
                          )}
                        >
                          <input
                            type="radio"
                            name="hasDocs"
                            value={value}
                            checked={lead.hasDocs === value}
                            onChange={() => update('hasDocs', value)}
                            className="sr-only"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
                <Button type="submit" size="lg" className="mt-6 w-full">
                  Quero vender meu imóvel
                  <ArrowRight className="size-4" />
                </Button>
                <p className="mt-3 text-center text-[11.5px] text-slate">
                  Seus dados são usados apenas para contato sobre a avaliação.
                </p>
              </form>
            )}
          </div>

          <ul className="grid gap-5 sm:grid-cols-3 lg:col-start-1 lg:row-start-2">
            {sellSteps.map((step) => (
              <li key={step.title}>
                <IconCircle icon={step.icon} size="md" />
                <p className="mt-3 font-display text-[15px] font-semibold">{step.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-white/65">{step.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

/** Com o teclado virtual aberto, centraliza o campo focado para ele não ficar escondido. */
function keepFieldVisible(e: FocusEvent<HTMLFormElement>) {
  const target = e.target
  if (!(target instanceof HTMLElement) || window.innerWidth >= 1024) return
  window.setTimeout(() => target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
}

function inputClass(error?: string) {
  return cn(
    'mt-1.5 h-12 w-full rounded-lg border bg-white px-3.5 text-base text-navy-950 outline-none transition-colors placeholder:text-slate/70 focus:border-navy-800 focus:ring-2 focus:ring-navy-800/15 lg:h-11 lg:text-[14px]',
    error ? 'border-red-400' : 'border-navy-950/12',
  )
}

function fieldProps(id: string, error?: string) {
  return {
    id,
    className: inputClass(error),
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  }
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
