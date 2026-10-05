import { Award, BadgeCheck, Check, Copy, Languages, Loader2, Mail, MapPin, Phone, Quote, Share2, Star } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { BrokerAvatar } from '@/broker/BrokerAvatar'
import { listTestimonials } from '@/broker/brokerApi'
import { InstagramIcon } from '@/broker/icons'
import { copyLink, shareLink, whatsappShareHref } from '@/broker/share'
import type { BrokerProfile as Profile, BrokerTestimonial } from '@/broker/types'
import { PropertyCard, PropertyCardSkeleton } from '@/components/properties/PropertyCard'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { propertyTypeLabels } from '@/data/filters'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { track } from '@/lib/analytics'
import { whatsappLink } from '@/lib/whatsapp'
import { submitLead } from '@/services/leadService'
import { listProperties } from '@/services/propertyService'
import { useTenant } from '@/tenant/store'
import type { Property } from '@/types/property'
import { cn } from '@/utils/cn'

const firstName = (name: string) => name.trim().split(/\s+/)[0]
const location = (b: Profile) => [b.city, b.state].filter(Boolean).join('/')

function Hero({ broker, count }: { broker: Profile; count: number | null }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/corretor/${broker.slug}`
  const facts = [
    location(broker) && { icon: MapPin, text: location(broker) },
    broker.yearsExperience ? { icon: Award, text: `${broker.yearsExperience} anos de experiência` } : null,
    count ? { icon: BadgeCheck, text: `${count} ${count === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}` } : null,
  ].filter(Boolean) as { icon: typeof MapPin; text: string }[]

  async function share() {
    const r = await shareLink({ title: `${broker.name} · Corretor de imóveis`, text: broker.headline ?? undefined, url })
    if (r === 'copied') {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
    if (r !== 'cancelled') track('share_clicked', { target: 'broker_profile', placement: 'hero' })
  }

  return (
    <section aria-labelledby="corretor-nome" className="relative overflow-hidden bg-navy-950 text-white">
      {broker.coverUrl && (
        <img src={broker.coverUrl} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 size-full object-cover opacity-35" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/40 via-navy-950/75 to-navy-950" aria-hidden="true" />
      <div className="relative container-page pt-12 pb-12 sm:pt-20 sm:pb-16">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:gap-8 sm:text-left">
          <BrokerAvatar
            name={broker.name}
            photoUrl={broker.photoUrl}
            className="size-32 shrink-0 text-[40px] ring-4 ring-white/90 shadow-[var(--shadow-float)] sm:size-40"
          />
          <div className="mt-5 min-w-0 sm:mt-0">
            <p className="eyebrow text-[11px] tracking-[0.24em] text-gold-400">Corretor de imóveis{broker.creci ? ` · ${broker.creci}` : ''}</p>
            <h1 id="corretor-nome" className="mt-2 font-display text-[36px] leading-[1.02] font-extrabold tracking-[-0.035em] sm:text-[52px]">
              {broker.name}
            </h1>
            {broker.headline && <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-white/85 sm:text-[19px]">{broker.headline}</p>}
            {facts.length > 0 && (
              <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[14px] text-white/75 sm:justify-start">
                {facts.map((f) => (
                  <li key={f.text} className="inline-flex items-center gap-1.5">
                    <f.icon className="size-4 text-gold-400" aria-hidden="true" />
                    {f.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('whatsapp_clicked', { placement: 'broker_hero' })}
            className="inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-[#1f8a5b] px-7 text-[15.5px] font-semibold text-white shadow-[var(--shadow-float)] hover:bg-[#19744c]"
          >
            <WhatsAppIcon className="size-5" />
            Falar comigo no WhatsApp
          </a>
          <button
            type="button"
            onClick={() => void share()}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/30 px-6 text-[15px] font-semibold text-white hover:bg-white/10"
          >
            {copied ? <Check className="size-4" aria-hidden="true" /> : <Share2 className="size-4" aria-hidden="true" />}
            {copied ? 'Link copiado' : 'Compartilhar perfil'}
          </button>
          <div className="flex items-center justify-center gap-2 sm:ml-auto">
            {broker.instagramUrl && (
              <a href={broker.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={`Instagram de ${broker.name}`} className="flex size-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <InstagramIcon className="size-5" />
              </a>
            )}
            {broker.phone && (
              <a href={`tel:+${broker.phone.replace(/\D/g, '').replace(/^(?!55)/, '55')}`} aria-label={`Ligar para ${broker.name}`} className="flex size-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <Phone className="size-5" aria-hidden="true" />
              </a>
            )}
            {broker.email && (
              <a href={`mailto:${broker.email}`} aria-label={`E-mail para ${broker.name}`} className="flex size-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <Mail className="size-5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

type Purpose = 'todos' | 'venda' | 'aluguel'

function Listings({ broker, properties }: { broker: Profile; properties: Property[] | undefined }) {
  const [purpose, setPurpose] = useState<Purpose>('todos')
  const [type, setType] = useState('')
  const [bedrooms, setBedrooms] = useState(0)
  const [neighborhood, setNeighborhood] = useState('')
  const all = properties ?? []
  const counts = { todos: all.length, venda: all.filter((p) => p.purpose === 'venda').length, aluguel: all.filter((p) => p.purpose === 'aluguel').length }
  const types = [...new Set(all.map((p) => p.type))]
  const hoods = [...new Set(all.map((p) => p.location.neighborhood).filter(Boolean))].sort()
  const showMore = all.length > 6
  const list = all.filter(
    (p) =>
      (purpose === 'todos' || p.purpose === purpose) &&
      (!type || p.type === type) &&
      p.bedrooms >= bedrooms &&
      (!neighborhood || p.location.neighborhood === neighborhood),
  )
  const chip = (value: Purpose, label: string) =>
    counts[value] > 0 || value === 'todos' ? (
      <button
        key={value}
        type="button"
        aria-pressed={purpose === value}
        onClick={() => setPurpose(value)}
        className={cn(
          'inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition-colors',
          purpose === value ? 'bg-navy-950 text-white' : 'bg-sand text-navy-950 hover:bg-sand-200',
        )}
      >
        {label}
        <span className={cn('text-[12.5px] tabular-nums', purpose === value ? 'text-white/70' : 'text-slate')}>{counts[value]}</span>
      </button>
    ) : null
  const select = 'h-10 rounded-full border border-navy-950/12 bg-white pr-8 pl-4 text-[13.5px] font-semibold text-navy-950'

  return (
    <section id="imoveis" aria-labelledby="imoveis-titulo" className="scroll-mt-20 py-12 sm:py-16">
      <div className="container-page">
        <p className="eyebrow text-[11px] tracking-[0.22em] text-gold-600">Portfólio</p>
        <h2 id="imoveis-titulo" className="mt-2 font-display text-[28px] font-bold tracking-[-0.03em] text-navy-950 sm:text-[34px]">
          Imóveis selecionados por mim
        </h2>
        {properties === undefined ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </div>
        ) : all.length === 0 ? (
          <p className="mt-6 max-w-xl text-[15.5px] text-slate">
            Novos imóveis em breve. Enquanto isso, fale comigo: eu ajudo você a encontrar o imóvel ideal.
          </p>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Finalidade">
              {chip('todos', 'Todos')}
              {chip('venda', 'Comprar')}
              {chip('aluguel', 'Alugar')}
            </div>
            {showMore && (
              <div className="mt-3 flex flex-wrap gap-2">
                <label>
                  <span className="sr-only">Tipo de imóvel</span>
                  <select value={type} onChange={(e) => setType(e.target.value)} className={select}>
                    <option value="">Todos os tipos</option>
                    {types.map((t) => (
                      <option key={t} value={t}>
                        {propertyTypeLabels[t] ?? t}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="sr-only">Quartos</span>
                  <select value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} className={select}>
                    <option value={0}>Quartos</option>
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}+ quartos
                      </option>
                    ))}
                  </select>
                </label>
                {hoods.length > 1 && (
                  <label>
                    <span className="sr-only">Bairro</span>
                    <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className={select}>
                      <option value="">Todos os bairros</option>
                      {hoods.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            )}
            {list.length ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-[15px] text-slate">Nenhum imóvel com esses filtros. Fale comigo: posso ter opções que ainda não estão aqui.</p>
            )}
          </>
        )}
        <p className="sr-only">Imóveis de {broker.name}</p>
      </div>
    </section>
  )
}

function About({ broker }: { broker: Profile }) {
  const groups = [
    { title: 'Especialidades', items: broker.specialties },
    { title: 'Regiões atendidas', items: broker.regions },
  ].filter((g) => g.items.length)
  const hasContent = broker.bio || groups.length || broker.languages.length || broker.highlights.length
  if (!hasContent) return null
  return (
    <section aria-labelledby="sobre-titulo" className="bg-sand py-12 sm:py-16">
      <div className="container-page grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow text-[11px] tracking-[0.22em] text-gold-600">Sobre mim</p>
          <h2 id="sobre-titulo" className="mt-2 font-display text-[28px] font-bold tracking-[-0.03em] text-navy-950 sm:text-[34px]">
            Prazer, eu sou {firstName(broker.name)}.
          </h2>
          {broker.bio && <p className="mt-4 text-[16.5px] leading-relaxed whitespace-pre-line text-navy-950/85">{broker.bio}</p>}
          {broker.highlights.length > 0 && (
            <ul className="mt-6 space-y-2.5">
              {broker.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-[15.5px] text-navy-950">
                  <Check className="mt-0.5 size-5 shrink-0 text-[#1f8a5b]" aria-hidden="true" />
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="text-[13px] font-semibold tracking-[0.12em] text-slate uppercase">{g.title}</h3>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {g.items.map((i) => (
                  <li key={i} className="rounded-full bg-white px-3.5 py-1.5 text-[14px] font-medium text-navy-950 shadow-card">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {broker.languages.length > 0 && (
            <p className="flex items-center gap-2 text-[14.5px] text-navy-950">
              <Languages className="size-4 text-slate" aria-hidden="true" />
              Atendimento em {broker.languages.join(', ')}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} de 5 estrelas`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn('size-4', n <= rating ? 'fill-gold-500 text-gold-500' : 'text-navy-950/15')} aria-hidden="true" />
      ))}
    </span>
  )
}

