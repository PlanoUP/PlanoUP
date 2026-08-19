"use client";

import { X, Check, ArrowRight } from "lucide-react";
import { goToCheckout } from "@/lib/checkout";

const before = ["Tela vazia", "Pesquisa por referências", "Modelagem inicial", "Horas de preparação"];
const after = ["Abra a biblioteca", "Escolha o modelo", "Edite", "Adapte", "Continue o projeto"];

export default function Comparison() {
  return (
    <section className="section-py bg-background">
      <div className="container-px mx-auto max-w-content">
        <h2 className="mx-auto max-w-2xl text-center text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
          COMO VOCÊ PREFERE COMEÇAR SEU PRÓXIMO PROJETO?
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="card-surface p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-white/60">Antes</h3>
            <div className="mt-5 flex flex-col gap-3">
              {before.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <X className="h-4 w-4 shrink-0 text-white/30" />
                  <span className="text-sm text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface border-accent/30 bg-surface-light p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-accent">Depois</h3>
            <div className="mt-5 flex flex-col gap-3">
              {after.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check className="h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm font-medium text-white">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => goToCheckout("comparison")}
            className="btn-primary mx-auto w-full sm:w-auto"
          >
            Quero acessar a biblioteca
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
