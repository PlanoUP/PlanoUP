import type { CostItem } from "@/types/paint-control";

// Seed data from the client's cost sheet (Efetivo Total / Custo Total /
// Equipamentos / Custo) for the ATI Guamaré painting contract. "Previsto"
// figures come straight from that sheet; "realizado" starts empty (null)
// so the team can fill in actuals as they're incurred.

const NOW = "2026-09-01T00:00:00.000Z";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Labor rows: `hourlyRate` is already the aggregated cost/hour for the
 * whole crew of that role (not a per-person rate) — this matches the
 * sheet, where custoAno = valorHora * horasDia * diasAno reproduces the
 * printed "Custo Ano" column exactly.
 */
function laborItem(
  id: string,
  name: string,
  quantity: number,
  hourlyRate: number,
  hoursPerDay: number,
  daysPerYear: number
): CostItem {
  const plannedAnnualCost = round2(hourlyRate * hoursPerDay * daysPerYear);
  return {
    id,
    category: "Mão de Obra",
    name,
    regime: "Mensalista",
    quantity,
    hourlyRate,
    hoursPerDay,
    daysPerYear,
    plannedAnnualCost,
    plannedMonthlyCost: round2(plannedAnnualCost / 12),
    actualMonthlyCost: null,
    actualAnnualCost: null,
    notes: "",
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function equipmentItem(
  id: string,
  name: string,
  quantity: number,
  regime: string,
  plannedMonthlyCost: number,
  plannedAnnualCost: number
): CostItem {
  return {
    id,
    category: "Equipamento",
    name,
    regime,
    quantity,
    hourlyRate: null,
    hoursPerDay: null,
    daysPerYear: null,
    plannedMonthlyCost,
    plannedAnnualCost,
    actualMonthlyCost: null,
    actualAnnualCost: null,
    notes: "",
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export const SEED_COST_ITEMS: CostItem[] = [
  // ---- Mão de Obra (Efetivo Total / Custo Total) ----
  laborItem("299c534e-196b-483d-8f89-787bab212688", "Encarregado", 2, 95.1, 9, 262),
  laborItem("bfd26436-c3ec-431a-b3e3-390334730060", "Pintor", 18, 62.93, 9, 262),
  laborItem("779a02e6-fb08-48b1-92f9-4fe6ef1d022e", "Montador de andaimes", 12, 62.8, 9, 262),
  laborItem("ddc84298-1802-4f81-b900-f15c8ded96ca", "Auxiliar de andaimes", 6, 47.57, 9, 262),
  laborItem("cb2016de-00f8-448f-91b3-baa89dab0af8", "Caldeireiro", 4, 69.13, 9, 262),
  laborItem("4d722a52-4e9f-420e-91b4-fc5d3d25ca72", "Auxiliar de caldeiraria", 4, 47.52, 9, 262),
  laborItem("b62a9375-fbf3-4387-8192-c47a383bc8ac", "Pedreiro", 2, 52.91, 9, 262),
  laborItem("4117bc67-b8cf-4e55-ac4c-88014beb7cdb", "Auxiliar de pedreiro", 4, 47.4, 9, 262),
  laborItem("58d8319f-888e-459f-82e4-5f603623b96a", "Soldador", 2, 69.31, 9, 262),
  laborItem("0a0323d1-06d2-4fa8-8f45-e64a5b52583b", "Isolador", 2, 77.89, 9, 262),

  // ---- Equipamentos / Custo ----
  equipmentItem("1f6664c9-658b-42e5-a373-2515828b7d5a", "Gerador", 2, "Locação", 7700, 92400),
  equipmentItem("5a95b619-47c3-4280-b353-67ecd167b0c1", "Bitoneira", 3, "Objeto Contratado", 0, 0),
  equipmentItem("9b705633-7408-47d5-87f0-5e27b36b71f5", "Conjunto de oxicorte", 4, "Objeto Contratado", 0, 0),
  equipmentItem("85027030-181f-4872-98e2-57c92b261dd2", "Máquina de solda", 2, "Objeto Contratado", 0, 0),
  equipmentItem("eb7db3f9-8d79-42bc-95c7-1d5287e63a04", "PTA", 1, "Locação", 43000, 516000),
  equipmentItem("32ede91b-d45e-4716-9fdf-b6f67abe310a", "Caminhão Munck", 1, "Locação", 50000, 600000),
  equipmentItem("db52a63a-5a79-4899-88cd-4a6561b78af3", "Andaimes", 8000, "Efetivo Brava", 0, 0),
  equipmentItem("14d58555-8b7a-4cf2-afe1-5572024a617a", "Abraçadeiras", 5400, "Efetivo Brava", 0, 0),
  equipmentItem("cbc8fc48-c65f-4be9-b59d-6ece569821e9", "Barracas", 2, "Efetivo Brava", 0, 0),
  equipmentItem("1687afae-21c3-4e37-aea2-3af0ab79d651", "Container", 1, "Efetivo Brava", 0, 0),
  equipmentItem("45f5219b-edbd-4f26-af22-563c8f4ec1f7", "Compressor", 1, "Efetivo Brava", 0, 0),
];
