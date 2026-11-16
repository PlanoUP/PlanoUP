"use client";

import { useRef, useState } from "react";
import { Camera, X, AlertTriangle, Send } from "lucide-react";
import { TankWithDerived } from "@/lib/brava/types";
import { FieldEntry } from "@/lib/brava/field/types";
import { cn } from "@/lib/brava/cn";

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
  activityName,
  onSubmitted,
}: {
  tank: TankWithDerived;
  activityName: string;
  onSubmitted: (entry: FieldEntry) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioTermino, setHorarioTermino] = useState("");
  const [observacao, setObservacao] = useState("");
  const [ocorrencia, setOcorrencia] = useState(false);
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
    if (!activityName) {
      setError("Escolha ou adicione uma etapa antes de registrar.");
      return;
    }
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
          activityName,
          horarioInicio,
          horarioTermino,
          observacao,
          ocorrencia,
          photos,
        }),
      });
      if (!res.ok) throw new Error(await parseErrorMessage(res));
      const body = await res.json();
      onSubmitted(body.entry);
      setHorarioInicio("");
      setHorarioTermino("");
      setObservacao("");
      setOcorrencia(false);
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
      <p className="text-[11px] font-bold uppercase tracking-wide text-brava-blue">Registrar</p>
      <p className="mt-1 text-[16px] font-bold text-brava-text">{activityName || "Escolha uma etapa acima"}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-brava-text-secondary">
            Início da atividade
          </label>
          <input
            type="time"
            value={horarioInicio}
            onChange={(e) => setHorarioInicio(e.target.value)}
            className="mt-1 w-full rounded-brava-sm border border-brava-border px-3 py-2.5 text-[14px] focus:border-brava-blue focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-brava-text-secondary">
            Término da atividade
          </label>
          <input
            type="time"
            value={horarioTermino}
            onChange={(e) => setHorarioTermino(e.target.value)}
            className="mt-1 w-full rounded-brava-sm border border-brava-border px-3 py-2.5 text-[14px] focus:border-brava-blue focus:outline-none"
          />
        </div>
      </div>

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
