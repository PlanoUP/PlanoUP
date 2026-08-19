"use client";

import { useEffect, useState } from "react";
import { ArrowRight, MessageCircle, X } from "lucide-react";
import { getWhatsAppLink } from "@/config/site";
import { isMetaPixelEnabled, trackEvent } from "@/config/analytics";

/**
 * Registra o clique em "Falar com a PlanoUP" nos provedores de analytics
 * já configurados. É um no-op seguro enquanto nenhum pixel/GA estiver
 * ativo, e nunca deve impedir o redirecionamento para o WhatsApp.
 */
function trackWhatsAppSupportClick() {
  try {
    trackEvent("whatsapp_support_click");

    if (typeof window === "undefined") return;
    const w = window as typeof window & { fbq?: (...args: unknown[]) => void };
    if (isMetaPixelEnabled() && typeof w.fbq === "function") {
      w.fbq("trackCustom", "WhatsAppSupportClick");
    }
  } catch {
    // rastreamento nunca deve bloquear o acesso ao suporte
  }
}

export default function WhatsAppSupport() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed bottom-[112px] right-4 z-40 sm:bottom-6 sm:right-6">
        {open && (
          <div
            role="dialog"
            aria-label="Atendimento PlanoUP"
            className="absolute bottom-full right-0 mb-3 w-[min(360px,calc(100vw-32px))] origin-bottom-right animate-popover-in rounded-xl border border-border bg-surface-light p-5 shadow-2xl shadow-black/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                  PlanoUP
                </span>
                <h3 className="text-sm font-bold text-white">Atendimento</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar atendimento"
                className="rounded-md p-1 text-text-secondary transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/90">
              Olá! 👋
              <br />
              <br />
              Ficou com alguma dúvida sobre a Biblioteca Industrial 3D?
              <br />
              <br />
              Fale diretamente com a PlanoUP pelo WhatsApp.
            </p>

            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackWhatsAppSupportClick}
              className="btn-primary mt-5 w-full text-sm"
            >
              Falar com a PlanoUP
              <ArrowRight className="h-4 w-4" />
            </a>

            <p className="mt-3 text-center text-[11px] text-text-secondary">
              Canal destinado a dúvidas sobre o produto.
            </p>
          </div>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fechar atendimento" : "Abrir atendimento PlanoUP pelo WhatsApp"}
          className="flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-3 shadow-lg shadow-black/40 transition-colors duration-150 hover:border-accent/40 hover:bg-surface-light sm:gap-3 sm:px-5"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <MessageCircle className="h-4 w-4" />
          </span>
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-xs font-bold text-white">Precisa de ajuda?</span>
            <span className="text-[11px] text-text-secondary">Fale com a PlanoUP</span>
          </span>
          <span className="text-xs font-semibold text-white sm:hidden">Dúvidas?</span>
        </button>
      </div>
    </>
  );
}
