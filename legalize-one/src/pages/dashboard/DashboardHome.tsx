import { ArrowRight, Inbox, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '@/auth/context'
import { ButtonLink } from '@/components/ui/Button'
import { listLeads } from '@/dashboard/leadsApi'
import { PlatformOverview } from '@/dashboard/PlatformOverview'
import { listProperties, STATUS_LABELS, type PropertyStatus } from '@/dashboard/propertiesApi'
import { useWorkspace } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { limitOf, parseEntitlements, PLANS } from '@/lib/entitlements'
import { ROLE_LABELS } from '@/lib/permissions'
import { requireSupabase } from '@/lib/supabase'

const ORDER: PropertyStatus[] = ['published', 'draft', 'sold', 'rented', 'archived']

/** Visão geral: resumo da imobiliária ativa e atalhos. */
export default function DashboardHome() {
  usePageTitle('Painel')
  const auth = useAuth()
  const ws = useWorkspace()

  const { data: properties } = useAsyncData(() => listProperties(ws.tenantId), ws.tenantId)
  const { data: leads } = useAsyncData(() => listLeads(ws.tenantId), `leads:${ws.tenantId}`)
  const newLeads = (leads ?? []).filter((l) => l.status === 'new').length
  const openLeads = (leads ?? []).filter((l) => l.status !== 'converted' && l.status !== 'lost').length
  const { data: entitlements } = useAsyncData(async () => {
    const supabase = await requireSupabase()
    const { data, error } = await supabase.rpc('tenant_entitlements', { p_tenant_id: ws.tenantId })
    if (error) throw error
    return parseEntitlements(data)
  }, ws.tenantId)

  const counts = Object.fromEntries(ORDER.map((s) => [s, 0])) as Record<PropertyStatus, number>
  for (const p of properties ?? []) counts[p.status] += 1
  const mine = ws.brokerId ? (properties ?? []).filter((p) => p.broker_id === ws.brokerId).length : null
  const active = (properties ?? []).filter((p) => p.status !== 'archived').length
  const limit = entitlements ? limitOf(entitlements, 'max_properties') : null
  const platformView = auth.isPlatformAdmin

  return (
    <div className="space-y-8">
      {platformView && (
        <>
          <div>
            <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">
              Olá{auth.fullName ? `, ${auth.fullName.split(' ')[0]}` : ''}!
            </h1>
            <p className="mt-1 text-[15px] text-slate">{ROLE_LABELS.platform_admin}</p>
          </div>
          <PlatformOverview />
        </>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {platformView ? (
            <>
              <p className="text-[12px] font-semibold tracking-[0.16em] text-navy-700 uppercase">Imobiliária em foco</p>
              <h2 className="mt-1 font-display text-[24px] font-bold tracking-[-0.02em] text-navy-950">{ws.tenantName}</h2>
            </>
          ) : (
            <>
              <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">
                Olá{auth.fullName ? `, ${auth.fullName.split(' ')[0]}` : ''}!
              </h1>
              <p className="mt-1 text-[15px] text-slate">
                {ws.tenantName} · {ROLE_LABELS[ws.role]}
              </p>
            </>
          )}
        </div>
        {ws.can('properties.create') && (
          <ButtonLink to="/dashboard/imoveis/novo" size="md">
            <Plus className="size-4" aria-hidden="true" />
            Cadastrar imóvel
          </ButtonLink>
        )}
      </div>

      <Link
        to="/dashboard/contatos"
        className="flex items-center gap-4 rounded-2xl bg-navy-950 p-5 text-white shadow-card transition-shadow hover:shadow-float"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-950">
          <Inbox className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[20px] font-bold">
            {leads ? (newLeads === 1 ? '1 contato novo' : `${newLeads} contatos novos`) : 'Contatos'}
          </span>
          <span className="block text-[14px] text-white/70">
            {leads ? `${openLeads} em aberto · ${ws.can('leads.view_all') ? 'toda a imobiliária' : 'sob sua responsabilidade'}` : 'Carregando…'}
          </span>
        </span>
        <ArrowRight className="size-5 shrink-0 text-gold-400" aria-hidden="true" />
      </Link>

      <section aria-labelledby="resumo-imoveis">
        <div className="flex items-center justify-between">
          <h2 id="resumo-imoveis" className="text-[13px] font-semibold tracking-[0.14em] text-slate uppercase">
            Imóveis
          </h2>
          <Link to="/dashboard/imoveis" className="inline-flex items-center gap-1 text-[14px] font-semibold text-navy-800">
            Ver todos <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ORDER.map((status) => (
            <li key={status}>
              <Link
                to={`/dashboard/imoveis?status=${status}`}
                className="block rounded-2xl bg-white p-4 shadow-card transition-shadow hover:shadow-float"
              >
                <span className="block font-display text-[28px] font-bold text-navy-950 tabular-nums">
                  {properties ? counts[status] : '–'}
                </span>
                <span className="text-[14px] text-slate">{STATUS_LABELS[status]}</span>
              </Link>
            </li>
          ))}
        </ul>
        {mine !== null && (
          <p className="mt-3 text-[14px] text-slate">
            Sob sua responsabilidade: <strong className="text-navy-950">{mine}</strong>
          </p>
        )}
      </section>

      {entitlements && (
        <section aria-labelledby="plano" className="rounded-2xl bg-white p-5 shadow-card">
          <h2 id="plano" className="text-[13px] font-semibold tracking-[0.14em] text-slate uppercase">
            Plano
          </h2>
          <p className="mt-2 text-[16px] text-navy-950">
            <strong>{PLANS[entitlements.plan].name}</strong>
            <span className="text-slate">
              {' '}
              · {active} {active === 1 ? 'imóvel ativo' : 'imóveis ativos'}
              {limit !== null ? ` de ${limit}` : ' (sem limite)'}
            </span>
          </p>
        </section>
      )}
    </div>
  )
}
