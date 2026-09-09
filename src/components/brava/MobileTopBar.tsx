"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/brava/cn";

const NAV_ITEMS = [
  { href: "/brava", label: "Visão Geral", matchExact: true },
  { href: "/brava#tank-control", label: "Tank Control", matchExact: false },
  { href: "/brava#cronograma", label: "Cronograma", matchExact: false },
  { href: "/brava/consolidado", label: "Consolidado", matchExact: true },
  { href: "/brava/materiais", label: "Materiais", matchExact: true },
];

export default function MobileTopBar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 border-b border-brava-border bg-brava-white lg:hidden">
      <div className="flex items-center gap-2.5 px-4 py-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-brava-sm bg-brava-blue">
          <span className="font-mono text-[13px] font-extrabold leading-none text-brava-accent">B</span>
        </div>
        <p className="text-[12.5px] font-extrabold tracking-tight text-brava-blue-dark">BRAVA ENERGIA</p>
      </div>
      <nav className="brava-scrollbar flex gap-1 overflow-x-auto px-4 pb-2.5">
        {NAV_ITEMS.map((item) => {
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
