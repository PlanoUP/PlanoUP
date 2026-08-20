"use client";

import { useEffect, useState } from "react";
import { product, formatPrice } from "@/config/product";
import { site } from "@/config/site";
import CheckoutLink from "./CheckoutLink";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 ${
        scrolled ? "border-b border-border bg-background/90 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-px mx-auto flex h-16 max-w-content items-center justify-between sm:h-20">
        <a href="#topo" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/40 bg-surface text-sm font-bold text-accent">
            P
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-wide text-white sm:text-base">
              {site.name}
            </span>
            <span className="hidden font-mono text-[10px] tracking-[0.14em] text-text-secondary sm:block">
              {site.slogan}
            </span>
          </span>
        </a>

        <nav className="flex items-center gap-3">
          <a
            href="#equipamentos"
            className="hidden text-sm font-medium text-text-secondary transition-colors hover:text-white sm:block"
          >
            Ver biblioteca
          </a>
          <CheckoutLink
            origin="header"
            className="rounded-md bg-accent px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-background transition-colors hover:bg-accent-hover sm:px-5 sm:text-sm"
          >
            Comprar por {formatPrice(product.price)}
          </CheckoutLink>
        </nav>
      </div>
    </header>
  );
}
