import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router'
import { IconCircle } from '@/components/ui/IconCircle'
import { documentationSteps } from '@/data/content'

export function DocumentationSection() {
  return (
    <section id="documentacao" aria-labelledby="doc-title" className="bg-white py-14 sm:py-16">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[0.85fr_1.5fr] lg:gap-14">
        <div>
          <h2
            id="doc-title"
            className="font-display text-[28px] leading-[1.08] font-bold tracking-[-0.035em] text-navy-950 sm:text-[34px]"
          >
            Vai comprar?
            <br />
            Saiba o que está comprando.
          </h2>
          <p className="mt-3 max-w-[400px] text-[15px] leading-relaxed text-slate">
            Aqui, você encontra imóveis com análise de documentação e todo o suporte para uma negociação segura.
          </p>
          <Link
            to="/imoveis"
            className="group mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-navy-800"
          >
            Ver imóveis verificados
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ol className="relative grid gap-6 sm:grid-cols-5 sm:gap-0">
          {/* Linha conectora */}
          <span
            aria-hidden="true"
            className="absolute top-6 bottom-6 left-[25px] w-px bg-gradient-to-b from-gold-500/50 to-gold-500/10 sm:top-[26px] sm:right-[10%] sm:bottom-auto sm:left-[10%] sm:h-px sm:w-auto sm:bg-gradient-to-r sm:from-gold-500/40 sm:via-gold-500/40 sm:to-gold-500/40"
          />
          {documentationSteps.map((step, i) => (
            <li key={step.title} className="relative flex items-center gap-4 sm:flex-col sm:gap-0 sm:text-center">
              <IconCircle icon={step.icon} className="relative z-10 ring-4 ring-white" />
              {i < documentationSteps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-[18px] -right-[9px] z-10 hidden size-[18px] items-center justify-center rounded-full bg-white text-[#3f9a6b] ring-1 ring-[#3f9a6b]/30 sm:flex"
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
              <p className="text-[13.5px] leading-snug sm:mt-3.5">
                <span className="block font-display font-semibold text-navy-950">{step.title}</span>
                <span className="text-slate">{step.description}</span>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
