import { Copy, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { accessMessage } from './teamApi'

export interface Credential {
  name: string
  email: string
  password: string
  title: string
}

/** Mostra a senha temporária uma única vez, com a mensagem pronta para enviar. */
export function CredentialCard({
  cred,
  tenantName,
  loginUrl,
  onClose,
}: {
  cred: Credential
  tenantName: string
  loginUrl: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const text = accessMessage({ ...cred, tenantName, loginUrl })
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* copiar manualmente */
    }
  }
  return (
    <section className="rounded-3xl bg-navy-950 p-5 text-white shadow-card sm:p-6" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[19px] font-bold">{cred.title}</p>
          <p className="mt-1 text-[14px] text-white/70">Anote ou envie agora: por segurança, esta senha não aparece de novo.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10">
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-[12.5px] text-white/60">E-mail</dt>
          <dd className="font-semibold break-all">{cred.email}</dd>
        </div>
        <div>
          <dt className="text-[12.5px] text-white/60">Senha temporária</dt>
          <dd className="font-mono text-[18px] font-semibold tracking-wide text-gold-400 select-all">{cred.password}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[12.5px] text-white/60">Link de acesso</dt>
          <dd className="font-semibold break-all">{loginUrl}</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" variant="gold" onClick={() => void copy()}>
          <Copy className="size-4" aria-hidden="true" />
          {copied ? 'Mensagem copiada' : 'Copiar mensagem de acesso'}
        </Button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center rounded-full border border-white/25 px-5 text-sm font-semibold hover:bg-white/10"
        >
          Enviar por WhatsApp
        </a>
      </div>
    </section>
  )
}
