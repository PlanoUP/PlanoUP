import { X } from 'lucide-react'
import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useModal } from '@/hooks/useModal'
import { cn } from '@/utils/cn'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  /** `dark` para uso dentro do tour imersivo. */
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * Bottom sheet acessível (role="dialog"): arrastar a alça para baixo, tocar
 * no fundo ou Esc fecham. Respeita safe-area e fica acima de qualquer camada.
 */
export function BottomSheet({ open, onClose, title, description, children, footer, tone = 'light', className }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [dragY, setDragY] = useState(0)
  const dragStart = useRef<number | null>(null)
  useModal(panelRef, open, onClose)

  if (!open) return null

  const dark = tone === 'dark'

  function onHandleDown(e: PointerEvent<HTMLDivElement>) {
    dragStart.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function onHandleMove(e: PointerEvent<HTMLDivElement>) {
    if (dragStart.current === null) return
    setDragY(Math.max(0, e.clientY - dragStart.current))
  }
  function onHandleUp() {
    if (dragStart.current === null) return
    dragStart.current = null
    if (dragY > 90) onClose()
    setDragY(0)
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center" data-overlay>
      <div
        className="absolute inset-0 animate-fade-in bg-navy-950/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined }}
        className={cn(
          'relative flex max-h-[88dvh] w-full animate-sheet-up flex-col rounded-t-3xl shadow-2xl outline-none sm:max-w-lg sm:rounded-3xl',
          dark ? 'bg-navy-950 text-white ring-1 ring-white/10' : 'bg-white text-navy-950',
          dragY === 0 && 'transition-transform duration-200',
          className,
        )}
      >
        <div
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
          className="flex cursor-grab touch-none justify-center pt-3 pb-1 sm:hidden"
          aria-hidden="true"
        >
          <span className={cn('h-1.5 w-11 rounded-full', dark ? 'bg-white/25' : 'bg-navy-950/15')} />
        </div>
        <div className="flex items-start justify-between gap-4 px-5 pt-2 pb-3 sm:pt-5">
          <div>
            <h2 className="font-display text-[19px] font-bold tracking-[-0.02em]">{title}</h2>
            {description && <p className={cn('mt-0.5 text-[13px]', dark ? 'text-white/65' : 'text-slate')}>{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className={cn(
              '-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full',
              dark ? 'text-white/80 hover:bg-white/10' : 'text-navy-950/70 hover:bg-sand',
            )}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
        {footer && (
          <div
            className={cn(
              'border-t px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]',
              dark ? 'border-white/10' : 'border-navy-950/8',
            )}
          >
            {footer}
          </div>
        )}
        {!footer && <div className="pb-[env(safe-area-inset-bottom)]" />}
      </div>
    </div>,
    document.body,
  )
}
