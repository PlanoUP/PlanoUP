import { ShieldCheck } from 'lucide-react'
import { PropertySearch } from '@/components/forms/PropertySearch'
import { useRef } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'
import { useSuppressStickyCta } from '@/hooks/useSuppressStickyCta'
import { unsplash } from '@/lib/images'

const heroImage = {
  src: unsplash('photo-1613490493576-7fde63acd811', 2200, 80),
  alt: 'Casa contemporânea de dois pavimentos com piscina iluminada ao entardecer',
}

export function Hero() {
  // A busca do hero já é a ação principal: o CTA fixo do mobile aguarda ela sair da tela.
  const searchRef = useRef<HTMLDivElement>(null)
  useSuppressStickyCta(searchRef)

  return (
    <section aria-labelledby="hero-title" className="relative bg-sand">
      <div className="relative overflow-hidden bg-navy-950">
        {/* Imagem do imóvel */}
        <div className="absolute inset-0 lg:left-[36%]">
          <SmartImage
            src={heroImage.src}
            alt={heroImage.alt}
            fallback="facade-night"
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 64vw, 100vw"
            className="h-full w-full"
            imgClassName="object-[60%_center]"
          />
          {/* Fusão com o fundo navy */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 from-15% via-navy-950/75 via-50% to-navy-950/5 sm:from-0% sm:via-navy-950/75 sm:to-navy-950/30 lg:bg-gradient-to-r lg:from-navy-950 lg:via-navy-950/35 lg:to-transparent" />
          <div className="absolute inset-y-0 left-0 hidden w-40 bg-gradient-to-r from-navy-950 to-transparent lg:block" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950/70 to-transparent" />
        </div>

        <div className="container-page relative grid min-h-[500px] items-end gap-10 pt-24 pb-[92px] sm:min-h-[620px] sm:items-center sm:pt-12 sm:pb-[150px] lg:min-h-[560px] lg:grid-cols-[1fr_auto] lg:pt-14 lg:pb-[140px]">
          <div className="max-w-[640px] animate-fade-up">
            <p className="eyebrow text-[11px] font-normal tracking-[0.42em] text-white/85 sm:text-[13px]">
              Do documento à chave.
            </p>
            <h1
              id="hero-title"
              className="mt-3 font-display text-[clamp(38px,11vw,46px)] leading-[0.95] sm:mt-4 font-extrabold tracking-[-0.04em] [word-spacing:0.08em] text-white sm:text-[64px] lg:text-[76px]"
            >
              O imóvel certo
              <span className="block bg-gradient-to-r from-gold-400 via-[#e8cfa4] to-gold-500 bg-clip-text text-transparent">
                para a sua
                <br />
                próxima fase.
              </span>
            </h1>
            <p className="mt-4 max-w-[430px] text-[15px] leading-[1.55] text-white/80 sm:mt-6 sm:text-base sm:leading-[1.6]">
              Imóveis selecionados, com documentação verificada e todo o suporte que você precisa para comprar ou
              vender com segurança.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-navy-950/50 py-1.5 pr-3.5 pl-2 text-[12.5px] font-medium text-white/90 backdrop-blur-md lg:hidden">
              <ShieldCheck className="size-4 text-gold-400" strokeWidth={2} aria-hidden="true" />
              Documentação verificada · mais segurança
            </p>
          </div>

          <aside className="hidden animate-fade-up self-center [animation-delay:200ms] lg:block">
            <div className="w-[270px] rounded-2xl border border-white/12 bg-navy-950/55 p-5 text-white shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3.5 border-b border-white/15 pb-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-white/80">
                  <ShieldCheck className="size-6" strokeWidth={1.6} />
                </span>
                <p className="text-[14px] leading-tight font-medium tracking-[0.02em] uppercase">
                  Documentação
                  <br />
                  verificada
                </p>
              </div>
              <p className="mt-4 text-[14px] leading-snug text-white/80">
                Mais segurança
                <br />
                para a sua negociação.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Busca sobreposta à base do hero */}
      <div ref={searchRef} className="container-page relative z-20 -mt-[64px] sm:-mt-[112px]">
        <PropertySearch variant="hero" className="animate-fade-up [animation-delay:120ms] lg:max-w-[1180px]" />
      </div>
    </section>
  )
}
