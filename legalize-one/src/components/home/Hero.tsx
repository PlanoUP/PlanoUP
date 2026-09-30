import { ShieldCheck } from 'lucide-react'
import { PropertySearch } from '@/components/forms/PropertySearch'
import { SmartImage } from '@/components/ui/SmartImage'
import { unsplash } from '@/utils/media'

const heroImage = {
  src: unsplash('photo-1613490493576-7fde63acd811', 2200, 80),
  alt: 'Casa contemporânea de dois pavimentos com piscina iluminada ao entardecer',
}

export function Hero() {
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
            className="h-full w-full"
            imgClassName="object-[60%_center]"
          />
          {/* Fusão com o fundo navy */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/75 to-navy-950/30 lg:bg-gradient-to-r lg:from-navy-950 lg:via-navy-950/35 lg:to-transparent" />
          <div className="absolute inset-y-0 left-0 hidden w-40 bg-gradient-to-r from-navy-950 to-transparent lg:block" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950/70 to-transparent" />
        </div>

        <div className="container-page relative grid min-h-[540px] items-center gap-10 pt-12 pb-[150px] sm:min-h-[620px] lg:min-h-[560px] lg:grid-cols-[1fr_auto] lg:pt-14 lg:pb-[140px]">
          <div className="max-w-[640px] animate-fade-up">
            <p className="eyebrow text-[11px] font-normal tracking-[0.42em] text-white/85 sm:text-[13px]">
              Do documento à chave.
            </p>
            <h1
              id="hero-title"
              className="mt-4 font-display text-[46px] leading-[0.95] font-extrabold tracking-[-0.04em] [word-spacing:0.08em] text-white sm:text-[64px] lg:text-[76px]"
            >
              O imóvel certo
              <span className="block bg-gradient-to-r from-gold-400 via-[#e8cfa4] to-gold-500 bg-clip-text text-transparent">
                para a sua
                <br />
                próxima fase.
              </span>
            </h1>
            <p className="mt-6 max-w-[430px] text-[15px] leading-[1.6] text-white/80 sm:text-base">
              Imóveis selecionados, com documentação verificada e todo o suporte que você precisa para comprar ou
              vender com segurança.
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
      <div className="container-page relative z-20 -mt-[118px] sm:-mt-[112px]">
        <PropertySearch variant="hero" className="animate-fade-up [animation-delay:120ms] lg:max-w-[1180px]" />
      </div>
    </section>
  )
}
