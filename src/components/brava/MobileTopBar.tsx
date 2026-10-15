"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Unlock } from "lucide-react";
import { useEditAuth } from "@/lib/brava/editAuthContext";
import { cn } from "@/lib/brava/cn";

const TANQUES_NAV_ITEMS = [
  { href: "/brava", label: "Visão Geral", matchExact: true },
  { href: "/brava#tank-control", label: "Tank Control", matchExact: false },
  { href: "/brava#cronograma", label: "Cronograma", matchExact: false },
  { href: "/brava/mapa", label: "Mapa", matchExact: true },
  { href: "/brava/materiais", label: "Materiais", matchExact: true },
  { href: "/brava/consolidado", label: "Consolidado", matchExact: true },
];

const UNIDADES_NAV_ITEMS = [
  { href: "/brava/unidades", label: "Visão Geral", matchExact: true },
  { href: "/brava/unidades#equipment-control", label: "Equipment Control", matchExact: false },
  { href: "/brava/unidades#cronograma", label: "Cronograma", matchExact: false },
  { href: "/brava/unidades/mapa", label: "Mapa", matchExact: true },
  { href: "/brava/unidades/materiais", label: "Materiais", matchExact: true },
  { href: "/brava/unidades/consolidado", label: "Consolidado", matchExact: true },
];

export default function MobileTopBar() {
  const pathname = usePathname();
  const { isEditor, requireEditor, lock } = useEditAuth();
  const isUnidades = pathname.startsWith("/brava/unidades");
  const navItems = isUnidades ? UNIDADES_NAV_ITEMS : TANQUES_NAV_ITEMS;

  return (
    <div className="sticky top-0 z-40 border-b border-brava-border bg-brava-white lg:hidden">
      <div className="flex items-center justify-between gap-2.5 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-brava-sm bg-brava-blue">
            <span className="font-mono text-[13px] font-extrabold leading-none text-brava-accent">B</span>
          </div>
          <p className="text-[12.5px] font-extrabold tracking-tight text-brava-blue-dark">BRAVA ENERGIA</p>
        </div>
        <button
          type="button"
          onClick={() => (isEditor ? lock() : requireEditor())}
          aria-label={isEditor ? "Bloquear edição" : "Desbloquear edição"}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-brava-sm border transition-colors",
            isEditor
              ? "border-brava-success-border bg-brava-success-bg text-brava-success"
              : "border-brava-border bg-brava-white text-brava-text-secondary"
          )}
        >
          {isEditor ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div className="flex gap-1.5 px-4 pb-2">
        <Link
          href="/brava"
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
            !isUnidades ? "bg-brava-blue text-brava-white" : "bg-brava-bg text-brava-text-secondary"
          )}
        >
          Tanques
        </Link>
        <Link
          href="/brava/unidades"
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
            isUnidades ? "bg-brava-blue text-brava-white" : "bg-brava-bg text-brava-text-secondary"
          )}
        >
          Unidades
        </Link>
      </div>
      <nav className="brava-scrollbar flex gap-1 overflow-x-auto px-4 pb-2.5">
        {navItems.map((item) => {
          const active = item.matchExact && pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                active ? "bg-brava-blue text-brava-white" : "bg-brava-bg text-brava-text-secondary"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
