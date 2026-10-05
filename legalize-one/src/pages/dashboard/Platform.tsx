import { ExternalLink, Globe, Loader2, Plus, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/auth/context'
import { Button } from '@/components/ui/Button'
import { CredentialCard, type Credential } from '@/dashboard/CredentialCard'
import { Field, inputClass, Section } from '@/dashboard/FormParts'
import { formatWhen } from '@/dashboard/leadsApi'
import {
  addDomain,
  createTenant,
  listPlans,
  listTenants,
  loginUrl,
  siteUrl,
  suggestSlug,
  updateTenant,
  type PlanOption,
  type PlatformTenant,
} from '@/dashboard/platformApi'
import { addTeamMember } from '@/dashboard/teamApi'
import { useWorkspaceState } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/cn'

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

type Feedback = { tone: 'ok' | 'error'; text: string } | null

interface Created {
  tenant: Pick<PlatformTenant, 'id' | 'name' | 'slug' | 'domains'>
  cred: Credential | null
  ownerNote: string | null
}

function planSummary(plan: PlanOption): string {
  const n = (v: number | null | undefined, label: string) => (v == null ? `${label} ilimitados` : `até ${v} ${label}`)
  return `${n(plan.limits.max_users, 'usuários')} · ${n(plan.limits.max_properties, 'imóveis')}`
}

/** Cria o login do gerente responsável e devolve a credencial (ou um aviso se a conta já existia). */
async function createOwner(tenant: Created['tenant'], name: string, email: string): Promise<Pick<Created, 'cred' | 'ownerNote'>> {
  const r = await addTeamMember(tenant.id, { name, email, role: 'owner' })
  if (r.temporaryPassword) return { cred: { name, email, password: r.temporaryPassword, title: `Acesso do responsável pela ${tenant.name}` }, ownerNote: null }
  return { cred: null, ownerNote: `${name} já tinha conta e foi ligado como responsável. Ele entra com a senha que já usa.` }
}

function NextSteps({ created, onClose }: { created: Created; onClose: () => void }) {
  const t = { ...created.tenant }
  return (
    <div className="space-y-4">
      {created.cred ? (
        <CredentialCard cred={created.cred} tenantName={t.name} loginUrl={loginUrl(t)} onClose={onClose} />
      ) : (
        <p role="status" className="rounded-xl bg-tour/10 px-4 py-3 text-[14px] font-medium text-tour">
          {created.ownerNote}
        </p>
      )}
      <Section title={`${t.name}: próximos passos`}>
        <ol className="list-decimal space-y-2 pl-5 text-[14.5px] text-navy-950">
          <li>
            Envie o acesso ao gerente. No primeiro login ele cria a senha pessoal e completa <strong>Minha imobiliária</strong> (logo,
            WhatsApp, contatos).
          </li>
          <li>Cadastre os imóveis (ou deixe a equipe cadastrar) e publique.</li>
          <li>
            Veja o site:{' '}
            <a href={siteUrl(t)} target="_blank" rel="noreferrer" className="font-semibold break-all text-navy-800 underline">
              {siteUrl(t)}
            </a>
          </li>
          {t.domains.length === 0 && <li>Quando a imobiliária tiver domínio próprio, ligue-o na lista abaixo.</li>}
        </ol>
      </Section>
    </div>
  )
}

function NewTenantForm({ plans, onCreated }: { plans: PlanOption[]; onCreated: (c: Created) => void }) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [plan, setPlan] = useState('start')
  const [hostname, setHostname] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const effectiveSlug = slugTouched ? slug : suggestSlug(name)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setFeedback(null)
    const n = name.trim()
    const on = ownerName.trim()
    const oe = ownerEmail.trim().toLowerCase()
    if (n.length < 2) return setFeedback({ tone: 'error', text: 'Informe o nome da imobiliária.' })
    if (!SLUG.test(effectiveSlug) || effectiveSlug.length < 3)
      return setFeedback({ tone: 'error', text: 'Endereço curto inválido: use letras minúsculas, números e hífen (mínimo 3).' })
    if (on.length < 2) return setFeedback({ tone: 'error', text: 'Informe o nome do gerente responsável.' })
    if (!EMAIL.test(oe)) return setFeedback({ tone: 'error', text: 'E-mail do gerente inválido.' })

    setBusy(true)
    try {
      const id = await createTenant({ name: n, slug: effectiveSlug, plan, hostname: hostname.trim() })
      const tenant = { id, name: n, slug: effectiveSlug, domains: hostname.trim() ? [hostname.trim().toLowerCase()] : [] }
      let owner: Pick<Created, 'cred' | 'ownerNote'>
      try {
        owner = await createOwner(tenant, on, oe)
      } catch (err) {
        owner = {
          cred: null,
          ownerNote: `A imobiliária foi criada, mas o acesso do gerente não: ${err instanceof Error ? err.message : 'erro desconhecido'} Use "Criar responsável" na lista abaixo.`,
        }
      }
      onCreated({ tenant, ...owner })
      setName('')
      setSlug('')
      setSlugTouched(false)
      setHostname('')
      setOwnerName('')
      setOwnerEmail('')
    } catch (err) {
      setFeedback({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível criar.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section title="Nova imobiliária" description="Cria o site e o painel da imobiliária, já com o acesso do gerente responsável.">
      <form onSubmit={(e) => void submit(e)} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome da imobiliária">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="off" className={inputClass} />
          </Field>
          <Field label="Endereço curto" hint="Identifica a imobiliária e abre a pré-visualização do site.">
            <input
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              }}
              maxLength={48}
              autoComplete="off"
              className={inputClass}
            />
          </Field>
          <Field label="Plano">
            <select value={plan} onChange={(e) => setPlan(e.target.value)} className={inputClass}>
              {plans.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} ({planSummary(p)})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Domínio (opcional)" hint="Ex.: www.imobiliaria.com.br. Pode ligar depois.">
            <input value={hostname} onChange={(e) => setHostname(e.target.value)} inputMode="url" autoComplete="off" className={inputClass} />
          </Field>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-navy-950">Gerente responsável</p>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <Field label="Nome do gerente">
              <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} maxLength={120} autoComplete="off" className={inputClass} />
            </Field>
            <Field label="E-mail do gerente">
              <input
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                type="email"
                inputMode="email"
                autoComplete="off"
                className={inputClass}
              />
            </Field>
          </div>
        </div>
        {feedback && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-800">
            {feedback.text}
          </p>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          Criar imobiliária
        </Button>
      </form>
    </Section>
  )
}

