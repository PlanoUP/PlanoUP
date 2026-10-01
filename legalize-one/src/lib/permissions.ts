/**
 * PERMISSÕES — matriz única de papéis × ações.
 * A interface usa esta matriz para mostrar/ocultar ações; a segurança REAL está nas
 * políticas RLS do banco (supabase/migrations), que repetem as mesmas regras.
 * Novo papel ou ação = uma linha aqui + a política correspondente no banco.
 */
export type Role = 'platform_admin' | 'owner' | 'admin' | 'broker'

export type Permission =
  | 'tenant.settings.edit'
  | 'tenant.users.manage'
  | 'properties.view'
  | 'properties.create'
  | 'properties.edit'
  | 'properties.edit_assigned'
  | 'properties.publish'
  | 'properties.delete'
  | 'brokers.manage'
  | 'leads.view_all'
  | 'leads.view_own'
  | 'leads.update'
  | 'analytics.view'
  | 'billing.view'
  | 'platform.tenants.manage'
  | 'platform.metrics.view'

const MANAGER: Permission[] = [
  'tenant.settings.edit',
  'tenant.users.manage',
  'properties.view',
  'properties.create',
  'properties.edit',
  'properties.edit_assigned',
  'properties.publish',
  'properties.delete',
  'brokers.manage',
  'leads.view_all',
  'leads.view_own',
  'leads.update',
  'analytics.view',
  'billing.view',
]

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  platform_admin: [...MANAGER, 'platform.tenants.manage', 'platform.metrics.view'],
  owner: MANAGER,
  admin: MANAGER,
  broker: ['properties.view', 'properties.edit_assigned', 'leads.view_own', 'leads.update'],
}

/** Rótulos para a interface (linguagem simples, sem termos técnicos). */
export const ROLE_LABELS: Record<Role, string> = {
  platform_admin: 'Administrador Legalize One',
  owner: 'Responsável pela imobiliária',
  admin: 'Administrador da imobiliária',
  broker: 'Corretor',
}

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  return Boolean(role && ROLE_PERMISSIONS[role].includes(permission))
}
