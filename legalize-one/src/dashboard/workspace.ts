import { createContext, useContext } from 'react'
import { hasPermission, type Permission, type Role } from '@/lib/permissions'

/** Imobiliária em que o usuário está trabalhando no painel, com o papel dele nela. */
export interface Workspace {
  tenantId: string
  tenantName: string
  tenantSlug: string
  role: Role
  /** Cadastro de corretor do usuário nesta imobiliária (corretores criam imóveis em nome próprio). */
  brokerId: string | null
}

export interface WorkspaceState {
  current: Workspace | null
  options: Pick<Workspace, 'tenantId' | 'tenantName'>[]
  select: (tenantId: string) => void
  /** Recarrega a lista de imobiliárias (ex.: depois de criar uma nova). */
  refresh: () => void
}

export const WorkspaceContext = createContext<WorkspaceState | null>(null)

export function useWorkspaceState(): WorkspaceState {
  const value = useContext(WorkspaceContext)
  if (!value) throw new Error('useWorkspace must be used inside <WorkspaceProvider>')
  return value
}

/** Imobiliária ativa (as páginas internas só renderizam quando há uma). */
export function useWorkspace(): Workspace & { can: (permission: Permission) => boolean } {
  const { current } = useWorkspaceState()
  if (!current) throw new Error('no active workspace')
  return { ...current, can: (permission) => hasPermission(current.role, permission) }
}
