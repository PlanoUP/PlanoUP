import { LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/auth/context'
import { Logo } from '@/components/ui/Logo'
import { usePageTitle } from '@/hooks/usePageTitle'

const field =
  'mt-1.5 h-12 w-full rounded-xl border border-navy-950/15 bg-white px-4 text-[16px] text-navy-950 outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-800/15'

/** Entrada do painel da imobiliária. */
export default function Login() {
  usePageTitle('Entrar no painel')
  const auth = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  if (auth.status === 'signed_in') return <Navigate to={from} replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return setError('Informe seu e-mail e sua senha.')
    setBusy(true)
    setError('')
    const result = await auth.signIn(email, password)
    setBusy(false)
    if (result.error) setError(result.error)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-sand px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-card sm:p-8">
          <h1 className="font-display text-[24px] font-bold tracking-[-0.02em] text-navy-950">Entrar no painel</h1>
          <p className="mt-1 text-[14.5px] text-slate">Gerencie seus imóveis, contatos e resultados.</p>

          {auth.status === 'disabled' ? (
            <p role="status" className="mt-6 rounded-2xl bg-sand p-4 text-[14.5px] leading-relaxed text-navy-950">
              O painel da imobiliária ainda não foi ativado neste endereço. Em breve você poderá cadastrar e
              publicar imóveis por aqui, sem depender de ninguém.
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6 space-y-4">
              <label className="block text-[14px] font-semibold text-navy-950">
                E-mail
                <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
              </label>
              <label className="block text-[14px] font-semibold text-navy-950">
                Senha
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={field}
                />
              </label>
              {error && (
                <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[14px] text-red-800">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy || auth.status === 'loading'}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-navy-950 text-[15px] font-semibold text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
              >
                <LockKeyhole className="size-4" aria-hidden="true" />
                {busy ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
