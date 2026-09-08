"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplets } from "lucide-react";
import { cn } from "@/lib/brava/cn";

const NAV_ITEMS = [
  { href: "/brava", label: "Visão Geral", exact: true },
  { href: "/brava/consolidado", label: "Consolidado", exact: false },
];

export default function MobileTopBar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 flex items-center gap-4 border-b border-brava-border bg-brava-white px-4 py-2.5 lg:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-brava-sm bg-brava-blue">
          <Droplets className="h-3.5 w-3.5 text-brava-accent" strokeWidth={2} />
        </div>
        <p className="text-[12px] font-bold tracking-tight text-brava-blue-dark">BRAVA ENERGIA</p>
      </div>
      <nav className="flex gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                active ? "bg-brava-blue text-brava-white" : "text-brava-text-secondary hover:bg-brava-bg"
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
