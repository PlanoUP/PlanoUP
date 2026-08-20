"use client";

import { useEffect, useState } from "react";
import { product, formatPrice } from "@/config/product";
import CheckoutLink from "./CheckoutLink";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md transition-transform duration-200 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="font-mono text-base font-extrabold text-accent">
          {formatPrice(product.price)}
        </span>
        <CheckoutLink
          origin="sticky-mobile"
          className="flex h-[52px] flex-1 items-center justify-center rounded-md bg-accent px-4 text-sm font-bold uppercase tracking-wide text-background active:scale-[0.99]"
        >
          Acessar biblioteca
        </CheckoutLink>
      </div>
    </div>
  );
}
