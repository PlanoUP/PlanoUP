import Link from "next/link";
import type { Unit } from "@/types/paint-control";
import type { UnitStats } from "@/lib/paint-control/calculations";
import ProgressBar from "@/components/paint-control/ProgressBar";

export default function UnitCard({ unit, stats }: { unit: Unit; stats: UnitStats }) {
  return (
    <Link
      href={`/paint-control-ati/unidades/${unit.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-slate-900">{unit.tag}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{unit.name}</p>
        </div>
        {stats.total > 0 && (
          <span className="shrink-0 rounded-md bg-slate-900 px-2 py-1 text-xs font-bold text-accent">
            {stats.avgProgress}%
          </span>
        )}
      </div>

      <div className="mt-3">
        <ProgressBar value={stats.avgProgress} showLabel={false} />
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-slate-50 py-1.5">
          <p className="text-sm font-bold text-slate-900">{stats.total}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Total</p>
        </div>
        <div className="rounded-lg bg-slate-50 py-1.5">
          <p className={`text-sm font-bold ${stats.critical > 0 ? "text-rose-600" : "text-slate-900"}`}>
            {stats.critical}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Críticas</p>
        </div>
        <div className="rounded-lg bg-slate-50 py-1.5">
          <p className="text-sm font-bold text-slate-900">{stats.inExecution}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Em Exec.</p>
        </div>
      </div>

      {stats.overdue > 0 && (
        <p className="mt-3 text-[11px] font-semibold text-rose-600">
          {stats.overdue} serviço{stats.overdue > 1 ? "s" : ""} atrasado{stats.overdue > 1 ? "s" : ""}
        </p>
      )}
    </Link>
  );
}
