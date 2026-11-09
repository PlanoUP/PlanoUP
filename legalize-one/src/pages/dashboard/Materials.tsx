import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { useAuth } from '@/auth/context'
import { MATERIALS, materialMessage, type Material } from '@/dashboard/materials'
import { usePageTitle } from '@/hooks/usePageTitle'

/** Materiais prontos para o corretor enviar ao cliente (WhatsApp ou copiar). */
export default function Materials() {
  usePageTitle('Materiais · Painel')
  const auth = useAuth()
  return (
    <div className="pb-24">
      <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-navy-950">Materiais para o cliente</h1>
      <p className="mt-1 max-w-2xl text-[14.5px] text-slate">
        Listas e orientações prontas. Toque em “Enviar no WhatsApp”, escolha o contato e mande — ou copie o texto.
      </p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {MATERIALS.map((m) => (
          <li key={m.id}>
            <MaterialCard m={m} sender={auth.fullName} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function MaterialCard({ m, sender }: { m: Material; sender: string | null }) {
  const [copied, setCopied] = useState(false)
  const text = materialMessage(m, sender)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* sem permissão de área de transferência: o botão do WhatsApp continua funcionando */
    }
  }
  return (
    <article className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-card sm:p-6">
      <h2 className="font-display text-[19px] font-bold text-navy-950">{m.title}</h2>
      <p className="mt-1 text-[14px] text-slate">{m.summary}</p>
      <ul className="mt-4 flex-1 space-y-2 text-[14px] text-navy-950">
        {m.items.map((i) => (
          <li key={i} className="flex gap-2">
            {!/^\d+\./.test(i) && <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />}
            <span>{i}</span>
          </li>
        ))}
      </ul>
      {m.footer && <p className="mt-3 rounded-xl bg-sand p-3 text-[13px] text-navy-950/80">{m.footer}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1f8a5b] px-4 text-[14px] font-semibold text-white hover:bg-[#1a774e]"
        >
          <WhatsAppIcon className="size-4" />
          Enviar no WhatsApp
        </a>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-navy-950/15 px-4 text-[14px] font-semibold text-navy-950 hover:bg-sand"
        >
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          {copied ? 'Copiado' : 'Copiar texto'}
        </button>
      </div>
    </article>
  )
}
