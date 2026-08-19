"use client";

import { ArrowRight, FileText } from "lucide-react";
import { goToCheckout } from "@/lib/checkout";

const lessons = [
  { n: "01", title: "Preparação", desc: "Preparando o SketchUp para modelagem industrial" },
  { n: "02", title: "Estruturas", desc: "Entendendo formas e estruturas industriais" },
  { n: "03", title: "Modelagem", desc: "Criando seu primeiro equipamento 3D" },
  { n: "04", title: "Detalhamento", desc: "Detalhamento, componentes e organização" },
  { n: "05", title: "Finalização", desc: "Finalização, vistas técnicas e apresentação profissional" },
];

export default function CourseBonus() {
  return (
    <section className="relative overflow-hidden bg-accent py-16 sm:py-20 lg:py-24">
      <div className="bg-technical-grid pointer-events-none absolute inset-0 opacity-[0.06]" />
      <div className="container-px relative mx-auto max-w-content">
        <span className="inline-flex items-center rounded-full bg-background px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
          Bônus incluído
        </span>

        <h2 className="mt-5 max-w-2xl text-2xl font-extrabold leading-tight tracking-tight text-background sm:text-4xl">
          APRENDA A CRIAR E EDITAR SEUS PRÓPRIOS MODELOS.
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          {/* Mockup do PDF */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="aspect-[3/4] rounded-xl border-2 border-background/80 bg-background p-6 shadow-2xl">
              <FileText className="h-7 w-7 text-accent" />
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                Treinamento Prático
              </p>
              <h3 className="mt-2 text-lg font-extrabold leading-snug text-white">
                Modelagem Industrial 3D no SketchUp
              </h3>
              <div className="mt-6 flex flex-col gap-2.5">
                {lessons.map((l) => (
                  <div key={l.n} className="flex items-center gap-2.5 border-t border-border pt-2.5 first:border-t-0 first:pt-0">
                    <span className="font-mono text-[11px] text-accent">{l.n}</span>
                    <span className="text-xs text-white/80">{l.title}</span>
                  </div>
                ))}
              </div>
              <span className="mt-6 inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-accent">
                PDF ilustrado
              </span>
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <p className="text-base leading-relaxed text-background/80 sm:text-lg">
              Um guia ilustrado e passo a passo para você acompanhar diretamente enquanto modela
              no SketchUp.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {lessons.map((l) => (
                <div key={l.n} className="flex items-start gap-4 rounded-lg bg-background/10 p-4">
                  <span className="font-mono text-sm font-bold text-background">{l.n}</span>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-wide text-background">
                      Aula {l.n} — {l.title}
                    </div>
                    <div className="mt-0.5 text-sm text-background/70">{l.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {["5 aulas", "Passo a passo", "Para iniciantes"].map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-background px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-accent"
                >
                  {b}
                </span>
              ))}
            </div>

            <button
              onClick={() => goToCheckout("course-bonus")}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-background px-6 py-4 text-sm font-bold uppercase tracking-wide text-accent transition-colors hover:bg-[#0c0f10] sm:w-auto sm:px-10"
            >
              Quero acessar a biblioteca
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
