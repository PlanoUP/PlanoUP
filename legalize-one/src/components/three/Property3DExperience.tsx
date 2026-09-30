import { CalendarCheck } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useModal } from '@/hooks/useModal'
import { track } from '@/lib/analytics'
import { whatsappLink } from '@/lib/whatsapp'
import type { Model3DConfig } from '@/types/model3d'
import { cn } from '@/utils/cn'
import { Property3DEntry } from './Property3DEntry'
import { Property3DFallback } from './Property3DFallback'
import { Property3DLoader } from './Property3DLoader'
import { loadViewer, supportsWebGL } from './webgl'

const Property3DViewer = lazy(loadViewer)

const PARAM = 'modelo3d'

interface Property3DExperienceProps {
  url: string
  poster?: string
  posterAlt: string
  title: string
  config: Model3DConfig
  scheduleMessage: string
  whatsappMessage: string
  onShowPhotos: () => void
  className?: string
}

/**
 * Orquestra a experiência do modelo 3D sem carregar three.js:
 * capa → (clique) → visualizador. Desktop abre no próprio card, com opção de
 * tela cheia; celular abre direto em tela cheia (evita conflito entre girar o
 * modelo e rolar a página). Tela cheia fica na URL: o "voltar" do celular sai dela.
 */
export function Property3DExperience({
  url,
  poster,
  posterAlt,
  title,
  config,
  scheduleMessage,
  whatsappMessage,
  onShowPhotos,
  className,
}: Property3DExperienceProps) {
  const isDesktop = useIsDesktop()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [active, setActive] = useState(false)
  const [unsupported, setUnsupported] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const closeFocusRef = useRef<HTMLElement | null>(null)

  const immersive = active && params.get(PARAM) === '1'

  // Voltar do navegador saindo da tela cheia no celular = fechar o visualizador.
  const [wasImmersive, setWasImmersive] = useState(immersive)
  if (wasImmersive !== immersive) {
    setWasImmersive(immersive)
    if (!immersive && !isDesktop) setActive(false)
  }
  const prevImmersive = useRef(immersive)
  useEffect(() => {
    if (prevImmersive.current && !immersive) track('model3d_fullscreen_exited')
    prevImmersive.current = immersive
  }, [immersive])

  // Link aberto com ?modelo3d=1 sem clique nesta sessão: não carrega sozinho (remove o parâmetro).
  const stripStaleParam = useEffectEvent(() => {
    if (params.get(PARAM) !== '1') return
    const next = new URLSearchParams(params)
    next.delete(PARAM)
    setParams(next, { replace: true, preventScrollReset: true })
  })
  useEffect(() => stripStaleParam(), [])

  const enterImmersive = useCallback(() => {
    track('model3d_fullscreen_entered')
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set(PARAM, '1')
        return next
      },
      { state: { m3dPushed: true }, preventScrollReset: true },
    )
  }, [setParams])

  const exitImmersive = useCallback(() => {
    if ((location.state as { m3dPushed?: boolean } | null)?.m3dPushed) navigate(-1)
    else
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete(PARAM)
          return next
        },
        { replace: true, preventScrollReset: true },
      )
  }, [location.state, navigate, setParams])

  function start() {
    track('model3d_started', { device: isDesktop ? 'desktop' : 'mobile' })
    if (!supportsWebGL()) {
      setUnsupported(true)
      track('model3d_load_failed', { reason: 'webgl_unavailable' })
      return
    }
    closeFocusRef.current = document.activeElement as HTMLElement | null
    setActive(true)
    if (!isDesktop) enterImmersive()
  }

  const close = useCallback(() => {
    track('model3d_closed')
    if (immersive) exitImmersive()
    setActive(false)
    window.setTimeout(() => closeFocusRef.current?.focus?.({ preventScroll: true }), 50)
  }, [immersive, exitImmersive])

  // Tela cheia = camada modal: Esc sai, CTA fixo escondido, rolagem travada, foco preso.
  useModal(rootRef, immersive, isDesktop ? exitImmersive : close)

  const showPhotos = () => {
    close()
    onShowPhotos()
  }

  if (unsupported) {
    return (
      <div id="modelo-3d" className={cn('relative h-[440px] overflow-hidden rounded-2xl', className)}>
        <Property3DFallback poster={poster} scheduleMessage={scheduleMessage} onShowPhotos={onShowPhotos} />
      </div>
    )
  }

  return (
    <div id="modelo-3d" className={className}>
      {!active ? (
        <Property3DEntry poster={poster} posterAlt={posterAlt} sizeBytes={config.sizeBytes} onStart={start} />
      ) : (
        <>
          {/* Reserva a altura do card enquanto o visualizador está em tela cheia (sem salto de layout). */}
          <div className="relative h-[480px] sm:h-[540px] lg:h-[600px]">
            <div
              ref={rootRef}
              role={immersive ? 'dialog' : 'region'}
              aria-modal={immersive || undefined}
              aria-label={`Modelo 3D interativo — ${title}`}
              className={cn(immersive ? 'fixed inset-0 z-[100] h-dvh w-screen' : 'absolute inset-0')}
            >
              <Suspense fallback={<Property3DLoader poster={poster} ratio={null} loadedBytes={0} stage="starting" />}>
                <Property3DViewer
                  url={url}
                  poster={poster}
                  title={title}
                  config={config}
                  immersive={immersive}
                  canToggleImmersive={isDesktop}
                  onToggleImmersive={immersive ? exitImmersive : enterImmersive}
                  onClose={isDesktop && immersive ? exitImmersive : close}
                  onShowPhotos={showPhotos}
                  scheduleMessage={scheduleMessage}
                  whatsappMessage={whatsappMessage}
                />
              </Suspense>
            </div>
          </div>

          {/* CTA comercial discreto, abaixo do visualizador */}
          <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-navy-950/8 bg-sand p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] font-semibold tracking-[0.16em] text-navy-950 uppercase">Gostou do que viu?</p>
            <div className="grid grid-cols-2 gap-2.5 sm:flex">
              <a
                href={whatsappLink(scheduleMessage)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('model3d_schedule_clicked', { placement: 'below_viewer' })}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-navy-800 px-5 text-[14px] font-semibold text-white hover:bg-navy-700"
              >
                <CalendarCheck className="size-4" aria-hidden="true" />
                Agendar visita
              </a>
              <a
                href={whatsappLink(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('model3d_whatsapp_clicked', { placement: 'below_viewer' })}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#1f8a5b]/25 bg-[#effaf4] px-5 text-[14px] font-semibold text-[#136b44]"
              >
                <WhatsAppIcon className="size-4" />
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
