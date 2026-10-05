import { KeyRound, Loader2, Trash2, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '@/auth/context'
import { Button } from '@/components/ui/Button'
import { CredentialCard, type Credential } from '@/dashboard/CredentialCard'
import { Field, inputClass, Section } from '@/dashboard/FormParts'
import { formatWhen } from '@/dashboard/leadsApi'
import {
  addTeamMember,
  listTeam,
  removeTeamMember,
  resetTeamPassword,
  setTeamRole,
  type TeamMember,
} from '@/dashboard/teamApi'
import { useWorkspace } from '@/dashboard/workspace'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROLE_LABELS } from '@/lib/permissions'
import { cn } from '@/utils/cn'

export default function Team() {
  usePageTitle('Equipe · Painel')
  const ws = useWorkspace()
  const auth = useAuth()
  const allowed = ws.can('tenant.users.manage')
  const [version, setVersion] = useState(0)
  const { data: members, loading, error } = useAsyncData(
    () => (allowed ? listTeam(ws.tenantId) : Promise.resolve([] as TeamMember[])),
    `${ws.tenantId}:${version}:${allowed}`,
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'broker'>('broker')
  const [busy, setBusy] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [cred, setCred] = useState<Credential | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  if (!allowed) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card">
        <p className="text-[15px] text-slate">A equipe é gerenciada pelos gerentes da imobiliária.</p>
      </div>
    )
  }

  async function run(label: string, task: () => Promise<void>) {
    setBusy(label)
    setFeedback(null)
    try {
      await task()
      setVersion((v) => v + 1)
    } catch (e) {
      setFeedback({ tone: 'error', text: e instanceof Error ? e.message : 'Não foi possível concluir.' })
    } finally {
      setBusy(null)
    }
  }

  function add(e: FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const m = email.trim().toLowerCase()
    if (n.length < 2) return setFeedback({ tone: 'error', text: 'Informe o nome completo.' })
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) return setFeedback({ tone: 'error', text: 'E-mail inválido.' })
    void run('add', async () => {
      const r = await addTeamMember(ws.tenantId, { name: n, email: m, role })
      setName('')
      setEmail('')
      if (r.temporaryPassword) setCred({ name: n, email: m, password: r.temporaryPassword, title: `Acesso criado para ${n}` })
      else setFeedback({ tone: 'ok', text: `${n} já tinha conta e foi incluído na equipe. Ele entra com a senha que já usa.` })
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">Equipe</h1>
        <p className="mt-1 text-[14.5px] text-slate">Quem acessa o painel da {ws.tenantName} e o que cada um pode fazer.</p>
      </div>

      {cred && <CredentialCard cred={cred} tenantName={ws.tenantName} loginUrl={`${window.location.origin}/entrar`} onClose={() => setCred(null)} />}
      {feedback && (
        <p
          role={feedback.tone === 'error' ? 'alert' : 'status'}
          className={cn('rounded-xl px-4 py-3 text-[14px] font-medium', feedback.tone === 'error' ? 'bg-red-50 text-red-800' : 'bg-tour/10 text-tour')}
        >
          {feedback.text}
        </p>
      )}

      <Section title="Adicionar pessoa" description="Cria o acesso com uma senha temporária; no primeiro login a pessoa cria a senha dela.">
        <form onSubmit={add} noValidate className="grid gap-4 sm:grid-cols-[1fr_1fr_180px_auto] sm:items-end">
          <Field label="Nome">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="off" className={inputClass} />
          </Field>
          <Field label="E-mail">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="off" className={inputClass} />
          </Field>
          <Field label="Papel">
            <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'broker')} className={inputClass}>
              <option value="broker">Corretor</option>
              <option value="admin">Gerente</option>
            </select>
          </Field>
          <Button type="submit" disabled={busy !== null} className="h-12">
            {busy === 'add' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <UserPlus className="size-4" aria-hidden="true" />}
            Adicionar
          </Button>
        </form>
        <p className="mt-3 text-[13px] text-slate">
          <strong className="text-navy-950">Gerente</strong>: tudo da imobiliária. <strong className="text-navy-950">Corretor</strong>: só os
          próprios imóveis e contatos; cadastra imóveis como rascunho.
        </p>
      </Section>

      <Section title="Pessoas com acesso">
        {error ? (
          <p role="alert" className="text-[14px] text-red-700">
            {error.message}
          </p>
        ) : loading && !members ? (
          <div className="h-24 animate-pulse rounded-2xl bg-sand" aria-busy="true" />
        ) : (
          <ul className="divide-y divide-navy-950/6">
            {(members ?? []).map((m) => {
              const self = m.userId === auth.userId
              const owner = m.role === 'owner'
              return (
                <li key={m.userId} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15.5px] font-semibold text-navy-950">
                      {m.name || m.email}
                      {self && <span className="ml-2 text-[12.5px] font-normal text-slate">(você)</span>}
                    </p>
                    <p className="truncate text-[13.5px] text-slate">{m.email}</p>
                    <p className="text-[12.5px] text-slate">
                      {m.mustChangePassword
                        ? 'Ainda não criou a senha pessoal'
                        : m.lastSignInAt
                          ? `Último acesso: ${formatWhen(m.lastSignInAt)}`
                          : 'Nunca acessou'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {owner || self ? (
                      <span className="inline-flex h-9 items-center rounded-full bg-sand px-3 text-[13px] font-semibold text-navy-950">{ROLE_LABELS[m.role]}</span>
                    ) : (
                      <label>
                        <span className="sr-only">Papel de {m.name || m.email}</span>
                        <select
                          value={m.role}
                          disabled={busy !== null}
                          onChange={(e) => void run(`role:${m.userId}`, () => setTeamRole(ws.tenantId, m.userId, e.target.value as 'admin' | 'broker').then(() => undefined))}
                          className="h-9 rounded-full border border-navy-950/15 bg-white pr-8 pl-3 text-[13px] font-semibold text-navy-950"
                        >
                          <option value="broker">Corretor</option>
                          <option value="admin">Gerente</option>
                        </select>
                      </label>
                    )}
                    {!self && (!owner || auth.isPlatformAdmin || ws.role === 'owner') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy !== null}
                        onClick={() =>
                          void run(`reset:${m.userId}`, async () => {
                            const r = await resetTeamPassword(ws.tenantId, m.userId)
                            setCred({ name: m.name || m.email || '', email: m.email ?? '', password: r.temporaryPassword, title: `Nova senha para ${m.name || m.email}` })
                          })
                        }
                      >
                        <KeyRound className="size-4" aria-hidden="true" />
                        Gerar nova senha
                      </Button>
                    )}
                    {!self && !owner &&
                      (confirmRemove === m.userId ? (
                        <span className="inline-flex items-center gap-1">
                          <Button
                            type="button"
                            size="sm"
                            className="bg-red-700 hover:bg-red-800"
                            disabled={busy !== null}
                            onClick={() => {
                              setConfirmRemove(null)
                              void run(`remove:${m.userId}`, () => removeTeamMember(ws.tenantId, m.userId).then(() => undefined))
                            }}
                          >
                            Confirmar remoção
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmRemove(null)}>
                            Cancelar
                          </Button>
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label={`Remover ${m.name || m.email}`}
                          className="text-red-700 hover:bg-red-50"
                          disabled={busy !== null}
                          onClick={() => setConfirmRemove(m.userId)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Remover
                        </Button>
                      ))}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Section>
    </div>
  )
}
