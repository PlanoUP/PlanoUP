import type { TenantConfig } from './types'

/** "Legalize 3D Experience"; na página de um corretor, só "3D Experience" (o nome dele já está na página). */
export function experienceLabel(tenant: TenantConfig): string {
  return tenant.broker ? '3D Experience' : `${tenant.name} 3D Experience`
}
