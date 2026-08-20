"use client";

import { useEffect, useState } from "react";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { product } from "@/config/product";
import { getUtmParams, trackEvent } from "@/config/analytics";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel"> & {
  origin: string;
  children: ReactNode;
};

/**
 * Link real (não <button>) para o checkout. Único lugar que resolve a URL —
 * nenhum componente deve montar/duplicar o link de checkout manualmente.
 * Abre em nova aba e preserva os parâmetros UTM da página quando presentes.
 */
export default function CheckoutLink({ origin, children, onClick, ...rest }: Props) {
  const [href, setHref] = useState(product.checkoutUrl);

  useEffect(() => {
    setHref(`${product.checkoutUrl}${getUtmParams()}`);
  }, []);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackEvent("InitiateCheckout", { origin, value: product.price, currency: "BRL" });
    onClick?.(event);
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
