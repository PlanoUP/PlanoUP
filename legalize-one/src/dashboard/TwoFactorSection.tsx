import { Loader2, ShieldCheck, Smartphone } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '@/auth/context'
import { removeFactor, startEnrollment, verifiedFactors, verifyTotp, type Enrollment } from '@/auth/mfa'
import { Button } from '@/components/ui/Button'
import { useAsyncData } from '@/hooks/useAsyncData'
import { cn } from '@/utils/cn'
import { Field, inputClass, Section } from './FormParts'
import { formatWhen } from './leadsApi'

type Msg = { tone: 'ok' | 'error'; text: string } | null

/** "Minha conta" → verificação em duas etapas: ativar (QR code + código) ou desativar. */
export function TwoFactorSection() {
  const auth = useAuth()
  const [version, setVersion] = useState(0)
  const { data: factors, loading } = useAsyncData(verifiedFactors, `${auth.userId}:${version}`)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<Msg>(null)
  const [confirmOff, setConfirmOff] = useState(false)
  const active = factors?.[0]
  const required = auth.isPlatformAdmin

  async function begin() {
    setBusy(true)
    setMsg(null)
    try {
      setEnrollment(await startEnrollment())
    } catch (e) {
      setMsg({ tone: 'error', text: e instanceof Error ? e.message : 'Não foi possível começar agora.' })
    } finally {
      setBusy(false)
    }
  }

  async function confirm(e: FormEvent) {
    e.preventDefault()
    if (!enrollment) return
    if (code.replace(/\D/g, '').length !== 6) return setMsg({ tone: 'error', text: 'Digite os 6 números que aparecem no aplicativo.' })
    setBusy(true)
    setMsg(null)
    const r = await verifyTotp(code, enrollment.factorId)
    setBusy(false)
    if (r.error) return setMsg({ tone: 'error', text: r.error })
    setEnrollment(null)
    setCode('')
    setVersion((v) => v + 1)
    await auth.refresh()
    setMsg({ tone: 'ok', text: 'Verificação em duas etapas ativada. A partir de agora, o painel pede o código a cada entrada.' })
  }

  async function turnOff() {
    if (!active) return
    setBusy(true)
    setMsg(null)
    try {
      await removeFactor(active.id)
      setConfirmOff(false)
      setVersion((v) => v + 1)
      await auth.refresh()
      setMsg({ tone: 'ok', text: 'Verificação em duas etapas desativada.' })
    } catch (e) {
      setMsg({ tone: 'error', text: e instanceof Error ? e.message : 'Não foi possível desativar.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section
      title="Verificação em duas etapas"
      description="Além da senha, o painel pede um código de 6 números gerado no seu celular. Se alguém descobrir sua senha, não entra sem o seu celular."
    >
      {loading && !factors ? (
        <div className="h-16 animate-pulse rounded-2xl bg-sand" aria-busy="true" />
      ) : active ? (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-tour">
            <ShieldCheck className="size-5" aria-hidden="true" />
            Ativada{active.created_at ? ` desde ${formatWhen(active.created_at)}` : ''}
          </p>
          {required ? (
            <p className="text-[13.5px] text-slate">Obrigatória para o administrador da plataforma.</p>
          ) : confirmOff ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" className="bg-red-700 hover:bg-red-800" disabled={busy} onClick={() => void turnOff()}>
                Confirmar: desativar
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmOff(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" onClick={() => setConfirmOff(true)}>
              Desativar
            </Button>
          )}
        </div>
      ) : enrollment ? (
        <form onSubmit={(e) => void confirm(e)} noValidate className="space-y-4">
          <ol className="list-decimal space-y-1.5 pl-5 text-[14.5px] text-navy-950">
            <li>
              Instale um aplicativo autenticador no celular: <strong>Google Authenticator</strong> ou <strong>Microsoft Authenticator</strong>{' '}
              (grátis).
            </li>
            <li>No aplicativo, toque em “+” e leia o QR code abaixo. No próprio celular, use o botão “Abrir no aplicativo”.</li>
            <li>Digite o código de 6 números que aparecer.</li>
          </ol>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <img src={enrollment.qrCode} alt="QR code para o aplicativo autenticador" className="size-44 rounded-2xl border border-navy-950/10 bg-white p-2" />
            <div className="min-w-0 space-y-2">
              <a
                href={enrollment.uri}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-navy-950/15 px-4 text-[13.5px] font-semibold text-navy-950 hover:bg-sand"
              >
                <Smartphone className="size-4" aria-hidden="true" />
                Abrir no aplicativo
              </a>
              <p className="text-[13px] text-slate">Ou digite esta chave no aplicativo:</p>
              <p className="font-mono text-[14px] font-semibold break-all text-navy-950 select-all">{enrollment.secret}</p>
            </div>
          </div>
          <Field label="Código de 6 números">
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={7}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ''))}
              className={cn(inputClass, 'max-w-[220px] text-center font-mono text-[20px] tracking-[0.3em]')}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Confirmar e ativar
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEnrollment(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" disabled={busy} onClick={() => void begin()}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="size-4" aria-hidden="true" />}
          Ativar verificação em duas etapas
        </Button>
      )}
      {msg && (
        <p role={msg.tone === 'error' ? 'alert' : 'status'} className={cn('mt-3 text-[14px] font-medium', msg.tone === 'error' ? 'text-red-700' : 'text-tour')}>
          {msg.text}
        </p>
      )}
    </Section>
  )
}
