import { BarChart3, Building2, Home, Inbox, LayoutDashboard, Users, type LucideIcon } from 'lucide-react'
import type { Permission } from '@/lib/permissions'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: boolean
  permission?: Permission
  /** No celular, itens secundários ficam na tela "Mais". */
  secondary?: boolean
}

export const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/dashboard/imoveis', label: 'Imóveis', icon: Home },
  { to: '/dashboard/contatos', label: 'Contatos', icon: Inbox, badge: true },
  { to: '/dashboard/resultados', label: 'Resultados', icon: BarChart3, permission: 'analytics.view', secondary: true },
  { to: '/dashboard/equipe', label: 'Equipe', icon: Users, permission: 'tenant.users.manage', secondary: true },
  { to: '/dashboard/imobiliaria', label: 'Minha imobiliária', icon: Building2, permission: 'tenant.settings.edit', secondary: true },
]
