"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { TankWithDerived } from "@/lib/brava/types";
import { todayISO, formatShort } from "@/lib/brava/date-utils";

/** Downloads the PDF compiling today's PT, efetivo and activity entries for this tank — "no final do dia de trabalho". */
export default function GerarRelatorioButton({ tank }: { tank: TankWithDerived }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setDownloading(true);
    setError(null);
    try {
      const date = todayISO();
      const res = await fetch(`/api/field-entries/report?tankId=${encodeURIComponent(tank.id)}&date=${date}`);
      if (!res.ok) throw new Error("Falha ao gerar o relatório.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-${tank.tag}-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar o relatório.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={downloading}
        className="flex items-center justify-center gap-2 rounded-brava-lg border-2 border-brava-blue bg-brava-white py-3 text-[13.5px] font-bold text-brava-blue-dark disabled:opacity-60"
      >
        <FileDown className="h-4.5 w-4.5" />
        {downloading ? "Gerando..." : `Gerar Relatório do Dia (${formatShort(todayISO())})`}
      </button>
      {error && <p className="text-center text-[12px] font-semibold text-brava-danger">{error}</p>}
    </div>
  );
}
