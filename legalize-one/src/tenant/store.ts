import { useSyncExternalStore } from 'react'
import { defaultTenant } from './defaultTenant'
import type { TenantConfig } from './types'

/**
 * Imobiliária ativa do site. Store de módulo (e não só contexto React) porque funções
 * fora de componentes também precisam dela: whatsappLink(), analytics, serviços de dados.
 */
let current: TenantConfig = defaultTenant
const listeners = new Set<() => void>()

export function getTenant(): TenantConfig {
  return current
}

export function setTenant(next: TenantConfig): void {
  current = next
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTenant(): TenantConfig {
  return useSyncExternalStore(subscribe, getTenant, getTenant)
}
