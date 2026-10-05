import { ArrowRight, Building2, ExternalLink, Home, Inbox, Plus, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { platform } from '@/config/site'
import { useAsyncData } from '@/hooks/useAsyncData'
import { cn } from '@/utils/cn'
import { listTenants, siteUrl, type PlatformTenant } from './platformApi'
import { useWorkspaceState } from './workspace'

/** Visão geral do administrador da plataforma: números de todas as imobiliárias e atalhos. */
export function PlatformOverview() {
  const { data: tenants, error } = useAsyncData(listTenants, 'platform-overview')
  const { select, current } = useWorkspaceState()
  const navigate = useNavigate()
  const list = tenants ?? []
  // Totais só das clientes de verdade (sem a demonstração e os pedidos de demonstração).
  const clients = list.filter((t) => !platform.internalSlugs.includes(t.slug))
  const sum = (k: keyof Pick<PlatformTenant, 'published' | 'leads30d' | 'members'>) => clients.reduce((n, t) => n + t[k], 0)
  const active = clients.filter((t) => t.status === 'active').length

  const stats = [
    { label: 'Clientes ativas', value: active, icon: Building2 },
    { label: 'Imóveis publicados', value: sum('published'), icon: Home },
    { label: 'Contatos (30 dias)', value: sum('leads30d'), icon: Inbox },
    { label: 'Usuários', value: sum('members'), icon: Users },
  ]

  return (
    <section aria-labelledby="plataforma-titulo" className="overflow-hidden rounded-3xl bg-navy-950 text-white shadow-float">
      <div className="bg-[radial-gradient(120%_140%_at_100%_0%,rgb(37_99_235/0.55),transparent_60%)] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.18em] text-gold-400 uppercase">{platform.name} · central da plataforma</p>
            <h2 id="plataforma-titulo" className="mt-1 font-display text-[24px] font-bold tracking-[-0.02em]">
              Suas imobiliárias clientes
            </h2>
          </div>
          <Link
            to="/dashboard/plataforma"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gold-500 px-5 text-[14px] font-semibold text-navy-950 hover:bg-gold-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Nova imobiliária
          </Link>
        </div>

        {error ? (
          <p role="alert" className="mt-5 text-[14px] text-red-200">
            {error.message}
          </p>
        ) : (
          <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                <dt className="flex items-center gap-1.5 text-[12.5px] text-white/70">
                  <s.icon className="size-4 text-gold-400" aria-hidden="true" />
                  {s.label}
                </dt>
                <dd className="mt-1 font-display text-[28px] font-bold tabular-nums">{tenants ? s.value : '–'}</dd>
              </div>
            ))}
          </dl>
        )}

        {list.length > 0 && (
          <ul className="mt-5 divide-y divide-white/10 rounded-2xl bg-white/5 ring-1 ring-white/10">
            {list.map((t) => (
              <li key={t.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                    {t.name}
                    {t.id === current?.tenantId && (
                      <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-[11px] font-semibold text-gold-400">em foco</span>
                    )}
                  </span>
                  <span className="block text-[12.5px] text-white/60">
                    {t.published} publicados · {t.leads30d} contatos em 30 dias · plano {t.plan}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold',
                      t.status === 'active' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-400/15 text-red-200',
                    )}
                  >
                    {t.status === 'active' ? 'Ativa' : 'Suspensa'}
                  </span>
                  <a
                    href={siteUrl(t)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Ver site da ${t.name}`}
                    className="inline-flex size-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      select(t.id)
                      navigate('/dashboard/imoveis')
                    }}
                    className="inline-flex h-9 items-center gap-1 rounded-full bg-white/10 px-3.5 text-[13px] font-semibold hover:bg-white/15"
                  >
                    Gerenciar
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
