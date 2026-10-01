import { ArrowRight, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, type Location } from 'react-router'
import { ButtonAnchor } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { mainNav, type NavItem } from '@/config/site'
import { useModal } from '@/hooks/useModal'
import { track } from '@/lib/analytics'
import { whatsappLink } from '@/lib/whatsapp'
import { useTenant } from '@/tenant/store'
import { cn } from '@/utils/cn'

function isActive(item: NavItem, location: Location): boolean {
  const [path, query = ''] = item.to.split('?')
  const [pathname, hash] = path.split('#')
  const purpose = new URLSearchParams(location.search).get('finalidade')

  if (hash) return location.pathname === '/' && location.hash === `#${hash}`
  if (pathname === '/') return location.pathname === '/' && !location.hash
  if (pathname === '/imoveis') {
    const onListing = location.pathname.startsWith('/imoveis') || location.pathname.startsWith('/imovel/')
    return query ? onListing && purpose === 'venda' : onListing && purpose !== 'venda'
  }
  return location.pathname.startsWith(pathname)
}

export function Header() {
  const tenant = useTenant()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fecha o menu mobile ao navegar.
  const [lastKey, setLastKey] = useState(location.key)
  if (lastKey !== location.key) {
    setLastKey(location.key)
    setOpen(false)
  }

  // Menu aberto = camada: trava o scroll, Esc fecha, esconde o CTA fixo e devolve o foco ao botão.
  const menuRef = useRef<HTMLDivElement>(null)
  useModal(menuRef, open, () => setOpen(false), { trapFocus: false })

  return (
    <>
    <header
      className={cn(
        'sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-shadow duration-300',
        scrolled ? 'border-navy-950/8 shadow-[0_6px_24px_-18px_rgb(7_27_46/0.5)]' : 'border-transparent',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[76px] lg:gap-6">
        <Logo />

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active = isActive(item, location)
              return (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative px-3.5 py-2 text-[14px] transition-colors',
                      active ? 'font-semibold text-navy-950' : 'text-navy-950/75 hover:text-navy-950',
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        'absolute inset-x-3.5 -bottom-[3px] h-[2px] rounded-full bg-navy-950 transition-transform duration-300',
                        active ? 'scale-x-100' : 'scale-x-0',
                      )}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ButtonAnchor
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('whatsapp_clicked', { placement: 'header' })}
            >
              <WhatsAppIcon className="size-[18px]" />
              Fale com um especialista
              <ArrowRight className="size-4" />
            </ButtonAnchor>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            className="inline-flex size-11 items-center justify-center rounded-full border border-navy-950/10 text-navy-950 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
    </header>

      {/* Menu mobile (fora do header: o backdrop-filter criaria outro contexto para `fixed`) */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={cn(
          'fixed inset-x-0 top-16 bottom-0 z-[60] overflow-y-auto overscroll-contain bg-white transition-all duration-300 lg:hidden',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
      >
        <nav aria-label="Menu mobile" className="container-page flex min-h-full flex-col pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <ul className="divide-y divide-navy-950/8">
            {mainNav.map((item, i) => (
              <li key={item.label} style={{ transitionDelay: open ? `${i * 30}ms` : '0ms' }}
                className={cn('transition-all duration-300', open ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0')}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex min-h-14 items-center justify-between py-3 font-display text-[21px] tracking-[-0.02em]',
                    isActive(item, location) ? 'font-bold text-navy-950' : 'font-medium text-navy-950/80',
                  )}
                >
                  {item.label}
                  <ArrowRight className="size-5 text-gold-600" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-3 pt-8">
            <ButtonAnchor
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className="w-full"
              onClick={() => track('whatsapp_clicked', { placement: 'mobile_menu' })}
            >
              <WhatsAppIcon className="size-5" />
              Fale com um especialista
            </ButtonAnchor>
            <p className="text-center text-[13px] text-slate">
              {[tenant.contact.phoneDisplay, tenant.contact.businessHours].filter(Boolean).join(' · ')}
            </p>
          </div>
        </nav>
      </div>
    </>
  )
}
