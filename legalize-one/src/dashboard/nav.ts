import { BarChart3, Building2, Home, Inbox, LayoutDashboard, Network, Users, type LucideIcon } from 'lucide-react'
import { hasPermission, type Permission, type Role } from '@/lib/permissions'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: boolean
  permission?: Permission
  /** No celular, itens secundários ficam na tela "Mais". */
  secondary?: boolean
  /** Só para o administrador da plataforma (independe do papel na imobiliária ativa). */
  platformOnly?: boolean
}

export const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/dashboard/imoveis', label: 'Imóveis', icon: Home },
  { to: '/dashboard/contatos', label: 'Contatos', icon: Inbox, badge: true },
  { to: '/dashboard/resultados', label: 'Resultados', icon: BarChart3, permission: 'analytics.view', secondary: true },
  { to: '/dashboard/equipe', label: 'Equipe', icon: Users, permission: 'tenant.users.manage', secondary: true },
  { to: '/dashboard/imobiliaria', label: 'Minha imobiliária', icon: Building2, permission: 'tenant.settings.edit', secondary: true },
  { to: '/dashboard/plataforma', label: 'Imobiliárias clientes', icon: Network, platformOnly: true, secondary: true },
]

/** Itens do menu visíveis para quem está no painel. */
export function visibleNav(role: Role | null | undefined, isPlatformAdmin: boolean): NavItem[] {
  return NAV.filter((item) =>
    item.platformOnly ? isPlatformAdmin : !item.permission || hasPermission(role, item.permission),
  )
}