function TenantCard({
  tenant,
  plans,
  onChanged,
  onOwnerCreated,
}: {
  tenant: PlatformTenant
  plans: PlanOption[]
  onChanged: () => void
  onOwnerCreated: (c: Created) => void
}) {
  const { select, refresh } = useWorkspaceState()
  const navigate = useNavigate()
  const [busy, setBusy] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [domain, setDomain] = useState('')
  const [confirmSuspend, setConfirmSuspend] = useState(false)
  const [ownerForm, setOwnerForm] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const suspended = tenant.status === 'suspended'

  async function run(label: string, task: () => Promise<string | void>) {
    setBusy(label)
    setFeedback(null)
    try {
      const ok = await task()
      if (ok) setFeedback({ tone: 'ok', text: ok })
      onChanged()
    } catch (err) {
      setFeedback({ tone: 'error', text: err instanceof Error ? err.message : 'Não foi possível concluir.' })
    } finally {
      setBusy(null)
    }
  }

  function openPanel() {
    refresh()
    select(tenant.id)
    navigate('/dashboard')
  }

  return (
    <li className="rounded-3xl bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-[17px] font-bold text-navy-950">{tenant.name}</span>
            <span
              className={cn(
                'inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-semibold',
                suspended ? 'bg-red-50 text-red-800' : 'bg-tour/10 text-tour',
              )}
            >
              {suspended ? 'Suspensa' : 'Ativa'}
            </span>
          </p>
          <p className="mt-1 text-[13.5px] text-slate">
            {tenant.owner ? `Responsável: ${tenant.owner.name} (${tenant.owner.email})` : 'Sem responsável cadastrado'} · desde{' '}
            {formatWhen(tenant.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={openPanel}>
            Abrir painel
          </Button>
          <a
            href={siteUrl(tenant)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-navy-950/15 px-4 text-[13px] font-semibold text-navy-950 hover:bg-sand"
          >
            Ver site
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Usuários', tenant.members],
          ['Imóveis ativos', tenant.properties],
          ['Publicados', tenant.published],
          ['Contatos (30 dias)', tenant.leads30d],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-sand px-3 py-2.5">
            <dt className="text-[12px] text-slate">{label}</dt>
            <dd className="text-[18px] font-bold text-navy-950 tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid gap-4 border-t border-navy-950/6 pt-4 lg:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-navy-950">
            <Globe className="size-4" aria-hidden="true" />
            Domínios
          </p>
          <p className="mt-1 text-[13.5px] break-all text-slate">
            {tenant.domains.length ? tenant.domains.join(', ') : `Nenhum: o site abre pela pré-visualização (${siteUrl(tenant)}).`}
          </p>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!domain.trim()) return
              void run('domain', async () => {
                const host = await addDomain(tenant.id, domain)
                setDomain('')
                return `Domínio ${host} ligado. Falta adicioná-lo também na hospedagem (Vercel → Domains) e apontar o DNS.`
              })
            }}
          >
            <label className="min-w-0 flex-1">
              <span className="sr-only">Novo domínio de {tenant.name}</span>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="www.imobiliaria.com.br"
                inputMode="url"
                className="h-9 w-full rounded-full border border-navy-950/15 bg-white px-4 text-[13.5px]"
              />
            </label>
            <Button type="submit" variant="outline" size="sm" disabled={busy !== null}>
              Ligar domínio
            </Button>
          </form>
        </div>

        <div className="flex flex-wrap items-end gap-2 lg:justify-end">
          <label className="text-[13px] font-semibold text-navy-950">
            <span className="mb-1 block">Plano</span>
            <select
              value={tenant.plan}
              disabled={busy !== null}
              onChange={(e) => void run('plan', () => updateTenant(tenant.id, { plan: e.target.value }).then(() => 'Plano atualizado.'))}
              className="h-9 rounded-full border border-navy-950/15 bg-white pr-8 pl-3 text-[13px] font-semibold"
            >
              {plans.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          {!tenant.owner && (
            <Button type="button" variant="outline" size="sm" onClick={() => setOwnerForm((v) => !v)}>
              <UserPlus className="size-4" aria-hidden="true" />
              Criar responsável
            </Button>
          )}
          {suspended ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => void run('status', () => updateTenant(tenant.id, { status: 'active' }).then(() => 'Imobiliária reativada.'))}
            >
              Reativar
            </Button>
          ) : confirmSuspend ? (
            <span className="inline-flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                className="bg-red-700 hover:bg-red-800"
                disabled={busy !== null}
                onClick={() => {
                  setConfirmSuspend(false)
                  void run('status', () => updateTenant(tenant.id, { status: 'suspended' }).then(() => 'Imobiliária suspensa: o site saiu do ar.'))
                }}
              >
                Confirmar: tirar site do ar
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmSuspend(false)}>
                Cancelar
              </Button>
            </span>
          ) : (
            <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" onClick={() => setConfirmSuspend(true)}>
              Suspender
            </Button>
          )}
        </div>
      </div>

      {ownerForm && !tenant.owner && (
        <form
          noValidate
          className="mt-4 grid gap-3 rounded-2xl bg-sand p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault()
            const n = ownerName.trim()
            const m = ownerEmail.trim().toLowerCase()
            if (n.length < 2) return setFeedback({ tone: 'error', text: 'Informe o nome do gerente.' })
            if (!EMAIL.test(m)) return setFeedback({ tone: 'error', text: 'E-mail inválido.' })
            void run('owner', async () => {
              onOwnerCreated({ tenant, ...(await createOwner(tenant, n, m)) })
              setOwnerForm(false)
            })
          }}
        >
          <Field label="Nome do gerente">
            <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} maxLength={120} autoComplete="off" className={inputClass} />
          </Field>
          <Field label="E-mail do gerente">
            <input value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} type="email" inputMode="email" autoComplete="off" className={inputClass} />
          </Field>
          <Button type="submit" disabled={busy !== null} className="h-12">
            {busy === 'owner' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Criar acesso
          </Button>
        </form>
      )}

      {feedback && (
        <p
          role={feedback.tone === 'error' ? 'alert' : 'status'}
          className={cn('mt-3 rounded-xl px-4 py-2.5 text-[13.5px] font-medium', feedback.tone === 'error' ? 'bg-red-50 text-red-800' : 'bg-tour/10 text-tour')}
        >
          {feedback.text}
        </p>
      )}
    </li>
  )
}

