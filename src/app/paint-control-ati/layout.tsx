"use client";

import Sidebar from "@/components/paint-control/Sidebar";
import { usePaintControlStore } from "@/lib/paint-control/store";

export default function PaintControlLayout({ children }: { children: React.ReactNode }) {
  const hasHydrated = usePaintControlStore((s) => s.hasHydrated);

  return (
    <div className="flex min-h-screen w-full bg-white text-slate-900">
      <Sidebar />
      <main className="min-w-0 flex-1 bg-slate-50/40">
        <div className="mx-auto max-w-[1600px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          {hasHydrated ? (
            children
          ) : (
            <div className="flex h-[70vh] items-center justify-center">
              <div className="flex items-center gap-2.5 text-sm font-medium text-slate-400">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                Carregando PAINT CONTROL ATI...
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
