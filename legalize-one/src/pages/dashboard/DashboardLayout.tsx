import { Building2, CircleUser, LogOut, Menu } from 'lucide-react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/auth/context'
import { RequireAuth } from '@/auth/RequireAuth'
import { Logo } from '@/components/ui/Logo'
import { WorkspaceProvider } from '@/dashboard/WorkspaceProvider'
import { countNewLeads } from '@/dashboard/leadsApi'
import { NAV, type NavItem } from '@/dashboard/nav'
import { useWorkspaceState } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { hasPermission, ROLE_LABELS } from '@/lib/permissions'
import { cn } from '@/utils/cn'

function NewBadge({ count, className }: { count: number; className?: string }) {
  if (!count) return null
  return (
    <span
      aria-label={`${count} ${count === 1 ? 'contato novo' : 'contatos novos'}`}
      className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1.5 text-[11.5px] font-bold text-navy-950 tabular-nums', className)}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

function TenantSwitcher() {
  const { current, options, select } = useWorkspaceState()
  if (!current) return null
  if (options.length < 2) {
    return <span className="truncate text-[14px] font-semibold text-navy-950">{current.tenantName}</span>
  }
  return (
    <label className="flex min-w-0 items-center gap-2">
      <span className="sr-only">Imobiliária</span>
      <select
        value={current.tenantId}
        onChange={(e) => select(e.target.value)}
        className="h-10 max-w-[220px] truncate rounded-full border border-navy-950/15 bg-white pr-8 pl-4 text-[14px] font-semibold text-navy-950"
      >
        {options.map((o) => (
          <option key={o.tenantId} value={o.tenantId}>
            {o.tenantName}
          </option>
        ))}
      </select>
    </label>
  )
}

function Shell() {
  const auth = useAuth()
  const { current } = useWorkspaceState()
  const location = useLocation()
  const nav = NAV.filter((item) => !item.permission || (current && hasPermission(current.role, item.permission)))
  const mobileNav: NavItem[] = [...nav.filter((i) => !i.secondary), { to: '/dashboard/mais', label: 'Mais', icon: Menu }]
  const mustChange = auth.mustChangePassword && location.pathname !== '/dashboard/conta'
  // Recalcula ao navegar (ex.: depois de atender um contato novo).
  const { data: newLeads } = useAsyncData(
    () => (current ? countNewLeads(current.tenantId) : Promise.resolve(0)),
    `${current?.tenantId}:${location.pathname}`,
  )

  return (
    <div className="min-h-dvh bg-sand pb-20 lg:pb-0">
      <header className="sticky top-0 z-30 border-b border-navy-950/8 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
          <Logo />
          <div className="ml-auto flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 flex-col items-end sm:flex">
              <TenantSwitcher />
              {current && <span className="text-[12px] text-slate">{ROLE_LABELS[current.role]}</span>}
            </div>
            <Link
              to="/dashboard/conta"
              aria-label="Minha conta"
              title="Minha conta"
              className="inline-flex size-10 items-center justify-center rounded-full text-navy-950 hover:bg-sand"
            >
              <CircleUser className="size-5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => void auth.signOut()}
              className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-[14px] font-semibold text-navy-950 hover:bg-sand"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-navy-950/6 px-4 py-2 sm:hidden">
          <TenantSwitcher />
          {current && <span className="shrink-0 text-[12px] text-slate">{ROLE_LABELS[current.role]}</span>}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1280px] gap-8 px-4 sm:px-6">
        <nav aria-label="Painel" className="sticky top-24 hidden h-fit w-56 shrink-0 py-8 lg:block">
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors',
                      isActive ? 'bg-navy-950 text-white' : 'text-navy-950 hover:bg-white',
                    )
                  }
                >
                  <item.icon className="size-[18px]" aria-hidden="true" />
                  {item.label}
                  {item.badge && <NewBadge count={newLeads ?? 0} className="ml-auto" />}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 py-6 sm:py-8">
          {mustChange ? (
            <Navigate to="/dashboard/conta" replace />
          ) : current || location.pathname === '/dashboard/conta' ? (
            <Outlet />
          ) : (
            <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-card">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-navy-950 text-gold-400">
                <Building2 className="size-6" aria-hidden="true" />
              </span>
              <h1 className="mt-4 font-display text-[22px] font-bold text-navy-950">Sem imobiliária vinculada</h1>
              <p className="mt-2 text-[15px] text-slate">
                Seu acesso ainda não foi ligado a uma imobiliária. Peça ao gerente para incluir você na equipe.
              </p>
            </div>
          )}
        </main>
      </div>

      <nav
        aria-label="Painel"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-950/10 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid auto-cols-fr grid-flow-col">
          {mobileNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex h-16 flex-col items-center justify-center gap-1 text-[12px] font-semibold',
                    isActive ? 'text-navy-950' : 'text-slate',
                  )
                }
              >
                <span className="relative">
                  <item.icon className="size-5" aria-hidden="true" />
                  {item.badge && <NewBadge count={newLeads ?? 0} className="absolute -top-2 left-3" />}
                </span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

/** Painel da imobiliária: área oculta do site (sem links públicos, noindex), exige login. */
export default function DashboardLayout() {
  return (
    <RequireAuth>
      <WorkspaceProvider>
        <Shell />
      </WorkspaceProvider>
    </RequireAuth>
  )
}
