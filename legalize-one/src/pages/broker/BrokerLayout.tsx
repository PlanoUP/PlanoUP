import { Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router'
import { BrokerAvatar } from '@/broker/BrokerAvatar'
import { shareLink } from '@/broker/share'
import { MobileStickyCTA } from '@/components/layout/MobileStickyCTA'
import { PageViewTracker } from '@/components/layout/PageViewTracker'
import { ScrollManager } from '@/components/layout/ScrollManager'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { platform } from '@/config/site'
import { track } from '@/lib/analytics'
import { useOverlayCount, useStickyActions } from '@/lib/uiStore'
import { whatsappLink } from '@/lib/whatsapp'
import { useTenant } from '@/tenant/store'
import { cn } from '@/utils/cn'

/**
 * Página profissional do corretor (`/corretor/:slug`): sem o cabeçalho da imobiliária — o corretor é a marca.
 * A plataforma aparece discreta no rodapé: Impulsigo (autônomo) ou a imobiliária (corretor vinculado).
 */
export default function BrokerLayout() {
  const tenant = useTenant()
  const broker = tenant.broker
  const stickyActions = useStickyActions()
  const overlays = useOverlayCount()
  const [notice, setNotice] = useState<string | null>(null)

  // Perfil de demonstração: o WhatsApp não abre; explica no clique.
  useEffect(() => {
    if (!broker?.isDemo) return
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href="#demo-whatsapp"]')
      if (!link) return
      e.preventDefault()
      setNotice('Demonstração: no perfil de um corretor real, este botão abre o WhatsApp dele.')
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [broker?.isDemo])

  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => setNotice(null), 3500)
    return () => window.clearTimeout(t)
  }, [notice])

  if (!broker) return null
  const first = broker.name.split(' ')[0]

  async function shareProfile() {
    if (!broker) return
    const r = await shareLink({
      title: `${broker.name} · Corretor de imóveis`,
      text: broker.headline ?? undefined,
      url: `${window.location.origin}/corretor/${broker.slug}`,
    })
    if (r === 'copied') setNotice('Link do perfil copiado.')
    if (r !== 'cancelled') track('share_clicked', { target: 'broker_profile' })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <ScrollManager />
      <PageViewTracker />
      {broker.isDemo && (
        <p className="bg-amber-100 px-4 py-2 text-center text-[13px] font-semibold text-amber-900">
          Página de demonstração: corretor, CRECI e depoimentos fictícios. O WhatsApp está desativado.
        </p>
      )}
      <header className="sticky top-0 z-30 border-b border-navy-950/6 bg-white/92 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <Link to={`/corretor/${broker.slug}`} className="flex min-w-0 items-center gap-3">
            {broker.logoUrl ? (
              <img src={broker.logoUrl} alt={broker.name} className="h-9 w-auto max-w-[160px] object-contain" />
            ) : (
              <BrokerAvatar name={broker.name} photoUrl={broker.photoUrl} className="size-9 text-[13px]" />
            )}
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-[15.5px] font-bold tracking-[-0.01em] text-navy-950">{broker.name}</span>
              <span className="block truncate text-[11.5px] text-slate">Corretor de imóveis{broker.creci ? ` · ${broker.creci}` : ''}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => void shareProfile()}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-navy-950/12 px-4 text-[13.5px] font-semibold text-navy-950 hover:bg-sand"
          >
            <Share2 className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Compartilhar</span>
            <span className="sr-only sm:hidden">Compartilhar perfil</span>
          </button>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>

      <footer className="border-t border-navy-950/6 bg-sand pb-20 md:pb-0">
        <div className="container-page flex flex-col gap-3 py-8 text-[13px] text-slate sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold text-navy-950">{broker.name}</span>
            {broker.creci ? ` · ${broker.creci}` : ''}
            {broker.account.kind === 'agency' ? ` · Corretor parceiro da ${broker.account.name}` : ''}
          </p>
          {broker.account.kind === 'solo' ? (
            <a href="https://impulsigo.vercel.app" target="_blank" rel="noopener" className="inline-flex items-baseline gap-1 hover:text-navy-950">
              Powered by
              <span className="font-display font-extrabold tracking-[-0.01em] text-navy-950">
                {platform.name.slice(0, -2)}
                <span className="text-gold-600">{platform.name.slice(-2)}</span>
              </span>
            </a>
          ) : (
            <span className="font-semibold text-navy-950">{broker.account.name}</span>
          )}
        </div>
      </footer>

      {/* Celular: a página do imóvel usa a barra de ações dela; no perfil, um botão discreto para falar com o corretor. */}
      {stickyActions ? (
        <MobileStickyCTA />
      ) : (
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('whatsapp_clicked', { placement: 'broker_floating' })}
          className={cn(
            'fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex h-13 items-center gap-2 rounded-full bg-[#1f8a5b] px-5 text-[14.5px] font-semibold text-white shadow-[var(--shadow-float)] transition-transform md:hidden',
            overlays > 0 && 'translate-y-32',
          )}
        >
          <WhatsAppIcon className="size-5" />
          Falar com {first}
        </a>
      )}

      {notice && (
        <p
          role="status"
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-2xl bg-navy-950 px-4 py-3 text-center text-[14px] font-medium text-white shadow-[var(--shadow-float)]"
        >
          {notice}
        </p>
      )}
    </div>
  )
}
