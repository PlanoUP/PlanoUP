"use client";

import { useMaterialsData } from "@/lib/brava/materials/context";
import { getMaterialsByTank } from "@/lib/brava/materials/calculations";
import { formatLong } from "@/lib/brava/date-utils";
import SectionHeading from "../SectionHeading";

interface TimelineEntry {
  materialId: string;
  materialDescription: string;
  timestamp: string;
  fromValue: string | null;
  toValue: string;
}

export default function TankHistorySection({ tankId }: { tankId: string }) {
  const { materials } = useMaterialsData();
  const tankMaterials = getMaterialsByTank(materials, tankId);

  const entries: TimelineEntry[] = tankMaterials
    .flatMap((m) =>
      m.history.map((h) => ({
        materialId: m.id,
        materialDescription: m.description,
        timestamp: h.timestamp,
        fromValue: h.fromValue,
        toValue: h.toValue,
      }))
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div>
      <SectionHeading
        eyebrow="Rastreabilidade"
        title="Histórico de Alterações de Materiais"
        subtitle="Mudanças de status registradas para os materiais deste tanque"
      />
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-brava-lg border border-dashed border-brava-border py-14 text-center">
          <p className="text-[13px] font-medium text-brava-text">Nenhum histórico registrado</p>
          <p className="mt-1 text-[12px] text-brava-text-secondary">
            O histórico é preenchido automaticamente a cada mudança de status de um material.
          </p>
        </div>
      ) : (
        <div className="rounded-brava-lg border border-brava-border bg-brava-white p-5 shadow-brava-sm">
          <ul className="space-y-3.5">
            {entries.map((e, i) => (
              <li key={`${e.materialId}-${i}`} className="border-l-2 border-brava-border pl-3.5 text-[12.5px]">
                <p className="text-brava-text-secondary">{formatLong(e.timestamp.slice(0, 10))}</p>
                <p className="mt-0.5 font-medium text-brava-text">{e.materialDescription}</p>
                <p className="mt-0.5 text-brava-text-secondary">
                  {e.fromValue ? (
                    <>
                      {e.fromValue} → <span className="font-semibold text-brava-text">{e.toValue}</span>
                    </>
                  ) : (
                    <>Cadastrado como <span className="font-semibold text-brava-text">{e.toValue}</span></>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
