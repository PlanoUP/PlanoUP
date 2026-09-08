// Complete "PRÓXIMA INTERNA" inventory for the ATI/TAG fleet — real dates
// provided directly by Brava Energia, covering every tancagem (1222, 28xxx,
// 40001, 270, 260, 410, 6313), not only the subset currently under an
// active maintenance project in data/tanks.ts. This feeds ONLY the macro
// due-date view (Consolidado + Cronograma) — see lib/brava/inspection.ts
// buildInspectionFleet(). Tanks already tracked in TANKS_SEED are merged in
// by TAG rather than duplicated; entries with no matching tracked tank are
// shown as inspection-only assets (no maintenance status/Gantt).

export interface InspectionInventoryItem {
  tag: string;
  nextInternalInspection: string;
}

export const INSPECTION_INVENTORY: InspectionInventoryItem[] = [
  { tag: "TQ-1222-21", nextInternalInspection: "2025-10-21" },
  { tag: "TQ-1222-22", nextInternalInspection: "2034-02-06" },
  { tag: "TQ-1222-23", nextInternalInspection: "2036-01-07" },
  { tag: "TQ-1222-24", nextInternalInspection: "2028-04-21" },
  { tag: "TQ-1222-25", nextInternalInspection: "2025-12-22" },
  { tag: "TQ-1222-31", nextInternalInspection: "2026-08-07" },
  { tag: "TQ-1222-32", nextInternalInspection: "2035-09-02" },
  { tag: "TQ-1222-33", nextInternalInspection: "2024-10-25" },
  { tag: "TQ-1222-34", nextInternalInspection: "2034-08-22" },
  { tag: "TQ-1222-35", nextInternalInspection: "2026-01-15" },
  { tag: "TQ-1222-36", nextInternalInspection: "2026-01-25" },
  { tag: "TQ-1222-37", nextInternalInspection: "2034-12-19" },
  { tag: "TQ-1222-41", nextInternalInspection: "2031-05-29" },
  { tag: "TQ-1222-42", nextInternalInspection: "2034-06-19" },
  { tag: "TQ-1222-43", nextInternalInspection: "2027-07-01" },
  { tag: "TQ-1222-44", nextInternalInspection: "2035-04-14" },
  { tag: "TQ-28001", nextInternalInspection: "2027-07-02" },
  { tag: "TQ-28002", nextInternalInspection: "2027-07-02" },
  { tag: "TQ-28003", nextInternalInspection: "2027-07-02" },
  { tag: "TQ-28006", nextInternalInspection: "2031-06-11" },
  { tag: "TQ-40001", nextInternalInspection: "2027-10-19" },
  { tag: "TQ-27001", nextInternalInspection: "2027-06-01" },
  { tag: "TQ-27002", nextInternalInspection: "2027-08-10" },
  { tag: "TQ-27003", nextInternalInspection: "2027-12-20" },
  { tag: "TQ-27004", nextInternalInspection: "2033-06-17" },
  { tag: "TQ-27009", nextInternalInspection: "2027-12-25" },
  { tag: "TQ-27010", nextInternalInspection: "2028-07-20" },
  { tag: "TQ-27011", nextInternalInspection: "2028-06-08" },
  { tag: "TQ-27015", nextInternalInspection: "2030-10-28" },
  { tag: "TQ-27016", nextInternalInspection: "2036-08-19" },
  { tag: "TQ-26021", nextInternalInspection: "2030-03-13" },
  { tag: "TQ-26024", nextInternalInspection: "2030-03-28" },
  { tag: "TQ-26025", nextInternalInspection: "2035-03-13" },
  { tag: "TQ-41001", nextInternalInspection: "2033-10-18" },
  { tag: "TQ-41002", nextInternalInspection: "2028-06-17" },
  { tag: "TQ-41004", nextInternalInspection: "2025-11-24" },
  { tag: "TQ-41005", nextInternalInspection: "2025-12-29" },
  { tag: "TQ-41007", nextInternalInspection: "2035-08-13" },
  { tag: "TQ-41008", nextInternalInspection: "2034-01-31" },
  { tag: "TQ-6313001", nextInternalInspection: "2035-05-07" },
  { tag: "TQ-6313002", nextInternalInspection: "2036-03-03" },
  { tag: "TQ-6313003", nextInternalInspection: "2033-12-13" },
  { tag: "TQ-6313004", nextInternalInspection: "2026-02-27" },
  { tag: "TQ-6313005", nextInternalInspection: "2027-01-03" },
  { tag: "TQ-6313006", nextInternalInspection: "2036-04-27" },
  { tag: "TQ-6313007", nextInternalInspection: "2035-06-18" },
];
