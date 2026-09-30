import { CalendarCheck, Hand, Maximize, Minimize, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Group } from 'three'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
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
import { Property3DToolbar } from './Property3DToolbar'
import { disposeModel, prepareModel, type ModelFit } from './prepareModel'

export interface Property3DViewerProps {
  url: string
  poster?: string
  title: string
  config: Model3DConfig
  immersive: boolean
  /** Mostrar o botão de tela cheia (no celular o viewer já abre imersivo). */
  canToggleImmersive: boolean
  onToggleImmersive: () => void
  onClose: () => void
  onShowPhotos: () => void
  scheduleMessage: string
  whatsappMessage: string
}

type LoadState =
  | { status: 'loading'; progress: LoadProgress | null }
  | { status: 'ready'; model: Group; fit: ModelFit }
  | { status: 'error'; reason: string }

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
  canToggleImmersive,
  onToggleImmersive,
  onClose,
  onShowPhotos,
  scheduleMessage,
  whatsappMessage,
}: Property3DViewerProps) {
  const reducedMotion = useReducedMotion()
  const coarsePointer = useMediaQuery('(pointer: coarse)')
  const [state, setState] = useState<LoadState>({ status: 'loading', progress: null })
  const [view, setView] = useState<Model3DView>({ kind: 'exterior' })
  const [interacted, setInteracted] = useState(false)
  const [activeHotspot, setActiveHotspot] = useState<Model3DHotspot | null>(null)
  const hotspotLayer = useRef<HTMLDivElement>(null)

  // Download (com progresso real) → montagem → otimização. Cancelado se o usuário sair antes.
  useEffect(() => {
    const controller = new AbortController()
    const startedAt = performance.now()
    let loaded: Group | null = null
    loadModel(url, {
      signal: controller.signal,
      sizeHint: config.sizeBytes,
      onProgress: (progress) => setState({ status: 'loading', progress }),
    })
      .then((scene) => {
        if (controller.signal.aborted) return
        const prepared = prepareModel(scene)
        loaded = prepared.root
        setState({ status: 'ready', model: prepared.root, fit: prepared.fit })
        track('model3d_loaded', {
          duration_ms: Math.round(performance.now() - startedAt),
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

  const changeView = useCallback((next: Model3DView) => {
    setView(next)
    setActiveHotspot(null)
    setInteracted(true)
    track('model3d_view_changed', {
      mode: next.kind === 'plan' ? 'plan' : next.kind === 'viewpoint' ? 'tour' : 'exterior',
      id: next.kind === 'plan' ? next.levelId : next.kind === 'viewpoint' ? next.id : 'exterior',
    })
    if (next.kind === 'plan') track('model3d_plan_view', { level: next.levelId })
  }, [])

  const onUserInteract = useCallback(() => setInteracted(true), [])
  const onContextLost = useCallback(() => {
    setState({ status: 'error', reason: 'webgl-context-lost' })
    track('model3d_load_failed', { reason: 'context_lost' })
  }, [])

  const fallback = <Property3DFallback poster={poster} scheduleMessage={scheduleMessage} onShowPhotos={onShowPhotos} />

  return (
    <div
      className={cn(
        'relative isolate h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,#16406b_0%,#0b2a4a_45%,#071b2e_100%)] text-white select-none',
        !immersive && 'rounded-2xl',
      )}
    >
      {state.status === 'loading' && (
        <Property3DLoader
          poster={poster}
          ratio={state.progress?.ratio ?? null}
          loadedBytes={state.progress?.loadedBytes ?? 0}
          totalBytes={config.sizeBytes}
          stage={state.progress?.stage ?? 'starting'}
        />
      )}

      {state.status === 'error' && fallback}

      {state.status === 'ready' && (
        <Property3DErrorBoundary fallback={fallback}>
          <div className="absolute inset-0 overscroll-contain">
            <Property3DCanvas
              model={state.model}
              fit={state.fit}
              config={config}
              view={view}
              autoRotate={Boolean(config.autoRotate) && !interacted && view.kind === 'exterior'}
              reducedMotion={reducedMotion}
              activeHotspotId={activeHotspot?.id ?? null}
              onHotspotSelect={(hotspot) => {
                setInteracted(true)
                setActiveHotspot((current) => (current?.id === hotspot.id ? null : hotspot))
                track('model3d_hotspot_clicked', { id: hotspot.id, type: hotspot.type })
                if (hotspot.type === 'navigation' && hotspot.targetViewpointId)
                  changeView({ kind: 'viewpoint', id: hotspot.targetViewpointId })
              }}
              onUserInteract={onUserInteract}
              onContextLost={onContextLost}
              hotspotLayer={hotspotLayer}
            />
          </div>
          {/* Camada dos hotspots (fora do contêiner interno do Canvas). */}
          <div ref={hotspotLayer} className="pointer-events-none absolute inset-0 overflow-hidden" />

          {/* Dica inicial de gestos */}
          <div
            aria-hidden={interacted}
            className={cn(
              'pointer-events-none absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-[13px] font-semibold whitespace-nowrap text-navy-950 shadow-xl transition-opacity duration-500',
              interacted ? 'opacity-0' : 'opacity-100',
            )}
          >
            <Hand className="size-4" aria-hidden="true" />
            {coarsePointer ? 'Arraste para girar · pinça para aproximar' : 'Arraste para girar · role para aproximar'}
          </div>

          {/* Card do hotspot */}
          {activeHotspot && activeHotspot.type !== 'navigation' && (
            <div
              role="dialog"
              aria-labelledby="m3d-hs-title"
              className="absolute inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+128px)] z-20 animate-pop rounded-2xl border border-gold-400/40 bg-navy-950/92 p-4 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:top-20 sm:bottom-auto sm:left-5 sm:w-[320px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10.5px] font-semibold tracking-[0.18em] text-gold-400 uppercase">
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
                  className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/80">{activeHotspot.description}</p>
            </div>
          )}

          {/* Modos e pontos de vista */}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-navy-950/80 to-transparent px-3 pt-10 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Property3DToolbar config={config} view={view} onChange={changeView} />
          </div>
        </Property3DErrorBoundary>
      )}

      {/* Topo: fechar, título, tela cheia e CTA discreto */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center gap-2 bg-gradient-to-b from-navy-950/80 to-transparent px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-6 sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar modelo 3D"
          className="pointer-events-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-navy-950/60 backdrop-blur-md hover:bg-navy-950/85"
        >
          <X className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="hidden truncate text-[10.5px] font-semibold tracking-[0.2em] text-gold-400 uppercase sm:block">Modelo 3D interativo</p>
          <p className="truncate text-[10.5px] font-semibold tracking-[0.16em] text-gold-400 uppercase sm:hidden">Modelo 3D</p>
          <p className="truncate text-[14px] font-semibold">{title}</p>
        </div>
        {immersive && (
          <>
            <a
              href={whatsappLink(scheduleMessage)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('model3d_schedule_clicked', { placement: 'viewer_top' })}
              className="pointer-events-auto inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-gold-500 px-4 text-[13.5px] font-semibold text-navy-950"
            >
              <CalendarCheck className="size-4" aria-hidden="true" />
              <span className="sm:hidden">Agendar</span>
              <span className="hidden sm:inline">Agendar visita</span>
            </a>
            <a
              href={whatsappLink(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar no WhatsApp"
              onClick={() => track('model3d_whatsapp_clicked', { placement: 'viewer_top' })}
              className="pointer-events-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-navy-950/60 backdrop-blur-md hover:bg-navy-950/85"
            >
              <WhatsAppIcon className="size-5" />
            </a>
          </>
        )}
        {canToggleImmersive && (
          <button
            type="button"
            onClick={onToggleImmersive}
            aria-label={immersive ? 'Sair da tela cheia' : 'Tela cheia'}
            className="pointer-events-auto inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/20 bg-navy-950/60 px-3.5 text-[13.5px] font-semibold backdrop-blur-md hover:bg-navy-950/85"
          >
            {immersive ? <Minimize className="size-5" aria-hidden="true" /> : <Maximize className="size-5" aria-hidden="true" />}
            <span className="hidden sm:inline">{immersive ? 'Sair da tela cheia' : 'Tela cheia'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
