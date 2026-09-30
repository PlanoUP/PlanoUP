import { lazy, Suspense, useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { useIsDesktop, useReducedMotion } from '@/hooks/useMediaQuery'
import { useModal } from '@/hooks/useModal'
import { track } from '@/lib/analytics'
import type { Model3DConfig } from '@/types/model3d'
import { cn } from '@/utils/cn'
import { Property3DEntry } from './Property3DEntry'
import { Property3DFallback } from './Property3DFallback'
import { Property3DLoader } from './Property3DLoader'
import type { FullscreenControl } from './Property3DToolbar'
import { loadViewer, supportsWebGL } from './webgl'

const Property3DViewer = lazy(loadViewer)

const PARAM = 'modelo3d'
/** Altura do cabeçalho fixo + respiro, para o visualizador inline ficar inteiro na tela. */
const HEADER_OFFSET = 88

interface Property3DExperienceProps {
  url: string
  poster?: string
  posterAlt: string
  title: string
  config: Model3DConfig
  scheduleMessage: string
  onShowPhotos: () => void
  className?: string
}

/**
 * Orquestra a experiência do modelo 3D sem carregar three.js:
 * capa → (clique) → visualizador.
 * - Desktop: abre no próprio card (altura proporcional à tela), com "Tela cheia".
 * - Celular/tablet: abre direto em modo imersivo (100dvh, sem header nem CTA fixo);
 *   a página continua intacta por trás e, ao fechar, volta exatamente onde estava.
 * O modo imersivo fica na URL: o "voltar" do celular fecha o visualizador.
 */
export function Property3DExperience({
  url,
  poster,
  posterAlt,
  title,
  config,
  scheduleMessage,
  onShowPhotos,
  className,
}: Property3DExperienceProps) {
  const isDesktop = useIsDesktop()
  const reducedMotion = useReducedMotion()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [active, setActive] = useState(false)
  const [unsupported, setUnsupported] = useState(false)
  const [nativeFullscreen, setNativeFullscreen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const closeFocusRef = useRef<HTMLElement | null>(null)
  const savedScroll = useRef<number | null>(null)

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

  // Ao fechar (botão, Esc ou "voltar"), a página volta exatamente para onde estava.
  const prevActive = useRef(active)
  useEffect(() => {
    if (prevActive.current && !active && savedScroll.current !== null) {
      const top = savedScroll.current
      savedScroll.current = null
      requestAnimationFrame(() => window.scrollTo({ top, behavior: 'instant' }))
    }
    prevActive.current = active
  }, [active])

  // Desktop: o visualizador aparece inteiro, logo abaixo do cabeçalho.
  useEffect(() => {
    if (!active || !isDesktop || immersive) return
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.top < HEADER_OFFSET || rect.bottom > window.innerHeight - 16)
      window.scrollBy({ top: rect.top - HEADER_OFFSET, behavior: reducedMotion ? 'instant' : 'smooth' })
    // Só na abertura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // Tela cheia nativa (Android/desktop); o iPhone não permite em elementos.
  useEffect(() => {
    const onChange = () => setNativeFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

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
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
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
    if (!isDesktop) savedScroll.current = window.scrollY
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

  const fullscreen = useMemo<FullscreenControl | null>(() => {
    if (isDesktop) return { active: immersive, toggle: immersive ? exitImmersive : enterImmersive }
    if (typeof document === 'undefined' || !document.fullscreenEnabled) return null
    return {
      active: nativeFullscreen,
      toggle: () => {
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
        else void rootRef.current?.requestFullscreen?.().catch(() => undefined)
      },
    }
  }, [isDesktop, immersive, nativeFullscreen, enterImmersive, exitImmersive])

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
      {/* No celular a capa continua na página (o visualizador abre por cima): nada salta ao fechar. */}
      {(!active || !isDesktop) && (
        <Property3DEntry poster={poster} posterAlt={posterAlt} sizeBytes={config.sizeBytes} onStart={start} />
      )}
      {active && (
        // Desktop: reserva a altura do card (também enquanto em tela cheia — sem salto de layout).
        <div className={cn(isDesktop && 'relative h-[clamp(460px,calc(100dvh-170px),660px)]')}>
          <div
            ref={rootRef}
            role={immersive ? 'dialog' : 'region'}
            aria-modal={immersive || undefined}
            aria-label={`Modelo 3D interativo — ${title}`}
            className={cn(immersive || !isDesktop ? 'fixed inset-0 z-[100] h-dvh w-screen' : 'absolute inset-0')}
          >
            <Suspense fallback={<Property3DLoader poster={poster} ratio={null} loadedBytes={0} stage="starting" />}>
              <Property3DViewer
                url={url}
                poster={poster}
                title={title}
                config={config}
                immersive={immersive || !isDesktop}
                fullscreen={fullscreen}
                onClose={isDesktop && immersive ? exitImmersive : close}
                onShowPhotos={showPhotos}
                scheduleMessage={scheduleMessage}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  )
}
