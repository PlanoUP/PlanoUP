"use client";

import { X, Paperclip } from "lucide-react";
import { useUnitsData } from "@/lib/brava/units/context";
import { EquipmentMaterial } from "@/lib/brava/units/materials/types";
import { MaterialAttachmentType } from "@/lib/brava/materials/types";
import { calculateMaterialRisk } from "@/lib/brava/units/materials/calculations";
import { formatShort, formatLong } from "@/lib/brava/date-utils";
import MaterialStatusBadge from "../../materials/MaterialStatusBadge";
import MaterialCriticalityBadge from "../../materials/MaterialCriticalityBadge";
import MaterialRiskBadge from "../../materials/MaterialRiskBadge";

const ATTACHMENT_LABELS: Record<MaterialAttachmentType, string> = {
  FOTO: "Foto do material",
  DATASHEET: "Datasheet",
  DESENHO: "Desenho",
  ESPECIFICACAO: "Especificação",
  CERTIFICADO: "Certificado",
  PEDIDO_COMPRA: "Pedido de compra",
};

export default function EquipmentMaterialDetailDrawer({
  open,
  onClose,
  material,
}: {
  open: boolean;
  onClose: () => void;
  material: EquipmentMaterial | null;
}) {
  const { equipment, today } = useUnitsData();
  if (!open || !material) return null;

  const eq = equipment.find((e) => e.id === material.equipmentId);
  const activity = eq?.activities.find((a) => a.id === material.activityId);
  const risk = calculateMaterialRisk(material, today);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-brava-blue-dark/40 backdrop-blur-[1px]"
      />
      <div className="relative flex h-full w-full max-w-[520px] flex-col overflow-hidden bg-brava-white shadow-brava-lg">
        <div className="flex items-start justify-between border-b border-brava-border px-6 py-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brava-blue">
              {material.code || "Material"}
            </p>
            <h2 className="truncate text-[18px] font-bold tracking-tight text-brava-blue-dark">
              {material.description}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <MaterialStatusBadge status={material.status} size="sm" />
              <MaterialCriticalityBadge criticality={material.criticality} size="sm" />
              <MaterialRiskBadge result={risk} size="sm" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-brava-sm p-1.5 text-brava-text-secondary transition-colors hover:bg-brava-bg hover:text-brava-text"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="brava-scrollbar flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <Section title="Identificação">
            <Grid>
              <Item label="Categoria" value={material.category} />
              <Item label="Equipamento" value={eq?.tag ?? "—"} />
              <Item label="Unidade" value={material.processUnit ?? "—"} />
              <Item label="Atividade" value={activity?.name ?? "Geral do equipamento"} />
            </Grid>
          </Section>

          <Section title="Quantidade">
            <Grid>
              <Item label="Necessária" value={`${material.quantityRequired} ${material.unit}`} />
              <Item label="Disponível" value={`${material.quantityAvailable} ${material.unit}`} />
            </Grid>
          </Section>

          <Section title="Datas">
            <Grid>
              <Item label="Necessidade" value={formatShort(material.requiredDate)} />
              <Item label="Solicitação" value={formatShort(material.requestDate)} />
              <Item label="Previsão de Entrega" value={formatShort(material.expectedDeliveryDate)} />
              <Item label="Entrega Real" value={formatShort(material.actualDeliveryDate)} />
            </Grid>
          </Section>

          <Section title="Suprimentos">
            <Grid>
              <Item label="Fornecedor" value={material.supplier || "—"} />
              <Item label="Número do Pedido" value={material.purchaseOrder || "—"} />
              <Item label="Responsável" value={material.responsible || "—"} />
            </Grid>
          </Section>

          {material.notes && (
            <Section title="Observações">
              <p className="text-[13px] leading-relaxed text-brava-text">{material.notes}</p>
            </Section>
          )}

          <Section title="Documentos e Anexos">
            <div className="space-y-1.5">
              {(Object.keys(ATTACHMENT_LABELS) as MaterialAttachmentType[]).map((type) => {
                const found = material.attachments.filter((a) => a.type === type);
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-brava-sm border border-dashed border-brava-border px-3 py-2 text-[12px]"
                  >
                    <span className="flex items-center gap-2 text-brava-text-secondary">
                      <Paperclip className="h-3.5 w-3.5" />
                      {ATTACHMENT_LABELS[type]}
                    </span>
                    <span className="text-brava-text-secondary">
                      {found.length > 0 ? `${found.length} anexo(s)` : "Não anexado"}
                    </span>
                  </div>
                );
              })}
              <p className="pt-1 text-[11px] text-brava-text-secondary">
                Upload de arquivos será disponibilizado em uma próxima versão.
              </p>
            </div>
          </Section>

          <Section title="Histórico de Alterações">
            {material.history.length === 0 ? (
              <p className="text-[12px] text-brava-text-secondary">Nenhuma alteração registrada.</p>
            ) : (
              <ul className="space-y-2.5">
                {[...material.history].reverse().map((h) => (
                  <li key={h.id} className="border-l-2 border-brava-border pl-3 text-[12px]">
                    <p className="text-brava-text-secondary">{formatLong(h.timestamp.slice(0, 10))}</p>
                    <p className="mt-0.5 text-brava-text">
                      {h.fromValue ? (
                        <>
                          <span className="text-brava-text-secondary">{h.fromValue}</span> → {h.toValue}
                        </>
                      ) : (
                        <>Cadastrado como {h.toValue}</>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-brava-text-secondary">{title}</p>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</div>;
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-brava-text-secondary">{label}</p>
      <p className="truncate text-[13px] font-medium text-brava-text">{value}</p>
    </div>
  );
}
