import { KeyRound, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/auth/context'
import { Button } from '@/components/ui/Button'
import { Field, inputClass, Section } from '@/dashboard/FormParts'
import { TwoFactorSection } from '@/dashboard/TwoFactorSection'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/cn'

/** Minha conta: nome e senha. No primeiro acesso (senha temporária), é a única tela liberada. */
export default function Account() {
  usePageTitle('Minha conta · Painel')
  const auth = useAuth()
  const navigate = useNavigate()
  const firstAccess = auth.mustChangePassword
  const mfaRequired = !firstAccess && auth.mfa === 'enroll_required'

  const [name, setName] = useState(auth.fullName ?? '')
  const [nameMsg, setNameMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwMsg, setPwMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function saveName(e: FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2) return setNameMsg({ tone: 'error', text: 'Informe seu nome.' })
    const r = await auth.updateName(name.trim())
    setNameMsg(r.error ? { tone: 'error', text: r.error } : { tone: 'ok', text: 'Nome salvo.' })
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault()
    if (password.length < 8) return setPwMsg({ tone: 'error', text: 'Use pelo menos 8 caracteres.' })
    if (password !== confirm) return setPwMsg({ tone: 'error', text: 'As senhas não conferem.' })
    setBusy(true)
    const r = await auth.changePassword(password)
    setBusy(false)
    if (r.error) return setPwMsg({ tone: 'error', text: r.error })
    setPassword('')
    setConfirm('')
    if (firstAccess) navigate('/dashboard', { replace: true })
    else setPwMsg({ tone: 'ok', text: 'Senha alterada.' })
  }

  const msg = (m: { tone: 'ok' | 'error'; text: string } | null) =>
    m && (
      <p role={m.tone === 'error' ? 'alert' : 'status'} className={cn('mt-3 text-[14px] font-medium', m.tone === 'error' ? 'text-red-700' : 'text-tour')}>
        {m.text}
      </p>
    )

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">
          {firstAccess ? 'Crie sua senha' : mfaRequired ? 'Proteja seu acesso' : 'Minha conta'}
        </h1>
        <p className="mt-1 text-[14.5px] text-slate">{auth.email}</p>
      </div>

      {firstAccess && (
        <p className="flex items-start gap-2 rounded-2xl bg-gold-500/15 p-4 text-[14.5px] text-navy-950">
          <KeyRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Você entrou com uma senha temporária. Crie sua senha pessoal para continuar usando o painel.
        </p>
      )}

      {mfaRequired && (
        <p className="flex items-start gap-2 rounded-2xl bg-gold-500/15 p-4 text-[14.5px] text-navy-950">
          <KeyRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Seu acesso administra todas as imobiliárias. Ative a verificação em duas etapas para continuar usando o painel.
        </p>
      )}
      {!firstAccess && <TwoFactorSection />}

      <Section title={firstAccess ? 'Nova senha' : 'Trocar senha'}>
        <form onSubmit={(e) => void savePassword(e)} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field label="Nova senha" hint="Pelo menos 8 caracteres.">
            <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Repita a nova senha">
            <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Salvar senha
            </Button>
            {msg(pwMsg)}
          </div>
        </form>
      </Section>

      {!firstAccess && (
        <Section title="Seu nome">
          <form onSubmit={(e) => void saveName(e)} noValidate>
            <Field label="Nome exibido no painel">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" className={inputClass} />
            </Field>
            <Button type="submit" variant="outline" className="mt-4">
              Salvar nome
            </Button>
            {msg(nameMsg)}
          </form>
        </Section>
      )}
    </div>
  )
}
