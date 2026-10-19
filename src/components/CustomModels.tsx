"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Check, MessageCircle, Ruler, Send } from "lucide-react";
import { formatPrice } from "@/config/product";
import {
  buildCustomRequestMessage,
  customServices,
  deadlineOptions,
  getCustomRequestWhatsAppLink,
  referenceOptions,
} from "@/config/customModels";
import type { CustomRequest } from "@/config/customModels";
import { trackEvent } from "@/config/analytics";

const empty: CustomRequest = {
  nome: "",
  empresa: "",
  whatsapp: "",
  servico: customServices[0].name,
  descricao: "",
  referencia: "",
  prazo: "",
};

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-accent/60";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary";

export default function CustomModels() {
  const [form, setForm] = useState<CustomRequest>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomRequest, string>>>({});
  const [sentLink, setSentLink] = useState<string | null>(null);

  function update<K extends keyof CustomRequest>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function choose(serviceName: string) {
    update("servico", serviceName);
    document.getElementById("pedido-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validate() {
    const e: Partial<Record<keyof CustomRequest, string>> = {};
    if (form.nome.trim().length < 2) e.nome = "Informe seu nome.";
    if (form.whatsapp.replace(/\D/g, "").length < 10) e.whatsapp = "Informe um WhatsApp com DDD.";
    if (form.descricao.trim().length < 10)
      e.descricao = "Descreva o que você precisa (equipamento, dimensões, finalidade).";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    const link = getCustomRequestWhatsAppLink(buildCustomRequestMessage(form));
    try {
      trackEvent("Lead", { content_name: form.servico, origin: "modelo-personalizado" });
    } catch {
      // rastreamento nunca bloqueia o envio
    }
    setSentLink(link);
    window.open(link, "_blank", "noopener,noreferrer");
  }

  return (
    <section id="sob-medida" className="section-py relative overflow-hidden bg-surface">
      <div className="bg-technical-grid pointer-events-none absolute inset-0 opacity-[0.35]" />
      <div className="container-px relative mx-auto max-w-content">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <Ruler className="h-3.5 w-3.5" />
            Modelo sob medida
          </span>
          <h2 className="mt-5 text-2xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-4xl">
            Não achou o equipamento que precisa?
            <br />
            <span className="text-accent">A gente modela para você.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            Envie o desenho, a foto ou só as dimensões principais. Você recebe o modelo 3D pronto
            para o seu projeto, proposta técnica ou planejamento de manobra.
          </p>
        </div>

        {/* Pacotes */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {customServices.map((s) => (
            <div
              key={s.id}
              className={`card-surface relative flex flex-col bg-background p-6 ${
                s.highlight ? "border-accent/40 shadow-[0_0_60px_-24px_rgba(210,245,30,0.35)]" : ""
              }`}
            >
              {s.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-background">
                  Mais rápido
                </span>
              )}
              <h3 className="text-base font-bold text-white">{s.name}</h3>
              <div className="mt-3">
                {s.priceFrom !== null ? (
                  <>
                    <span className="text-xs uppercase tracking-wide text-text-secondary">a partir de</span>
                    <div className="font-mono text-3xl font-extrabold text-accent">
                      {formatPrice(s.priceFrom)}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-xs uppercase tracking-wide text-text-secondary">valor</span>
                    <div className="font-mono text-3xl font-extrabold text-white">Sob orçamento</div>
                  </>
                )}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">{s.description}</p>
              <ul className="mt-5 space-y-2">
                {s.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-text-secondary">
                <span className="font-semibold text-white/70">Exemplos: </span>
                {s.examples}
              </p>
              <button
                type="button"
                onClick={() => choose(s.name)}
                className={`${s.highlight ? "btn-primary" : "btn-secondary"} mt-6 w-full text-xs`}
              >
                Pedir este modelo
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Formulário + WhatsApp */}
        <div
          id="pedido-form"
          className="mx-auto mt-14 grid max-w-5xl scroll-mt-24 gap-6 lg:grid-cols-[1.4fr_0.9fr]"
        >
          <form onSubmit={handleSubmit} noValidate className="card-surface bg-background p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white">Pedir orçamento</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Preencha em 1 minuto. O pedido vai direto para o WhatsApp da PlanoUP, já organizado.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nome" className={labelClass}>Nome *</label>
                <input
                  id="nome"
                  className={inputClass}
                  value={form.nome}
                  onChange={(e) => update("nome", e.target.value)}
                  autoComplete="name"
                />
                {errors.nome && <p className="mt-1 text-xs text-red-400">{errors.nome}</p>}
              </div>
              <div>
                <label htmlFor="empresa" className={labelClass}>Empresa</label>
                <input
                  id="empresa"
                  className={inputClass}
                  value={form.empresa}
                  onChange={(e) => update("empresa", e.target.value)}
                  autoComplete="organization"
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label htmlFor="whatsapp" className={labelClass}>WhatsApp *</label>
                <input
                  id="whatsapp"
                  type="tel"
                  inputMode="tel"
                  className={inputClass}
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  autoComplete="tel"
                  placeholder="(84) 99999-9999"
                />
                {errors.whatsapp && <p className="mt-1 text-xs text-red-400">{errors.whatsapp}</p>}
              </div>
              <div>
                <label htmlFor="servico" className={labelClass}>Tipo de serviço *</label>
                <select
                  id="servico"
                  className={inputClass}
                  value={form.servico}
                  onChange={(e) => update("servico", e.target.value)}
                >
                  {customServices.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="descricao" className={labelClass}>O que você precisa? *</label>
                <textarea
                  id="descricao"
                  rows={4}
                  className={inputClass}
                  value={form.descricao}
                  onChange={(e) => update("descricao", e.target.value)}
                  placeholder="Ex.: vaso de pressão vertical, Ø 1,2 m x 3,5 m, com 4 bocais e saia. Uso em proposta técnica."
                />
                {errors.descricao && <p className="mt-1 text-xs text-red-400">{errors.descricao}</p>}
              </div>
              <div>
                <label htmlFor="referencia" className={labelClass}>Tem alguma referência?</label>
                <select
                  id="referencia"
                  className={inputClass}
                  value={form.referencia}
                  onChange={(e) => update("referencia", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {referenceOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="prazo" className={labelClass}>Prazo</label>
                <select
                  id="prazo"
                  className={inputClass}
                  value={form.prazo}
                  onChange={(e) => update("prazo", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {deadlineOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary mt-6 w-full text-sm">
              Enviar pedido pelo WhatsApp
              <Send className="h-4 w-4" />
            </button>

            {sentLink && (
              <p className="mt-4 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-white/90">
                Pedido pronto! Se o WhatsApp não abriu,{" "}
                <a href={sentLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline">
                  clique aqui para enviar
                </a>
                . Os arquivos de referência (desenho, fotos) você manda na própria conversa.
              </p>
            )}
          </form>

          <aside className="card-surface flex flex-col justify-between bg-background p-6 sm:p-8">
            <div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                <MessageCircle className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-white">Prefere conversar direto?</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Chame no WhatsApp, mande o desenho ou a foto e explique o que precisa. Respondemos com
                o orçamento e o prazo.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-white/90">
                {[
                  "Orçamento sem compromisso",
                  "Prazo combinado antes de começar",
                  "Modelo entregue em .SKP editável",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <a
              href={getCustomRequestWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("Contact", { origin: "modelo-personalizado" })}
              className="btn-secondary mt-8 w-full text-xs"
            >
              Falar no WhatsApp
              <ArrowRight className="h-4 w-4" />
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
