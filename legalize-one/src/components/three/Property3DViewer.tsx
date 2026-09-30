import { Box, CalendarCheck, Check, CookingPot, DoorOpen, Hand, House, RotateCcw, Sofa, Trees, X, type LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Group } from 'three'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useMediaQuery, useReducedMotion } from '@/hooks/useMediaQuery'
import { track } from '@/lib/analytics'
import { whatsappLink } from '@/lib/whatsapp'
import type { Model3DConfig, Model3DHotspot } from '@/types/model3d'
import { cn } from '@/utils/cn'
import type { Model3DView } from './cameraGoals'
import { loadModel, type LoadProgress } from './loadModel'
import { Property3DCanvas } from './Property3DCanvas'
import { Property3DErrorBoundary } from './Property3DErrorBoundary'
import { Property3DFallback } from './Property3DFallback'
import { Property3DLoader } from './Property3DLoader'
import { Property3DToolbar, type FullscreenControl } from './Property3DToolbar'
import { disposeModel, prepareModel, type ModelFit } from './prepareModel'

export interface Property3DViewerProps {
  url: string
  poster?: string
  title: string
  config: Model3DConfig
  immersive: boolean
  /** Botão "Tela cheia" (desktop: modo imersivo; celular: tela cheia nativa, quando existe). */
  fullscreen: FullscreenControl | null
  onClose: () => void
  onShowPhotos: () => void
  scheduleMessage: string
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; model: Group; fit: ModelFit }
  | { status: 'error'; reason: string }

/** Ícone de cada ambiente na lista (padrão: porta). */
const ROOM_ICONS: Record<string, LucideIcon> = { overview: Box, facade: House, living: Sofa, kitchen: CookingPot, outdoor: Trees }

const HINT_KEY = 'legalize:m3d-hint-seen'
const readHintSeen = () => {
  try {
    return sessionStorage.getItem(HINT_KEY) === '1'
  } catch {
    return false
  }
}
const saveHintSeen = () => {
  try {
    sessionStorage.setItem(HINT_KEY, '1')
  } catch {
    /* navegação privada: a dica apenas volta a aparecer */
  }
}

/** Espaço das barras do visualizador — o imóvel é centralizado na área livre entre elas. */
const INSETS_MOBILE = { top: 76, bottom: 150 }
const INSETS_DESKTOP = { top: 76, bottom: 84 }

/**
 * VISUALIZADOR DO MODELO 3D (carregado sob demanda — traz three/R3F/drei).
 * Só é montado depois do clique em "Explorar modelo 3D"; ao desmontar, cancela
 * o download e libera a memória da GPU.
 */
