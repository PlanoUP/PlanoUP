"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  Factory,
  ClipboardList,
  Flag,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  PaintBucket,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/paint-control-ati", label: "Visão Geral", icon: LayoutGrid, exact: true },
  { href: "/paint-control-ati/unidades", label: "Unidades", icon: Factory },
  { href: "/paint-control-ati/atividades", label: "Atividades", icon: ClipboardList },
  { href: "/paint-control-ati/prioridades", label: "Prioridades", icon: Flag },
  { href: "/paint-control-ati/programacao", label: "Programação", icon: CalendarDays },
  { href: "/paint-control-ati/responsaveis", label: "Responsáveis", icon: Users },
  { href: "/paint-control-ati/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/paint-control-ati/configuracoes", label: "Configurações", icon: Settings },
];

const STORAGE_KEY = "pcati-sidebar-collapsed";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${
        collapsed ? "w-[68px]" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-accent">
          <PaintBucket className="h-4 w-4" />
        </span>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-bold tracking-wide text-slate-900">
              PAINT CONTROL
            </p>
            <p className="truncate text-[11px] font-semibold tracking-wide text-slate-400">
              ATI GUAMARÉ
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = mounted && isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-900 text-accent"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-100 p-2.5">
        <button
          onClick={toggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-50 hover:text-slate-700"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && "Recolher"}
        </button>
      </div>
    </aside>
  );
}
