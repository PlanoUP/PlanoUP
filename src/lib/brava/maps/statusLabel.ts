import { TankStatus } from "../types";

// The map only ever needs to answer one question at a glance — is this tank
// being worked on right now, or not — so every status collapses into one of
// two buckets here, instead of the full six-way STATUS_META used elsewhere
// in the app (tank dashboards, lists). ATRASADO/CRITICO count as "Em
// Execução" too: work has started, it just needs attention, which the
// tank's own dashboard (not the map) is where that distinction matters.
const MAP_ACTIVE_STATUSES: TankStatus[] = ["EM_EXECUCAO", "ATRASADO", "CRITICO"];

export function isMapActive(status: TankStatus): boolean {
  return MAP_ACTIVE_STATUSES.includes(status);
}

export function mapStatusLabel(status: TankStatus): "Em Execução" | "Programado" {
  return isMapActive(status) ? "Em Execução" : "Programado";
}

// Literal class names (not built dynamically) so Tailwind's content scanner
// keeps them in the production build.
export function mapStatusDotClass(status: TankStatus): string {
  return isMapActive(status) ? "bg-brava-danger" : "bg-brava-text-secondary";
}
