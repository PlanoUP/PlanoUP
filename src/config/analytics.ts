/**
 * Estrutura de analytics. O Meta Pixel da PlanoUP já está configurado;
 * NEXT_PUBLIC_META_PIXEL_ID permite sobrepor por ambiente (ex: staging)
 * sem tocar no código. O GA segue vazio até um ID real ser fornecido.
 */
export const analytics = {
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "1387214533512450",
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID ?? "",
};

export function isMetaPixelEnabled() {
  return analytics.metaPixelId.length > 0;
}

export function isGoogleAnalyticsEnabled() {
  return analytics.googleAnalyticsId.length > 0;
}

/**
 * Dispara um evento de analytics se os provedores estiverem configurados.
 * Hoje é um no-op seguro; fica pronto para registrar eventos (ex: Lead,
 * InitiateCheckout) assim que os pixels forem configurados.
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const w = window as typeof window & {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  };

  if (isMetaPixelEnabled() && typeof w.fbq === "function") {
    w.fbq("track", eventName, params);
  }

  if (isGoogleAnalyticsEnabled() && typeof w.gtag === "function") {
    w.gtag("event", eventName, params);
  }
}

/**
 * Preserva os parâmetros UTM da URL atual para reenvio ao checkout.
 */
export function getUtmParams() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const utmKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
  ];
  const utm = new URLSearchParams();
  utmKeys.forEach((key) => {
    const value = params.get(key);
    if (value) utm.set(key, value);
  });
  const qs = utm.toString();
  return qs ? `?${qs}` : "";
}