export default function Property3DViewer({
  url,
  poster,
  title,
  config,
  immersive,
  fullscreen,
  onClose,
  onShowPhotos,
  scheduleMessage,
}: Property3DViewerProps) {
  const reducedMotion = useReducedMotion()
  const coarsePointer = useMediaQuery('(pointer: coarse)')
  const isSmall = !useMediaQuery('(min-width: 640px)')
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [progress, setProgress] = useState<LoadProgress | null>(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [loaderGone, setLoaderGone] = useState(false)
  const [view, setView] = useState<Model3DView>({ kind: 'overview' })
  const [hintVisible, setHintVisible] = useState(() => !readHintSeen())
  const [dragging, setDragging] = useState(false)
  const [roomsOpen, setRoomsOpen] = useState(false)
  const [activeHotspot, setActiveHotspot] = useState<Model3DHotspot | null>(null)
  const hotspotLayer = useRef<HTMLDivElement>(null)
  const insets = isSmall ? INSETS_MOBILE : INSETS_DESKTOP

  // Download (com progresso real) → montagem → otimização. Cancelado se o usuário sair antes.
  useEffect(() => {
    const controller = new AbortController()
    const startedAt = performance.now()
    let downloadedAt = 0
    let loaded: Group | null = null
    loadModel(url, {
      signal: controller.signal,
      sizeHint: config.sizeBytes,
      onProgress: (p) => {
        if (p.stage === 'processing' && !downloadedAt) downloadedAt = performance.now()
        setProgress(p)
      },
    })
      .then((scene) => {
        if (controller.signal.aborted) return
        const parsedAt = performance.now()
        const prepared = prepareModel(scene)
        loaded = prepared.root
        setState({ status: 'ready', model: prepared.root, fit: prepared.fit })
        const now = performance.now()
        track('model3d_loaded', {
          duration_ms: Math.round(now - startedAt),
          download_ms: Math.round((downloadedAt || parsedAt) - startedAt),
          parse_ms: Math.round(parsedAt - (downloadedAt || startedAt)),
          prepare_ms: Math.round(now - parsedAt),
          triangles: prepared.stats.triangles,
          draw_calls: prepared.stats.meshesAfter,
          meshes_original: prepared.stats.meshesBefore,
        })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const reason = error instanceof Error ? error.message : String(error)
        setState({ status: 'error', reason })
        track('model3d_load_failed', { reason: 'load', message: reason.slice(0, 120) })
      })
    return () => {
      controller.abort()
      if (loaded) disposeModel(loaded)
    }
  }, [url, config.sizeBytes])

  // Loader sai em fade depois que o primeiro quadro está na tela (nunca revela um canvas vazio).
  useEffect(() => {
    if (!sceneReady) return
    const timer = window.setTimeout(() => setLoaderGone(true), reducedMotion ? 0 : 650)
    return () => window.clearTimeout(timer)
  }, [sceneReady, reducedMotion])

  // Dica de gestos: some sozinha depois de alguns segundos.
  useEffect(() => {
    if (!loaderGone || !hintVisible) return
    const timer = window.setTimeout(() => setHintVisible(false), 7000)
    return () => window.clearTimeout(timer)
  }, [loaderGone, hintVisible])

  const dismissHint = useCallback(() => {
    setHintVisible(false)
    saveHintSeen()
  }, [])

  const changeView = useCallback(
    (next: Model3DView) => {
      setView(next)
      setActiveHotspot(null)
      dismissHint()
      track('model3d_view_changed', {
        mode: next.kind === 'plan' ? 'plan' : next.kind === 'viewpoint' ? 'rooms' : 'overview',
        id: next.kind === 'plan' ? next.levelId : next.kind === 'viewpoint' ? next.id : 'overview',
      })
      if (next.kind === 'plan') track('model3d_plan_view', { level: next.levelId })
    },
    [dismissHint],
  )

  const resetView = () => {
    track('model3d_view_reset', { from: view.kind })
    changeView({ kind: 'overview' })
  }

  const onContextLost = useCallback(() => {
    setState({ status: 'error', reason: 'webgl-context-lost' })
    track('model3d_load_failed', { reason: 'context_lost' })
  }, [])
  const onFirstFrame = useCallback(() => setSceneReady(true), [])

  const viewLabel = useMemo(() => {
    if (view.kind === 'plan') {
      const level = config.planLevels?.find((l) => l.id === view.levelId)
      return level ? `Planta · ${level.label}` : 'Planta'
    }
    if (view.kind === 'viewpoint') return config.viewpoints?.find((v) => v.id === view.id)?.label ?? 'Ambiente'
    return 'Visão geral'
  }, [view, config])

  const ready = state.status === 'ready'
  // CTA nunca disputa espaço/atenção com o gesto, com a lista de ambientes ou com os pavimentos no celular.
  const ctaVisible = ready && loaderGone && !dragging && !roomsOpen && !(isSmall && (view.kind === 'plan' || activeHotspot))

  const fallback = <Property3DFallback poster={poster} scheduleMessage={scheduleMessage} onShowPhotos={onShowPhotos} />

  return (
    <div
      className={cn(
        '@container relative isolate h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_42%,#ffffff_0%,#f6f4f0_52%,#e9e5de_100%)] text-navy-950 select-none',
        !immersive && 'rounded-2xl ring-1 ring-navy-950/8',
      )}
    >
      {state.status === 'error' && fallback}

      {state.status === 'ready' && (
        <Property3DErrorBoundary fallback={fallback}>
          <div
            className="absolute inset-0 overscroll-contain"
            onPointerDown={dismissHint}
            onWheel={dismissHint}
          >
            <Property3DCanvas
              model={state.model}
              fit={state.fit}
              config={config}
              view={view}
              insets={insets}
              sceneReady={sceneReady}
              onFirstFrame={onFirstFrame}
              reducedMotion={reducedMotion}
              activeHotspotId={activeHotspot?.id ?? null}
              onHotspotSelect={(hotspot) => {
                dismissHint()
                setActiveHotspot((current) => (current?.id === hotspot.id ? null : hotspot))
                track('model3d_hotspot_clicked', { id: hotspot.id, type: hotspot.type })
                if (hotspot.type === 'navigation' && hotspot.targetViewpointId)
                  changeView({ kind: 'viewpoint', id: hotspot.targetViewpointId })
              }}
              onUserInteract={dismissHint}
              onInteractionChange={setDragging}
              onContextLost={onContextLost}
              hotspotLayer={hotspotLayer}
            />
          </div>
          {/* Camada dos hotspots (fora do contêiner interno do Canvas). */}
          <div ref={hotspotLayer} className="pointer-events-none absolute inset-0 overflow-hidden" />

          {/* Card do hotspot */}
          {activeHotspot && activeHotspot.type !== 'navigation' && (
            <div
              role="dialog"
              aria-labelledby="m3d-hs-title"
              className="absolute inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+92px)] z-20 animate-pop rounded-2xl border border-navy-950/8 bg-white/96 p-4 shadow-[0_18px_40px_-16px_rgb(7_27_46/0.45)] backdrop-blur-xl sm:inset-x-auto sm:top-20 sm:bottom-auto sm:left-4 sm:w-[320px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10.5px] font-semibold tracking-[0.18em] text-[#8a6a33] uppercase">
                    {activeHotspot.type === 'feature' ? 'Destaque do imóvel' : 'Detalhe'}
                  </p>
                  <p id="m3d-hs-title" className="mt-1 font-display text-[16px] font-bold">
                    {activeHotspot.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveHotspot(null)}
                  aria-label="Fechar detalhe"
                  className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-navy-950/60 hover:bg-navy-950/6 hover:text-navy-950"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-navy-950/75">{activeHotspot.description}</p>
            </div>
          )}

          {/* Base: modos (esquerda/baixo) + CTA comercial discreto (direita/acima) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col-reverse gap-2.5 bg-gradient-to-t from-[#ece8e1]/90 via-[#ece8e1]/40 to-transparent px-3 pt-10 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-end sm:justify-between sm:px-4 sm:pb-4">
            <div className="pointer-events-auto">
              <Property3DToolbar
                config={config}
                view={view}
                onChange={changeView}
                onOpenRooms={() => {
                  setRoomsOpen(true)
                  dismissHint()
                  track('model3d_rooms_opened')
                }}
                fullscreen={fullscreen}
              />
            </div>
            <div
              aria-hidden={!ctaVisible}
              className={cn(
                'flex justify-center transition-opacity duration-300 sm:block',
                ctaVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              <div className="pointer-events-auto flex flex-col items-center gap-1.5 sm:rounded-2xl sm:border sm:border-navy-950/8 sm:bg-white/92 sm:px-2 sm:pt-2 sm:pb-2 sm:shadow-[0_10px_30px_-12px_rgb(7_27_46/0.35)] sm:backdrop-blur-md">
                <p className="hidden text-[10.5px] font-semibold tracking-[0.16em] whitespace-nowrap text-navy-950/70 uppercase sm:block">
                  Gostou do imóvel?
                </p>
                <a
                  href={whatsappLink(scheduleMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={ctaVisible ? undefined : -1}
                  onClick={() => track('model3d_schedule_clicked', { placement: 'viewer' })}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-gold-500 px-5 text-[14px] font-semibold whitespace-nowrap text-navy-950 shadow-[0_8px_20px_-8px_rgb(7_27_46/0.5)] hover:bg-gold-400"
                >
                  <CalendarCheck className="size-4" aria-hidden="true" />
                  Agendar visita
                </a>
              </div>
            </div>
          </div>

          {/* Dica de gestos: discreta, abaixo da barra superior, só na primeira abertura */}
          {hintVisible && loaderGone && (
            <div
              role="status"
              className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+72px)] z-10 flex animate-fade-in justify-center px-4"
            >
              <p className="inline-flex items-center gap-2 rounded-full bg-navy-950/80 px-3.5 py-2 text-[12.5px] font-medium text-white shadow-lg backdrop-blur-md">
                <Hand className="size-4 shrink-0" aria-hidden="true" />
                {coarsePointer ? 'Arraste para girar · Use dois dedos para aproximar' : 'Arraste para girar · Scroll para aproximar'}
              </p>
            </div>
          )}
        </Property3DErrorBoundary>
      )}

      {/* Loader por cima do canvas até o primeiro quadro; sai em fade */}
      {state.status !== 'error' && !loaderGone && (
        <div
          className={cn(
            'absolute inset-0 z-20 transition-opacity duration-[650ms] ease-out',
            sceneReady ? 'pointer-events-none opacity-0' : 'opacity-100',
          )}
        >
          <Property3DLoader
            poster={poster}
            ratio={ready ? 1 : (progress?.ratio ?? null)}
            loadedBytes={progress?.loadedBytes ?? 0}
            totalBytes={config.sizeBytes}
            stage={ready ? 'processing' : (progress?.stage ?? 'starting')}
          />
        </div>
      )}

      {/* Topo: fechar, ambiente atual + imóvel, redefinir visão */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-6 sm:gap-3 sm:px-4',
          // Véu claro sutil: o título continua legível quando o modelo passa por trás.
          loaderGone && 'bg-gradient-to-b from-[#f6f4f0]/85 via-[#f6f4f0]/50 to-transparent',
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar modelo 3D"
          className={cn(
            'pointer-events-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full border shadow-sm backdrop-blur-md',
            loaderGone
              ? 'border-navy-950/10 bg-white/92 text-navy-950 hover:bg-white'
              : 'border-white/20 bg-navy-950/60 text-white hover:bg-navy-950/85',
          )}
        >
          <X className="size-5" />
        </button>
        <div
          className={cn(
            'min-w-0 flex-1 rounded-2xl transition-opacity duration-300',
            loaderGone ? 'opacity-100' : 'opacity-0',
          )}
        >
          <p className="truncate text-[10.5px] font-semibold tracking-[0.18em] text-[#8a6a33] uppercase" aria-live="polite">
            {viewLabel}
          </p>
          <p className="truncate text-[14px] font-semibold text-navy-950">{title}</p>
        </div>
        {ready && loaderGone && (
          <button
            type="button"
            onClick={resetView}
            className="pointer-events-auto inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-navy-950/10 bg-white/92 px-3.5 text-[13px] font-semibold text-navy-950 shadow-sm backdrop-blur-md hover:bg-white sm:px-4"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            <span className="sm:hidden">Redefinir</span>
            <span className="hidden sm:inline">Redefinir visão</span>
          </button>
        )}
      </div>

      <BottomSheet
        open={roomsOpen}
        onClose={() => setRoomsOpen(false)}
        title="Explore os ambientes"
        description="Escolha um ambiente — a câmera leva você até ele."
      >
        <ul className="grid gap-2 pb-1">
          {[
            { id: 'overview', label: 'Visão geral', description: 'A residência completa em perspectiva', icon: 'overview' },
            ...(config.viewpoints ?? []),
          ].map((room) => {
            const Icon = (room.icon && ROOM_ICONS[room.icon]) || DoorOpen
            const selected = room.id === 'overview' ? view.kind === 'overview' : view.kind === 'viewpoint' && view.id === room.id
            return (
              <li key={room.id}>
                <button
                  type="button"
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => {
                    setRoomsOpen(false)
                    changeView(room.id === 'overview' ? { kind: 'overview' } : { kind: 'viewpoint', id: room.id })
                  }}
                  className={cn(
                    'flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors',
                    selected ? 'border-gold-500 bg-gold-500/10' : 'border-navy-950/10 hover:border-navy-950/25 hover:bg-sand',
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-950 text-gold-400">
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold">{room.label}</span>
                    {room.description && <span className="block text-[13px] text-navy-950/60">{room.description}</span>}
                  </span>
                  {selected && <Check className="size-5 shrink-0 text-gold-600" aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
      </BottomSheet>
    </div>
  )
}
