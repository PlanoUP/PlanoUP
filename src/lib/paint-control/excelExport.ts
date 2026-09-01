import ExcelJS from "exceljs";
import type { Activity, Responsible, RevitalizationItem, Unit } from "@/types/paint-control";
import { PRIORITY_LABELS } from "@/lib/paint-control/constants";

const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function sanitizeForFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

function formatArea(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return `${value.toLocaleString("pt-BR")} m²`;
}

const GRAPHITE = "FF1F2429";
const LIME = "FFD2F51E";
const LIGHT_GRAY = "FFF3F4F5";
const BORDER_GRAY = "FFD5D8DA";

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: BORDER_GRAY } },
  left: { style: "thin", color: { argb: BORDER_GRAY } },
  bottom: { style: "thin", color: { argb: BORDER_GRAY } },
  right: { style: "thin", color: { argb: BORDER_GRAY } },
};

/** Shared label/value report layout used by both export flows below. */
async function buildAndDownloadReport(
  titleText: string,
  subtitleText: string,
  rows: [string, string][],
  filename: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "PAINT CONTROL ATI";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Programação", {
    pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1 },
  });

  sheet.columns = [
    { key: "label", width: 30 },
    { key: "value", width: 62 },
  ];

  sheet.mergeCells("A1:B1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = titleText;
  titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GRAPHITE } };
  sheet.getRow(1).height = 30;

  sheet.mergeCells("A2:B2");
  const subtitleCell = sheet.getCell("A2");
  subtitleCell.value = subtitleText;
  subtitleCell.font = { bold: false, size: 10, color: { argb: "FF3A3F42" } };
  subtitleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIME } };
  subtitleCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(2).height = 20;

  sheet.getRow(3).height = 6;

  let rowIndex = 4;
  for (const [label, value] of rows) {
    const row = sheet.getRow(rowIndex);
    row.getCell(1).value = label;
    row.getCell(2).value = value;

    row.getCell(1).font = { bold: true, size: 10, color: { argb: "FF1F2429" } };
    row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_GRAY } };
    row.getCell(1).alignment = { vertical: "middle", horizontal: "left", wrapText: true };

    row.getCell(2).font = { size: 10, color: { argb: "FF1F2429" } };
    row.getCell(2).alignment = { vertical: "middle", horizontal: "left", wrapText: true };

    row.getCell(1).border = thinBorder;
    row.getCell(2).border = thinBorder;

    const isLong = ["Descrição", "Observações", "Impedimentos"].includes(label);
    row.height = isLong ? 46 : 20;

    rowIndex += 1;
  }

  sheet.getRow(rowIndex + 1).height = 10;
  sheet.mergeCells(`A${rowIndex + 2}:B${rowIndex + 2}`);
  const footer = sheet.getCell(`A${rowIndex + 2}`);
  footer.value = "PAINT CONTROL ATI — Gestão de Serviços de Pintura — Ativo Industrial de Guamaré";
  footer.font = { italic: true, size: 8, color: { argb: "FF7A8085" } };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportActivityToExcel(
  activity: Activity,
  unit: Unit,
  responsible: Responsible | null
): Promise<void> {
  const emittedAt = new Date().toLocaleDateString("pt-BR");

  const rows: [string, string][] = [
    ["Unidade", `${unit.tag} — ${unit.name}`],
    ["TAG / Equipamento", activity.tag || "—"],
    ["Local", activity.local || "—"],
    ["Serviço", activity.title || "—"],
    ["Descrição", activity.description || "—"],
    ["Prioridade", PRIORITY_LABELS[activity.priority]],
    ["Responsável", responsible?.name ?? "Sem responsável definido"],
    ["Área estimada", formatArea(activity.estimatedAreaM2)],
    ["Preparação de superfície", activity.surfacePreparation || "—"],
    ["Sistema de pintura", activity.paintSystem || "—"],
    ["Data necessária", formatDate(activity.neededDate)],
    ["Data programada", formatDate(activity.programmedDate)],
    ["Data prevista de início", formatDate(activity.actualStartDate)],
    ["Data prevista de término", formatDate(activity.expectedEndDate)],
    ["OS", activity.workOrder || "—"],
    ["Nota", activity.note || "—"],
    ["Avanço atual", `${activity.progress}%`],
    ["Status", activity.status],
    ["Impedimentos", activity.impediment || "—"],
    ["Observações", activity.generalNotes || "—"],
  ];

  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `PINTURA_${sanitizeForFilename(unit.tag)}_${sanitizeForFilename(activity.tag || "SEM-TAG")}_${dateStamp}.xlsx`;

  await buildAndDownloadReport(
    "PROGRAMAÇÃO DE SERVIÇO DE PINTURA — ATI GUAMARÉ",
    `Unidade: ${unit.tag} — ${unit.name}    |    Emitido em: ${emittedAt}`,
    rows,
    filename
  );
}

export async function exportRevitalizationToExcel(
  item: RevitalizationItem,
  responsible: Responsible | null
): Promise<void> {
  const emittedAt = new Date().toLocaleDateString("pt-BR");

  const rows: [string, string][] = [
    ["Área / Instalação", item.area || "—"],
    ["Serviço", item.title || "—"],
    ["Descrição", item.description || "—"],
    ["Prioridade", PRIORITY_LABELS[item.priority]],
    ["Responsável", responsible?.name ?? "Sem responsável definido"],
    ["Área estimada", formatArea(item.estimatedAreaM2)],
    ["Preparação de superfície", item.surfacePreparation || "—"],
    ["Sistema de pintura", item.paintSystem || "—"],
    ["Data necessária", formatDate(item.neededDate)],
    ["Data programada", formatDate(item.programmedDate)],
    ["Data prevista de início", formatDate(item.actualStartDate)],
    ["Data prevista de término", formatDate(item.expectedEndDate)],
    ["OS", item.workOrder || "—"],
    ["Nota", item.note || "—"],
    ["Avanço atual", `${item.progress}%`],
    ["Status", item.status],
    ["Impedimentos", item.impediment || "—"],
    ["Observações", item.generalNotes || "—"],
  ];

  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `REVITALIZACAO_${sanitizeForFilename(item.area || "AREA")}_${dateStamp}.xlsx`;

  await buildAndDownloadReport(
    "REVITALIZAÇÃO DE PINTURA — ATI GUAMARÉ",
    `Área: ${item.area}    |    Emitido em: ${emittedAt}`,
    rows,
    filename
  );
}