function Testimonials({ items }: { items: BrokerTestimonial[] }) {
  if (!items.length) return null
  return (
    <section aria-labelledby="depoimentos-titulo" className="py-12 sm:py-16">
      <div className="container-page">
        <p className="eyebrow text-[11px] tracking-[0.22em] text-gold-600">Depoimentos</p>
        <h2 id="depoimentos-titulo" className="mt-2 font-display text-[28px] font-bold tracking-[-0.03em] text-navy-950 sm:text-[34px]">
          O que meus clientes dizem
        </h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {items.map((t) => (
            <li key={t.id} className="flex flex-col rounded-3xl border border-navy-950/6 bg-white p-6 shadow-card">
              <Quote className="size-7 text-gold-500" aria-hidden="true" />
              <Stars rating={t.rating} />
              <p className="mt-3 flex-1 text-[15.5px] leading-relaxed text-navy-950/85">{t.comment}</p>
              <div className="mt-5 flex items-center gap-3">
                {t.author_photo_url ? (
                  <img src={t.author_photo_url} alt="" className="size-10 rounded-full object-cover" loading="lazy" />
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-full bg-sand font-semibold text-navy-950" aria-hidden="true">
                    {t.author_name.replace(/^.*·\s*/, '').charAt(0)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-semibold text-navy-950">{t.author_name}</span>
                  <span className="block text-[12.5px] text-slate">
                    {t.source === 'demo' ? 'Demonstração' : t.source === 'verified' ? 'Cliente verificado' : 'Cliente'}
                    {t.testimonial_date ? ` · ${new Date(`${t.testimonial_date}T12:00:00`).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}` : ''}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Contact({ broker }: { broker: Profile }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const first = firstName(broker.name)
  const url = `${window.location.origin}/corretor/${broker.slug}`
  const field =
    'mt-1.5 h-12 w-full rounded-xl border border-white/15 bg-white/10 px-4 text-[16px] text-white placeholder:text-white/45 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/25'

  async function submit(e: FormEvent) {
    e.preventDefault()
    const phone = form.phone.replace(/\D/g, '')
    if (form.name.trim().length < 2) return setError('Informe seu nome.')
    if (phone.length < 10 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return setError('Informe seu WhatsApp com DDD ou um e-mail.')
    setError('')
    setState('sending')
    const r = await submitLead({ channel: 'form', source: 'broker_page', name: form.name, phone, email: form.email, message: form.message })
    if (r.stored) {
      track('lead_submitted', { placement: 'broker_contact' })
      setState('sent')
    } else {
      setState('idle')
      setError('Não foi possível enviar agora. Tente de novo ou fale pelo WhatsApp.')
    }
  }

  return (
    <section id="contato" aria-labelledby="contato-titulo" className="scroll-mt-20 bg-navy-950 py-14 text-white sm:py-20">
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div>
          <h2 id="contato-titulo" className="font-display text-[32px] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[42px]">
            Encontrou algo interessante?
          </h2>
          <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-white/80">Fale comigo e eu te ajudo a encontrar o imóvel ideal.</p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('whatsapp_clicked', { placement: 'broker_contact' })}
            className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-[#1f8a5b] px-8 text-[16px] font-bold text-white shadow-[var(--shadow-float)] hover:bg-[#19744c] sm:w-auto"
          >
            <WhatsAppIcon className="size-6" />
            Falar com {first} no WhatsApp
          </a>
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[13px] font-semibold tracking-[0.12em] text-white/60 uppercase">Compartilhe este perfil</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={whatsappShareHref(`Conheça o ${broker.name}, corretor de imóveis:`, url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('share_clicked', { target: 'broker_profile', placement: 'whatsapp' })}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-[14px] font-semibold hover:bg-white/15"
              >
                <WhatsAppIcon className="size-4" />
                Enviar no WhatsApp
              </a>
              <button
                type="button"
                onClick={async () => {
                  if (await copyLink(url)) {
                    setCopied(true)
                    track('share_clicked', { target: 'broker_profile', placement: 'copy' })
                    window.setTimeout(() => setCopied(false), 2000)
                  }
                }}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-[14px] font-semibold hover:bg-white/15"
              >
                {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                {copied ? 'Link copiado' : 'Copiar link'}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white/6 p-5 ring-1 ring-white/10 sm:p-7">
          {state === 'sent' ? (
            <div role="status" className="py-8 text-center">
              <Check className="mx-auto size-10 rounded-full bg-[#1f8a5b] p-2 text-white" aria-hidden="true" />
              <p className="mt-4 font-display text-[22px] font-bold">Mensagem enviada!</p>
              <p className="mt-2 text-[15px] text-white/75">{first} vai falar com você em breve.</p>
            </div>
          ) : (
            <form onSubmit={(e) => void submit(e)} noValidate className="grid gap-4">
              <p className="font-display text-[19px] font-bold">Prefere que eu entre em contato?</p>
              <label className="block text-[14px] font-semibold">
                Nome
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" maxLength={120} className={field} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[14px] font-semibold">
                  WhatsApp
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} type="tel" inputMode="tel" autoComplete="tel" placeholder="(84) 99999-9999" className={field} />
                </label>
                <label className="block text-[14px] font-semibold">
                  E-mail
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" inputMode="email" autoComplete="email" className={field} />
                </label>
              </div>
              <label className="block text-[14px] font-semibold">
                Mensagem
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  maxLength={1000}
                  placeholder="Ex.: procuro apartamento de 3 quartos em Ponta Negra"
                  className={cn(field, 'h-auto py-3')}
                />
              </label>
              {error && (
                <p role="alert" className="rounded-xl bg-red-500/15 px-3.5 py-2.5 text-[14px] text-red-100">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={state === 'sending'}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold-500 text-[15px] font-bold text-navy-950 hover:bg-gold-400 disabled:opacity-60"
              >
                {state === 'sending' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Enviar mensagem
              </button>
              <p className="text-[12px] text-white/55">Seus dados vão só para {broker.name}, para responder ao seu contato.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/** Página profissional do corretor: apresentação, imóveis, sobre, depoimentos e contato. */
export default function BrokerProfile() {
  const tenant = useTenant()
  const broker = tenant.broker!
  usePageTitle(undefined)
  const { data: properties } = useAsyncData(() => listProperties(), `broker:${broker.slug}`)
  const { data: testimonials } = useAsyncData(() => listTestimonials(broker.slug).catch(() => []), `t:${broker.slug}`)
  const count = useMemo(() => (properties ? properties.length : null), [properties])

  return (
    <>
      <Hero broker={broker} count={count} />
      <Listings broker={broker} properties={properties} />
      <About broker={broker} />
      <Testimonials items={testimonials ?? []} />
      <Contact broker={broker} />
    </>
  )
}
