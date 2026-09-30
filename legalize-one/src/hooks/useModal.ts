import { useEffect, useEffectEvent, useId, type RefObject } from 'react'
import { isTopOverlay, pushOverlay } from '@/lib/uiStore'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface ModalOptions {
  /** Elemento que recebe o foco ao abrir (padrão: primeiro focável). */
  initialFocus?: RefObject<HTMLElement | null>
  /** Prende o Tab dentro da camada (padrão). Desligue quando o controle de fechar fica fora dela. */
  trapFocus?: boolean
}

/**
 * Comportamento de camada modal: registra na pilha de overlays (scroll lock e
 * CTA fixo escondido), Esc fecha apenas a camada do topo, foco preso dentro
 * da camada e devolvido ao elemento de origem ao fechar.
 */
export function useModal(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
  { initialFocus, trapFocus = true }: ModalOptions = {},
) {
  const id = useId()
  const close = useEffectEvent(onClose)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const pop = pushOverlay(id)

    const focusTarget = initialFocus?.current ?? ref.current?.querySelector<HTMLElement>(FOCUSABLE) ?? ref.current
    // Aguarda a camada renderizar/animar antes de mover o foco.
    const focusTimer = window.setTimeout(() => focusTarget?.focus({ preventScroll: true }), 30)

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isTopOverlay(id)) return
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (!trapFocus || e.key !== 'Tab' || !ref.current) return
      const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKeyDown)
      pop()
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [open, id, ref, initialFocus, trapFocus])
}
