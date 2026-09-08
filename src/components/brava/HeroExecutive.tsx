"use client";

import { Users, Clock, ShieldCheck, Leaf, ArrowRight, FileText } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { STATUS_META } from "@/lib/brava/status-meta";
import BlueprintGrid from "./BlueprintGrid";
import TankIllustration from "./TankIllustration";

const HERO_TANK_TAG = "TQ-41008";

const BENEFITS = [
  { icon: Users, label: "Mais confiabilidade" },
  { icon: Clock, label: "Mais disponibilidade" },
  { icon: ShieldCheck, label: "Mais segurança" },
  { icon: Leaf, label: "Um futuro mais sustentável" },
];

export default function HeroExecutive() {
  const { tanks } = useBravaData();
  const heroTank = tanks.find((t) => t.tag === HERO_TANK_TAG);
  const heroStatusLabel = heroTank
    ? heroTank.status === "CONCLUIDO"
      ? "Manutenção Concluída"
      : STATUS_META[heroTank.status].label
    : "Ativo Industrial";

  return (
    <section className="relative overflow-hidden border-b border-brava-border bg-brava-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left — institutional / executive copy */}
        <div className="relative z-10 flex flex-col justify-center gap-6 px-5 py-10 sm:px-8 sm:py-14 lg:py-16 xl:pl-14">
          <BravaWordmark />

          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-[2px] w-6 bg-brava-accent" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-brava-text-secondary">
                Manutenção Industrial
              </span>
            </div>

            <h1 className="mt-3 leading-[0.98] tracking-tight text-brava-blue">
              <span className="block text-[2.3rem] font-extrabold sm:text-[3rem] lg:text-[3.4rem]">
                TANK MAINTENANCE
              </span>
              <span className="block text-[2.3rem] font-light sm:text-[3rem] lg:text-[3.4rem]">
                CONTROL CENTER
              </span>
            </h1>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-brava-text-secondary sm:text-base">
              Gestão integrada das manutenções de tanques industriais.
              <br />
              Planejamento, execução e resultados em um só lugar.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-7 gap-y-3">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-brava-blue" strokeWidth={1.75} />
                <span className="text-[12.5px] leading-tight text-brava-text-secondary">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#tank-control"
              className="inline-flex items-center gap-2 rounded-brava-md bg-brava-accent px-5 py-3 text-[13.5px] font-bold text-brava-blue-dark shadow-brava-sm transition-transform duration-150 hover:brightness-[1.03] active:scale-[0.98]"
            >
              Acompanhar tanques
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#cronograma"
              className="inline-flex items-center gap-2 rounded-brava-md border border-brava-border bg-brava-white px-5 py-3 text-[13.5px] font-semibold text-brava-blue transition-colors duration-150 hover:border-brava-blue/30 hover:bg-brava-bg"
            >
              <FileText className="h-4 w-4" />
              Ver cronograma
            </a>
          </div>

          <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-brava-text-secondary">
            Brava Energia &nbsp;|&nbsp; Ativo Industrial de Guamaré &nbsp;|&nbsp; Manutenção é o que nos move
          </p>
        </div>

        {/* Right — technical / photographic composition. Photo is the real
            TQ-41008 tank (public/images/brava/hero-tq-41008.jpg). The white
            wedge + soft mask reproduce the reference's angular, non-vertical
            transition instead of a hard split. */}
        <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
          <div className="brava-hero-photo brava-hero-photo-mask absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-brava-blue-dark/35 via-transparent to-brava-blue-dark/10" />

          {/* Technical HUD overlay */}
          <BlueprintGrid className="absolute inset-0 h-full w-full text-brava-white opacity-30" />
          <TankIllustration
            variant="hero"
            className="absolute bottom-10 right-10 h-[220px] w-[220px] text-brava-white/20 xl:h-[260px] xl:w-[260px]"
          />

          {/* Organic/angular white wedge cut into the left edge of the photo */}
          <svg
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-[30%] text-brava-white"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon fill="currentColor" points="0,0 62,0 38,22 52,46 30,68 44,100 0,100" />
          </svg>
          <span className="absolute inset-y-0 left-[26%] w-px bg-brava-accent/40 xl:left-[24%]" />

          {/* Location tag */}
          <div className="absolute right-6 top-6 text-right [text-shadow:0_1px_6px_rgba(23,16,82,0.6)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brava-white">Guamaré / RN</p>
            <p className="mt-0.5 max-w-[180px] text-[11px] leading-snug text-brava-white/90">
              Energia que impulsiona desenvolvimento.
            </p>
          </div>

          {/* Featured asset caption — real TAG + real status, nothing fabricated */}
          <div className="absolute bottom-[38%] left-[42%] flex items-center gap-3">
            <span className="h-10 w-[3px] rounded-full bg-brava-accent" />
            <div>
              <p className="font-mono text-lg font-extrabold leading-none text-brava-white [text-shadow:0_1px_8px_rgba(23,16,82,0.7)]">
                {HERO_TANK_TAG}
              </p>
              <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-wide text-brava-white/80 [text-shadow:0_1px_6px_rgba(23,16,82,0.7)]">
                {heroStatusLabel}
              </p>
            </div>
          </div>

          {/* Bottom-right institutional card */}
          <div className="absolute bottom-6 right-6 flex overflow-hidden rounded-brava-md bg-brava-blue-dark shadow-brava-lg">
            <span className="w-1 shrink-0 bg-brava-accent" />
            <div className="px-4 py-3 text-right">
              <p className="text-[11.5px] font-bold uppercase tracking-wide text-brava-white">Planejamento Hoje</p>
              <p className="text-[11.5px] font-bold uppercase tracking-wide text-brava-accent">Operação Amanhã</p>
            </div>
          </div>
        </div>

        {/* Mobile — compact photo strip (image + asset caption, no HUD clutter) */}
        <div className="relative flex h-56 overflow-hidden border-t border-brava-border lg:hidden">
          <div className="brava-hero-photo absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-brava-blue-dark/50 via-transparent to-transparent" />
          <div className="relative z-10 mt-auto flex items-center gap-3 p-5">
            <span className="h-8 w-[3px] rounded-full bg-brava-accent" />
            <div>
              <p className="font-mono text-base font-extrabold leading-none text-brava-white">{HERO_TANK_TAG}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-brava-white/75">
                {heroStatusLabel} · Guamaré/RN
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BravaWordmark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-brava-sm bg-brava-blue">
        <span className="font-mono text-xl font-extrabold leading-none text-brava-accent">B</span>
      </div>
      <div className="leading-tight">
        <p className="text-[19px] font-extrabold tracking-tight text-brava-blue">
          BRAVA <span className="font-light">ENERGIA</span>
        </p>
        <p className="text-[11px] text-brava-text-secondary">Energia para um futuro mais seguro.</p>
      </div>
    </div>
  );
}
