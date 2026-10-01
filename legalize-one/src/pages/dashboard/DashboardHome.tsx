import { Building2, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/auth/context'
import { RequireAuth } from '@/auth/RequireAuth'
import { Logo } from '@/components/ui/Logo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { parseEntitlements, PLANS } from '@/lib/entitlements'
import { ROLE_LABELS } from '@/lib/permissions'
import { requireSupabase } from '@/lib/supabase'

/**
 * Painel — FUNDAÇÃO. Confirma sessão, imobiliárias, papel e plano vindos do banco.
 * Overview, imóveis, leads e analytics chegam nas próximas etapas.
 */
function DashboardContent() {
  usePageTitle('Painel')
  const auth = useAuth()
  const first = auth.memberships[0]
  const { data: entitlements } = useAsyncData(async () => {
    if (!first) return null
    const supabase = await requireSupabase()
    const { data, error } = await supabase.rpc('tenant_entitlements', { p_tenant_id: first.tenantId })
    if (error) throw error
    return parseEntitlements(data)
  }, first?.tenantId ?? 'none')

  return (
    <main className="min-h-dvh bg-sand">
      <header className="border-b border-navy-950/8 bg-white">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo />
          <button
            type="button"
            onClick={() => void auth.signOut()}
            className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-navy-950 hover:bg-sand"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sair
          </button>
        </div>
      </header>
      <div className="container-page py-10">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">
          Olá{auth.fullName ? `, ${auth.fullName.split(' ')[0]}` : ''}!
        </h1>
        <p className="mt-1 text-[15px] text-slate">Seu painel está sendo preparado. Em breve: imóveis, contatos e resultados.</p>

        {auth.isPlatformAdmin && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy-950 px-4 py-2 text-[13px] font-semibold text-gold-400">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {ROLE_LABELS.platform_admin}
          </p>
        )}

        <section aria-labelledby="minhas-imobiliarias" className="mt-8">
          <h2 id="minhas-imobiliarias" className="text-[13px] font-semibold tracking-[0.14em] text-slate uppercase">
            Minhas imobiliárias
          </h2>
          {auth.memberships.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-white p-5 text-[15px] text-navy-950 shadow-card">
              Você ainda não faz parte de nenhuma imobiliária. Na próxima etapa você poderá criar a sua por aqui.
            </p>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {auth.memberships.map((m) => (
                <li key={m.tenantId} className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-card">
                  <span className="flex size-11 items-center justify-center rounded-full bg-navy-950 text-gold-400">
                    <Building2 className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[16px] font-semibold text-navy-950">{m.tenantName}</span>
                    <span className="block text-[13.5px] text-slate">{ROLE_LABELS[m.role]}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {entitlements && (
          <p className="mt-6 text-[14px] text-slate">
            Plano atual: <strong className="text-navy-950">{PLANS[entitlements.plan].name}</strong>
          </p>
        )}
      </div>
    </main>
  )
}

export default function DashboardHome() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  )
}
