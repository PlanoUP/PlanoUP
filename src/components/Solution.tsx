"use client";

import { ArrowRight, ArrowDown } from "lucide-react";
import { goToCheckout } from "@/lib/checkout";

const before = ["Ideia", "Referência", "Modelagem", "Detalhamento", "Ajustes", "Apresentação"];
const after = ["Escolha", "Edite", "Adapte", "Apresente"];

export default function Solution() {
  return (
    <section className="section-py bg-surface/40">
      <div className="container-px mx-auto max-w-content">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            COMECE COM UMA BASE PRONTA.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            A Biblioteca PlanoUP foi criada para entregar uma base industrial pronta para você
            estudar, editar, adaptar e utilizar como ponto de partida.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card-surface p-6">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-secondary">
              Sem PlanoUP
            </span>
            <div className="mt-5 flex flex-col gap-3">
              {before.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[11px] text-text-secondary">
                    {i + 1}
                  </span>
                  <span className="text-sm text-text-secondary">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface border-accent/30 bg-surface-light p-6">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
              Com PlanoUP
            </span>
            <div className="mt-5 flex flex-col gap-3">
              {after.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/50 bg-accent/10 font-mono text-[11px] text-accent">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-white">{step}</span>
                  {i < after.length - 1 && (
                    <ArrowDown className="ml-auto h-3.5 w-3.5 text-accent/50 lg:hidden" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xl font-extrabold leading-snug text-white sm:text-3xl">
            MENOS TEMPO COMEÇANDO.
            <br className="sm:hidden" /> <span className="text-accent">MAIS TEMPO DESENVOLVENDO.</span>
          </p>
          <button
            onClick={() => goToCheckout("solution")}
            className="btn-primary mx-auto mt-8 w-full sm:w-auto"
          >
            Quero acessar a biblioteca
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
