"use client";

import { useRef, useState } from "react";
import { Camera, X, AlertTriangle, Send } from "lucide-react";
import { useBravaData } from "@/lib/brava/context";
import { Activity, TankWithDerived } from "@/lib/brava/types";
import { FieldEntry } from "@/lib/brava/field/types";
import { cn } from "@/lib/brava/cn";

const QUICK_PROGRESS_VALUES = [25, 50, 75, 100];

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || "Falha ao comunicar com o servidor.";
  } catch {
    return "Falha ao comunicar com o servidor.";
  }
}

export default function FieldEntryForm({
  tank,
  activity,
  onSubmitted,
}: {
  tank: TankWithDerived;
  activity: Activity | null;
  onSubmitted: (entry: FieldEntry) => void;
}) {
  const { applyTankUpdate } = useBravaData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [progress, setProgress] = useState(activity?.progress ?? 0);
  const [observacao, setObservacao] = useState("");
  const [ocorrencia, setOcorrencia] = useState(false);
  const [materialDescricao, setMaterialDescricao] = useState("");
  const [materialQuantidade, setMaterialQuantidade] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoWarning, setPhotoWarning] = useState<string | null>(null);
  const [savedPulse, setSavedPulse] = useState(false);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    setPhotoFiles((prev) => [...prev, ...Array.from(files)].slice(0, 6));
  }

  function removePhoto(index: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadPhotos(): Promise<string[]> {
    const urls: string[] = [];
    let skipped = 0;
    for (const file of photoFiles) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/field-entries/photos", { method: "POST", body: formData });
        if (!res.ok) {
          skipped++;
          continue;
        }
        const body = await res.json();
        urls.push(body.url);
      } catch {
        skipped++;
      }
    }
    if (skipped > 0) {
      setPhotoWarning(
        urls.length === 0
          ? "Não foi possível enviar as fotos agora — o registro foi salvo sem elas."
          : `${skipped} foto(s) não enviada(s) — o restante do registro foi salvo.`
      );
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setPhotoWarning(null);
    try {
      const photos = photoFiles.length > 0 ? await uploadPhotos() : [];
      const res = await fetch("/api/field-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tankId: tank.id,
          activityId: activity?.id ?? null,
          progress: activity ? progress : null,
          observacao,
          ocorrencia,
          materialDescricao,
          materialQuantidade,
          photos,
        }),
      });
      if (!res.ok) throw new Error(await parseErrorMessage(res));
      const body = await res.json();
      applyTankUpdate(body.tank);
      onSubmitted(body.entry);
      setObservacao("");
      setOcorrencia(false);
      setMaterialDescricao("");
      setMaterialQuantidade("");
      setPhotoFiles([]);
      setSavedPulse(true);
      window.setTimeout(() => setSavedPulse(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar o registro.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-brava-lg border border-brava-blue/25 bg-brava-white p-5 shadow-brava-sm">
      {activity && (
        <>
          <p className="text-[11px] font-bold uppercase tracking-wide text-brava-blue">Registrar avanço</p>
          <p className="mt-1 text-[16px] font-bold text-brava-text">{activity.name}</p>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {QUICK_PROGRESS_VALUES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setProgress(v)}
                className={cn(
                  "rounded-brava-sm border py-2 text-[13px] font-bold transition-colors",
                  progress === v
                    ? "border-brava-blue bg-brava-blue text-brava-white"
                    : "border-brava-border bg-brava-white text-brava-text active:bg-brava-bg"
                )}
              >
                {v}%
              </button>
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="mt-3 w-full accent-brava-blue"
          />
          <p className="text-center font-mono text-[22px] font-extrabold text-brava-blue-dark">{progress}%</p>
        </>
      )}

      <label className="mt-4 block text-[11px] font-bold uppercase tracking-wide text-brava-text-secondary">
        Observação
      </label>
      <textarea
        value={observacao}
        onChange={(e) => setObservacao(e.target.value)}
        rows={3}
        placeholder="O que foi feito, visto ou precisa de atenção..."
        className="mt-1 w-full rounded-brava-sm border border-brava-border px-3 py-2.5 text-[14px] focus:border-brava-blue focus:outline-none"
      />

      <label className="mt-3 flex items-center gap-2 text-[13.5px] font-semibold text-brava-text">
        <input
          type="checkbox"
          checked={ocorrencia}
          onChange={(e) => setOcorrencia(e.target.checked)}
          className="h-4 w-4 accent-brava-danger"
        />
        <AlertTriangle className={cn("h-4 w-4", ocorrencia ? "text-brava-danger" : "text-brava-text-secondary")} />
        Ocorrência de segurança/qualidade
      </label>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-brava-text-secondary">
            Material consumido
          </label>
          <input
            value={materialDescricao}
            onChange={(e) => setMaterialDescricao(e.target.value)}
            placeholder="Descrição"
            className="mt-1 w-full rounded-brava-sm border border-brava-border px-3 py-2.5 text-[13.5px] focus:border-brava-blue focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-brava-text-secondary">
            Quantidade
          </label>
          <input
            value={materialQuantidade}
            onChange={(e) => setMaterialQuantidade(e.target.value)}
            placeholder="ex: 20 m³"
            className="mt-1 w-full rounded-brava-sm border border-brava-border px-3 py-2.5 text-[13.5px] focus:border-brava-blue focus:outline-none"
          />
        </div>
      </div>

      <label className="mt-3 block text-[11px] font-bold uppercase tracking-wide text-brava-text-secondary">Fotos</label>
      <div className="mt-1 flex flex-wrap gap-2">
        {photoFiles.map((file, i) => (
          <div key={i} className="relative h-16 w-16 overflow-hidden rounded-brava-sm border border-brava-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              aria-label="Remover foto"
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {photoFiles.length < 6 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-brava-sm border border-dashed border-brava-border text-brava-text-secondary active:bg-brava-bg"
          >
            <Camera className="h-5 w-5" />
            <span className="text-[9px] font-semibold">Adicionar</span>
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={(e) => addPhotos(e.target.files)}
        className="hidden"
      />

      {photoWarning && <p className="mt-2 text-[12px] font-semibold text-brava-warning">{photoWarning}</p>}
      {error && <p className="mt-2 text-[12.5px] font-semibold text-brava-danger">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-brava-lg bg-brava-blue py-3.5 text-[14px] font-bold text-brava-white active:bg-brava-blue-dark disabled:opacity-60"
      >
        <Send className="h-4.5 w-4.5" />
        {submitting ? "Enviando..." : "Enviar registro"}
      </button>
      {savedPulse && <p className="mt-2 text-center text-[12px] font-semibold text-brava-success">Salvo ✓</p>}
    </form>
  );
}
