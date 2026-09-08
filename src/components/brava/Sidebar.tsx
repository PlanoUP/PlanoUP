"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Boxes, GanttChartSquare, LayoutList, Droplets } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { formatShort } from "@/lib/brava/date-utils";
import { cn } from "@/lib/brava/cn";

const NAV_ITEMS = [
  { href: "/brava", label: "Visão Geral", icon: LayoutGrid, matchExact: true },
  { href: "/brava#tank-control", label: "Tank Control", icon: Boxes, matchExact: false },
  { href: "/brava#cronograma", label: "Cronograma", icon: LayoutList, matchExact: false },
  { href: "/brava/consolidado", label: "Consolidado", icon: GanttChartSquare, matchExact: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { today } = useBravaData();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-brava-border bg-brava-white lg:flex">
      <div className="flex h-[72px] items-center gap-3 border-b border-brava-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-brava-sm bg-brava-blue">
          <Droplets className="h-4.5 w-4.5 text-brava-accent" strokeWidth={2} />
        </div>
        <div className="leading-tight">
          <p className="text-[13.5px] font-extrabold tracking-tight text-brava-blue-dark">BRAVA ENERGIA</p>
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-brava-text-secondary">
            Tank Control System
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-4 py-5">
        {NAV_ITEMS.map((item) => {
          const active = item.matchExact ? pathname === item.href : false;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-brava-sm px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-brava-blue text-brava-white"
                  : "text-brava-text-secondary hover:bg-brava-bg hover:text-brava-blue-dark"
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-brava-accent" />}
              <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-brava-border px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brava-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brava-accent" />
          </span>
          <p className="text-[11.5px] font-semibold text-brava-blue-dark">Sistema operacional</p>
        </div>
        <p className="mt-1.5 text-[11px] text-brava-text-secondary">Atualizado em {formatShort(today)}</p>
        <p className="mt-3 border-t border-brava-border pt-3 text-[10.5px] leading-relaxed text-brava-text-secondary">
          Tank Maintenance Control System
          <br />
          Polo Potiguar — TAG / ATI
        </p>
      </div>
    </aside>
  );
}
