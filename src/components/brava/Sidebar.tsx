"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, GanttChartSquare, Droplets } from "lucide-react";
import { cn } from "@/lib/brava/cn";

const NAV_ITEMS = [
  { href: "/brava", label: "Visão Geral", icon: LayoutGrid, exact: true },
  { href: "/brava/consolidado", label: "Consolidado", icon: GanttChartSquare, exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-brava-border bg-brava-white lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-brava-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-brava-sm bg-brava-blue">
          <Droplets className="h-4 w-4 text-brava-accent" strokeWidth={2} />
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-bold tracking-tight text-brava-blue-dark">BRAVA ENERGIA</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-brava-text-secondary">
            Tank Control
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-brava-sm px-3 py-2 text-[13px] font-medium transition-colors",
                active
                  ? "bg-brava-blue text-brava-white"
                  : "text-brava-text-secondary hover:bg-brava-bg hover:text-brava-text"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-brava-border px-5 py-4">
        <p className="text-[11px] leading-relaxed text-brava-text-secondary">
          Tank Maintenance Control System
          <br />
          Polo Potiguar — TAG / ATI
        </p>
      </div>
    </aside>
  );
}
