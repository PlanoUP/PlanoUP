"use client";

import { useState } from "react";
import { Crosshair, Copy, Check } from "lucide-react";

/**
 * Development-only tool (see AssetMapExplorer's NODE_ENV guard) — click
 * anywhere on the map to capture its %X/%Y, pick which TAG that is, and copy
 * a ready-to-paste coordinate entry for lib/brava/maps/config.ts. Never
 * rendered for end users.
 */
export default function MapCalibrationPanel({
  active,
  onToggle,
  point,
  tankIds,
}: {
  active: boolean;
  onToggle: () => void;
  point: { x: number; y: number } | null;
  tankIds: string[];
}) {
  const [tag, setTag] = useState(tankIds[0] ?? "");
  const [copied, setCopied] = useState(false);

  const snippet = point
    ? `{ tag: "${tag}", x: ${point.x.toFixed(2)}, y: ${point.y.toFixed(2)} },`
    : "";

  async function copy() {
    if (!snippet) return;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — snippet is still visible to copy manually
    }
  }

  return (
    <div className="absolute left-3 top-3 z-30 w-max max-w-[280px]">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-1.5 rounded-brava-sm border px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide shadow-brava-md ${
          active ? "border-brava-accent bg-brava-blue-dark text-brava-accent" : "border-brava-border bg-brava-white text-brava-text-secondary"
        }`}
      >
        <Crosshair className="h-3.5 w-3.5" />
        Modo de Calibração {active ? "ON" : "OFF"}
      </button>

      {active && (
        <div className="mt-2 space-y-2 rounded-brava-md border border-brava-border bg-brava-white p-3 shadow-brava-lg">
          <p className="text-[10.5px] text-brava-text-secondary">Clique no mapa para capturar X/Y.</p>
          {point ? (
            <p className="font-mono text-[12px] font-bold text-brava-blue-dark">
              x: {point.x.toFixed(2)} · y: {point.y.toFixed(2)}
            </p>
          ) : (
            <p className="text-[11px] text-brava-text-secondary">Nenhum ponto capturado ainda.</p>
          )}
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full rounded-brava-sm border border-brava-border px-2 py-1 text-[12px]"
          >
            {tankIds.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={copy}
            disabled={!point}
            className="flex w-full items-center justify-center gap-1.5 rounded-brava-sm bg-brava-blue px-3 py-1.5 text-[12px] font-semibold text-brava-white disabled:opacity-40"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar configuração"}
          </button>
          {snippet && <code className="block break-all text-[10px] text-brava-text-secondary">{snippet}</code>}
        </div>
      )}
    </div>
  );
}
