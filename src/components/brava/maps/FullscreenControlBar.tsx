import LiveClock from "./LiveClock";

export interface FullscreenSummary {
  emExecucao: number;
  atrasado: number;
  critico: number;
  concluido: number;
}

export default function FullscreenControlBar({ title, summary }: { title: string; summary: FullscreenSummary }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-10 z-30 flex -translate-x-1/2 flex-col items-center gap-1.5">
      <div className="flex items-center gap-3 rounded-brava-sm border border-white/15 bg-black/65 px-4 py-2 text-white shadow-brava-lg backdrop-blur-sm">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.6)] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-red-400">Ao Vivo</span>
        </span>
        <span className="h-4 w-px bg-white/20" />
        <span className="whitespace-nowrap text-center text-[13px] font-bold uppercase tracking-[0.12em]">
          {title}
        </span>
        <span className="h-4 w-px bg-white/20" />
        <LiveClock className="font-mono text-[12px] font-semibold tabular-nums text-white/80" />
      </div>

      <div className="flex items-center gap-3 rounded-brava-sm border border-white/10 bg-black/50 px-3.5 py-1.5 text-[10.5px] font-bold text-white/90 shadow-brava-md backdrop-blur-sm">
        <KpiChip label="Em Execução" value={summary.emExecucao} dotClass="bg-brava-blue" />
        <KpiChip label="Atrasados" value={summary.atrasado} dotClass="bg-brava-warning" />
        <KpiChip label="Críticos" value={summary.critico} dotClass="bg-brava-danger" />
        <KpiChip label="Concluídos" value={summary.concluido} dotClass="bg-brava-success" />
      </div>
    </div>
  );
}

function KpiChip({ label, value, dotClass }: { label: string; value: number; dotClass: string }) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {label}
      <span className="font-mono text-white">{value}</span>
    </span>
  );
}
