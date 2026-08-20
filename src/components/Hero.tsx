"use client";

import { ArrowDown, CheckCircle2 } from "lucide-react";
import { product, formatPrice } from "@/config/product";
import CheckoutLink from "./CheckoutLink";
import EquipmentImage from "./EquipmentImage";
import { equipments } from "@/data/equipments";

const stats = [
  { label: "Projetos", value: `${product.projects}` },
  { label: "Recursos", value: `${product.resources}` },
  { label: "Editável", value: "100%" },
  { label: "Acesso", value: "Imediato" },
];

export default function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden bg-background bg-technical-grid">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      <div className="container-px relative mx-auto grid max-w-content gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-24 lg:pt-16">
        {/* LEFT — copy */}
        <div className="flex flex-col justify-center">
          <span className="eyebrow w-fit">Biblioteca Industrial 3D • Volume 01</span>

          <h1 className="mt-5 text-[2.1rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            PARE DE MODELAR
            <br />
            EQUIPAMENTOS INDUSTRIAIS
            <br />
            <span className="text-accent">DO ZERO.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
            Tenha acesso a 6 projetos industriais 3D editáveis, imagens, vistas técnicas e um
            treinamento prático para acelerar seus próximos projetos no SketchUp.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="card-surface px-3 py-3 text-center sm:px-2">
                <div className="font-mono text-lg font-bold text-accent sm:text-xl">{s.value}</div>
                <div className="mt-0.5 text-[11px] uppercase tracking-wide text-text-secondary">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-end gap-4">
            <div>
              <div className="text-sm text-text-secondary line-through">
                de {formatPrice(product.oldPrice)}
              </div>
              <div className="font-mono text-4xl font-extrabold text-white sm:text-5xl">
                {formatPrice(product.price)}
              </div>
            </div>
            <CheckoutLink
              origin="hero"
              className="btn-primary h-[56px] w-full text-base sm:w-auto sm:px-10"
            >
              Quero acessar a biblioteca
            </CheckoutLink>
          </div>

          <p className="mt-3 text-xs text-text-secondary">
            Acesso imediato • Pagamento seguro • Arquivos editáveis
          </p>

          <a
            href="#equipamentos"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-accent"
          >
            Veja tudo que você recebe
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>

        {/* RIGHT — composição dos equipamentos */}
        <div className="relative flex items-center justify-center">
          <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4">
            {equipments.slice(0, 4).map((eq, i) => (
              <div
                key={eq.id}
                className={`card-surface relative aspect-square overflow-hidden p-3 ${
                  i === 0 ? "col-span-2 aspect-[2/1]" : ""
                }`}
              >
                <span className="absolute left-3 top-3 z-10 font-mono text-[11px] font-bold text-accent">
                  {eq.number}
                </span>
                <EquipmentImage
                  src={eq.image}
                  slug={eq.slug}
                  alt={eq.name}
                  imageClassName="object-contain p-3"
                />
              </div>
            ))}
          </div>
          <div className="absolute -right-4 top-6 hidden rotate-3 rounded-lg border border-accent/30 bg-surface px-3 py-2 shadow-xl sm:flex sm:items-center sm:gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-white">6 modelos .SKP</span>
          </div>
        </div>
      </div>
    </section>
  );
}
