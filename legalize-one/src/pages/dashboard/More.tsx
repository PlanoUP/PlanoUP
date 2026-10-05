import { ChevronRight, CircleUser, LogOut } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '@/auth/context'
import { NAV } from '@/dashboard/nav'
import { useWorkspace } from '@/dashboard/workspace'
import { usePageTitle } from '@/hooks/usePageTitle'

/** "Mais" (celular): itens do painel que não cabem na barra inferior. */
export default function More() {
  usePageTitle('Mais · Painel')
  const ws = useWorkspace()
  const auth = useAuth()
  const items = [
    ...NAV.filter((i) => i.secondary && (!i.permission || ws.can(i.permission))),
    { to: '/dashboard/conta', label: 'Minha conta', icon: CircleUser },
  ]
  return (
    <div className="space-y-4">
      <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">Mais</h1>
      <ul className="divide-y divide-navy-950/6 overflow-hidden rounded-2xl bg-white shadow-card">
        {items.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="flex h-14 items-center gap-3 px-4 text-[15.5px] font-semibold text-navy-950 hover:bg-sand">
              <item.icon className="size-5 text-navy-800" aria-hidden="true" />
              {item.label}
              <ChevronRight className="ml-auto size-4 text-slate" aria-hidden="true" />
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => void auth.signOut()}
            className="flex h-14 w-full items-center gap-3 px-4 text-left text-[15.5px] font-semibold text-red-700 hover:bg-red-50"
          >
            <LogOut className="size-5" aria-hidden="true" />
            Sair
          </button>
        </li>
      </ul>
    </div>
  )
}
