import { AssetMapConfig } from "@/lib/brava/maps/types";
import { MapSummary } from "@/lib/brava/maps/selectors";
import { formatShort } from "@/lib/brava/date-utils";

export default function MapSummaryCard({ map, summary }: { map: AssetMapConfig; summary: MapSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-brava-lg border border-brava-border bg-brava-white px-5 py-3.5 shadow-brava-sm">
      <div>
        <p className="text-[13px] font-bold text-brava-blue-dark">{map.name}</p>
        <p className="text-[11px] text-brava-text-secondary">{summary.total} ativos</p>
      </div>
      <Stat label="Críticos" value={summary.criticos} tone={summary.criticos > 0 ? "danger" : "neutral"} />
      <Stat label="Em Manutenção" value={summary.emManutencao} />
      {summary.proximaInspecao && (
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-brava-text-secondary">Próxima Inspeção</p>
          <p className="truncate text-[12.5px] font-semibold text-brava-text">
            <span className="font-mono text-brava-blue-dark">{summary.proximaInspecao.tag}</span> ·{" "}
            {formatShort(summary.proximaInspecao.date)}
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "danger" }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-brava-text-secondary">{label}</p>
      <p className={`font-mono text-[18px] font-extrabold leading-none ${tone === "danger" ? "text-brava-danger" : "text-brava-blue-dark"}`}>
        {value}
      </p>
    </div>
  );
}
