"use client";

import { ArrowRight } from "lucide-react";
import { product, formatPrice } from "@/config/product";
import { goToCheckout } from "@/lib/checkout";
import EquipmentImage from "./EquipmentImage";
import { equipments } from "@/data/equipments";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#040506] py-20 sm:py-28">
      <div className="bg-technical-grid pointer-events-none absolute inset-0 opacity-[0.04]" />
      <div className="container-px relative mx-auto max-w-content text-center">
        <div className="mx-auto mb-10 grid max-w-3xl grid-cols-3 gap-2 opacity-70 sm:grid-cols-6 sm:gap-3">
          {equipments.map((eq) => (
            <div key={eq.id} className="card-surface relative aspect-square p-2.5">
              <EquipmentImage
                src={eq.image}
                slug={eq.slug}
                alt={eq.name}
                imageClassName="object-contain p-1.5"
              />
            </div>
          ))}
        </div>

        <h2 className="mx-auto max-w-2xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
          SEU PRÓXIMO PROJETO NÃO PRECISA COMEÇAR DO ZERO.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-text-secondary sm:text-lg">
          Tenha uma biblioteca industrial pronta para utilizar, estudar e editar.
        </p>

        <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-sm text-white/70">
          <span>{product.projects} projetos</span>
          <span className="text-accent">•</span>
          <span>{product.resources} recursos</span>
          <span className="text-accent">•</span>
          <span>{product.lessons} aulas</span>
          <span className="text-accent">•</span>
          <span className="font-bold text-accent">{formatPrice(product.price)}</span>
        </div>

        <button
          onClick={() => goToCheckout("final-cta")}
          className="btn-primary mx-auto mt-10 w-full text-base sm:w-auto sm:px-14 sm:py-5 sm:text-lg"
        >
          Quero acessar agora
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