/** Imobiliárias clientes: só o administrador da plataforma vê e usa. */
export default function Platform() {
  usePageTitle('Imobiliárias clientes · Painel')
  const auth = useAuth()
  const { refresh } = useWorkspaceState()
  const [version, setVersion] = useState(0)
  const [created, setCreated] = useState<Created | null>(null)
  const allowed = auth.isPlatformAdmin
  const { data, loading, error } = useAsyncData(
    async () => (allowed ? Promise.all([listTenants(), listPlans()]) : ([[], []] as [PlatformTenant[], PlanOption[]])),
    `${version}:${allowed}`,
  )

  if (!allowed) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card">
        <p className="text-[15px] text-slate">Esta área é exclusiva da administração da plataforma.</p>
      </div>
    )
  }

  const [tenants, plans] = data ?? [[], []]
  const reload = () => {
    setVersion((v) => v + 1)
    refresh()
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">Imobiliárias clientes</h1>
        <p className="mt-1 text-[14.5px] text-slate">Crie uma imobiliária nova e acompanhe as que já usam a plataforma.</p>
      </div>

      {created ? (
        <NextSteps created={created} onClose={() => setCreated(null)} />
      ) : (
        plans.length > 0 && (
          <NewTenantForm
            plans={plans}
            onCreated={(c) => {
              setCreated(c)
              reload()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )
      )}
      {created && (
        <Button type="button" variant="outline" onClick={() => setCreated(null)}>
          <Plus className="size-4" aria-hidden="true" />
          Criar outra imobiliária
        </Button>
      )}

      <section aria-labelledby="tenants-title" className="space-y-3">
        <h2 id="tenants-title" className="font-display text-[20px] font-bold text-navy-950">
          {tenants.length ? `${tenants.length} ${tenants.length === 1 ? 'imobiliária' : 'imobiliárias'}` : 'Imobiliárias'}
        </h2>
        {error ? (
          <p role="alert" className="text-[14px] text-red-700">
            {error.message}
          </p>
        ) : loading && !data ? (
          <div className="h-40 animate-pulse rounded-3xl bg-white" aria-busy="true" />
        ) : (
          <ul className="space-y-3">
            {tenants.map((t) => (
              <TenantCard
                key={t.id}
                tenant={t}
                plans={plans}
                onChanged={reload}
                onOwnerCreated={(c) => {
                  setCreated(c)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
