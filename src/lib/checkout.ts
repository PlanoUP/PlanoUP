import { product } from "@/config/product";
import { getUtmParams, trackEvent } from "@/config/analytics";

/**
 * Ponto único de redirecionamento para o checkout.
 * Nenhum componente deve montar a URL de checkout manualmente —
 * todos os CTAs chamam esta função.
 */
export function goToCheckout(origin: string) {
  trackEvent("InitiateCheckout", { origin, value: product.price, currency: "BRL" });

  const url = `${product.checkoutUrl}${getUtmParams()}`;

  if (typeof window !== "undefined") {
    window.location.href = url;
  }
}
