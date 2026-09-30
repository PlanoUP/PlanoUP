import { ArrowRight, Building2, Handshake } from 'lucide-react'
import { ButtonAnchor } from '@/components/ui/Button'
import { SmartImage } from '@/components/ui/SmartImage'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { track } from '@/lib/analytics'
import { whatsappLink } from '@/lib/whatsapp'
import { unsplash } from '@/lib/images'

const perks = [
  { icon: WhatsAppIcon, title: 'Atendimento rápido', text: 'via WhatsApp' },
  { icon: Building2, title: 'Indicação de imóveis', text: 'conforme seu perfil' },
  { icon: Handshake, title: 'Acompanhamento', text: 'completo' },
]

export function FinalCTA() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-navy-950 text-white">
      <SmartImage
        src={unsplash('photo-1483729558449-99ef09a8c325', 2200, 75)}
        alt=""
        fallback="coast"
        sizes="100vw"
        className="absolute inset-0 -z-10"
        imgClassName="object-[70%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/60 to-transparent lg:hidden" />

      <div className="container-page grid gap-10 py-14 sm:py-16 lg:grid-cols-[1fr_1fr] lg:items-end">
        <div>
          <h2 id="cta-title" className="font-display text-[26px] leading-tight font-bold tracking-[-0.03em] sm:text-[30px]">
            Ainda não encontrou o imóvel ideal?
          </h2>
          <p className="mt-2 text-[15px] text-white/80">Conte o que você procura e nós encontramos para você.</p>
          <ButtonAnchor
            href={whatsappLink('Olá! Ainda não encontrei o imóvel ideal. Posso contar o que procuro?')}
            target="_blank"
            rel="noopener noreferrer"
            variant="white"
            size="lg"
            className="mt-7"
            onClick={() => track('whatsapp_clicked', { placement: 'final_cta' })}
          >
            Falar com um especialista
            <ArrowRight className="size-4" />
          </ButtonAnchor>
        </div>

        <ul className="grid grid-cols-3 gap-4 lg:justify-self-start">
          {perks.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Icon className={i === 0 ? 'size-7 shrink-0 text-[#4ade80]' : 'size-7 shrink-0 text-white/90'} />
              <p className="text-[12px] leading-snug text-white/75">
                <span className="block text-white">{title}</span>
                {text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
