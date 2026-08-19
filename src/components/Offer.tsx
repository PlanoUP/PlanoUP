"use client";

import { Check, ArrowRight, Zap, CreditCard } from "lucide-react";
import { product, formatPrice } from "@/config/product";
import { goToCheckout } from "@/lib/checkout";

const included = [
  "6 projetos industriais",
  "18 recursos digitais",
  "Arquivos SketchUp editáveis",
  "Imagens 3D",
  "Vistas técnicas",
  "Treinamento prático",
  "Acesso imediato",
];

export default function Offer() {
  return (
    <section id="oferta" className="section-py bg-background">
      <div className="container-px mx-auto max-w-content">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-accent/30 bg-surface shadow-[0_0_80px_-20px_rgba(210,245,30,0.15)]">
          <div className="border-b border-border bg-surface-light px-6 py-6 text-center sm:px-10 sm:py-8">
            <span className="eyebrow">{product.volume}</span>
            <h2 className="mt-4 text-xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
              Tudo isso no Volume 01
            </h2>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/90">
                  <Check className="h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col items-center gap-1 border-t border-border pt-8 text-center">
              <span className="text-sm text-text-secondary line-through">
                de {formatPrice(product.oldPrice)}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                Hoje
              </span>
              <span className="font-mono text-5xl font-extrabold text-accent sm:text-6xl">
                {formatPrice(product.price)}
              </span>
            </div>

            <button
              onClick={() => goToCheckout("offer")}
              className="btn-primary mt-8 w-full text-base"
            >
              Quero acessar a biblioteca
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-4 text-center text-xs text-text-secondary">
              Pagamento processado com segurança.
              <br />
              Acesso liberado após aprovação.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                <Zap className="h-3.5 w-3.5 text-accent" />
                Acesso imediato
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                <CreditCard className="h-3.5 w-3.5 text-accent" />
                Sem mensalidade
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
