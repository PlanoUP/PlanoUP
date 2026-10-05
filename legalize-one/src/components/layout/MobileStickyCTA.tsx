import { CalendarCheck, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { track } from '@/lib/analytics'
import { useOverlayCount, useStickyActions, useStickySuppressed, type StickyAction } from '@/lib/uiStore'
import { whatsappLink } from '@/lib/whatsapp'
import { cn } from '@/utils/cn'

// Função (e não constante): o número do WhatsApp só é conhecido depois de identificar a imobiliária.
const defaultActions = (): StickyAction[] => [
  {
    kind: 'whatsapp',
    label: 'WhatsApp',
    icon: 'whatsapp',
    href: whatsappLink(),
    external: true,
    onClick: () => track('whatsapp_clicked', { placement: 'mobile_sticky' }),
  },
  { kind: 'primary', label: 'Encontrar imóvel', icon: 'search', to: '/imoveis' },
]

const icons = { whatsapp: WhatsAppIcon, search: Search, calendar: CalendarCheck }

/** Campos de texto abrem o teclado virtual: a barra some para não cobrir o formulário. */
function useKeyboardOpen() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && el.matches('input:not([type=radio]):not([type=checkbox]), textarea, select')
    const onIn = (e: FocusEvent) => isField(e.target) && setOpen(true)
    const onOut = () => setOpen(false)
    document.addEventListener('focusin', onIn)
    document.addEventListener('focusout', onOut)
    return () => {
      document.removeEventListener('focusin', onIn)
      document.removeEventListener('focusout', onOut)
    }
  }, [])
  return open
}

/**
 * Barra de ações fixa no rodapé — apenas em telas pequenas.
 * Some quando há camada aberta (tour imersivo, filtros, menu) ou teclado ativo,
 * e as páginas podem trocar as ações (ex.: imóvel → WhatsApp + Agendar visita).
 */
export function MobileStickyCTA() {
  const overlays = useOverlayCount()
  const custom = useStickyActions()
  const keyboardOpen = useKeyboardOpen()
  const suppressed = useStickySuppressed()
  const hidden = overlays > 0 || keyboardOpen || suppressed
  const actions = custom ?? defaultActions()

  return (
    <div
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-navy-950/10 bg-white/95 backdrop-blur-md transition-transform duration-300 md:hidden',
        hidden && 'translate-y-full',
      )}
    >
      <div className="grid grid-cols-2 gap-2.5 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {actions.map((action) => {
          const Icon = action.icon ? icons[action.icon] : null
          const className = cn(
            'inline-flex h-12 items-center justify-center gap-2 rounded-full text-[14px] font-semibold active:scale-[0.98]',
            action.kind === 'whatsapp'
              ? 'border border-[#1f8a5b]/25 bg-[#effaf4] text-[#136b44]'
              : 'bg-navy-800 text-white',
          )
          const content = (
            <>
              {Icon && <Icon className="size-5" />}
              {action.label}
            </>
          )
          return action.to ? (
            <Link key={action.label} to={action.to} onClick={action.onClick} className={className}>
              {content}
            </Link>
          ) : (
            <a
              key={action.label}
              href={action.href}
              onClick={action.onClick}
              className={className}
              {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {content}
            </a>
          )
        })}
      </div>
    </div>
  )
}
