import type { Property } from '@/types/property'

/** Último catálogo carregado do backend (para as sugestões de busca, que são síncronas). */
let snapshot: Property[] = []

export function catalogSnapshot(): Property[] {
  return snapshot
}

export function setCatalogSnapshot(list: Property[]): void {
  snapshot = list
}
