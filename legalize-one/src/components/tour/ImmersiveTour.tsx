import { ArrowRight, ChevronLeft, ChevronRight, Hand, Map as MapIcon, Maximize, Minimize, PartyPopper, X } from 'lucide-react'
import { Suspense, useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { useIsDesktop, useIsSmUp } from '@/hooks/useMediaQuery'
import { useModal } from '@/hooks/useModal'
import { track } from '@/lib/analytics'
import { whatsappLink } from '@/lib/whatsapp'
import type { PropertyTour, TourHotspot } from '@/types/tour'
import { cn } from '@/utils/cn'
import { FloorPlan } from './FloorPlan'
import { HotspotCard } from './HotspotCard'
import { EmbedRenderer, ModelRenderer, PanoramaRenderer, rendererKindOf, type ScreenPoint } from './renderers'
import { SceneThumbnails } from './SceneThumbnails'

export interface ImmersiveTourProps {
  tour: PropertyTour
  initialSceneId?: string
  onClose: () => void
  /** Link para a página do imóvel (quando o tour é aberto fora dela, ex.: Home). */
  propertyHref?: string
  /** Mensagem de WhatsApp oferecida ao concluir o tour. */
  contactMessage?: string
}

type SceneSource = 'hotspot' | 'thumbnail' | 'arrow' | 'floorplan'

const HIDE_AFTER_MS = 4000

/**
 * MODO IMERSIVO do tour. Ocupa a viewport inteira (dialog modal):
 * topo (fechar, imóvel, ambiente, tela cheia) · centro (renderizador) ·
 * base (ambientes, planta, navegação). Controles recolhem após alguns segundos
 * sem interação e voltam com qualquer toque, movimento ou tecla; o botão de
 * fechar nunca some.
 */
export default function ImmersiveTour({ tour, initialSceneId, onClose, propertyHref, contactMessage }: ImmersiveTourProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isSmUp = useIsSmUp()
  const isDesktop = useIsDesktop()
  const renderer = rendererKindOf(tour)
  const embedded = renderer === 'embed'

  const firstScene = tour.scenes.find((s) => s.id === initialSceneId) ?? tour.scenes[0]
  const [sceneId, setSceneId] = useState(firstScene.id)
  const scene = tour.scenes.find((s) => s.id === sceneId) ?? firstScene
  const sceneIndex = tour.scenes.indexOf(scene)
  const [floorId, setFloorId] = useState(scene.floorId)
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null)
  const [origin, setOrigin] = useState<ScreenPoint | null>(null)
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set([firstScene.id]))
  const [interacted, setInteracted] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [activity, setActivity] = useState(0)
  const [planSheetOpen, setPlanSheetOpen] = useState(false)
  const [planPanelOpen, setPlanPanelOpen] = useState(true)
  const [completion, setCompletion] = useState<'none' | 'shown' | 'dismissed'>('none')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const startedAt = useRef(0)
  const lastPoke = useRef(0)
  const sceneLabels = useMemo(() => new Map(tour.scenes.map((s) => [s.id, s.label])), [tour.scenes])
  const fullscreenSupported = typeof document !== 'undefined' && document.fullscreenEnabled

  // --- Abertura / fechamento -------------------------------------------------
  const onOpen = useEffectEvent(() => {
    startedAt.current = performance.now()
    track('tour_opened', { tour_id: tour.id, scene_id: firstScene.id })
  })
  const onDismount = useEffectEvent(() => {
    track('tour_closed', {
      tour_id: tour.id,
      scenes_visited: visited.size,
      duration_s: Math.round((performance.now() - startedAt.current) / 1000),
    })
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
  })
  useEffect(() => {
    onOpen()
    return () => onDismount()
  }, [])

  const handleEscape = useCallback(() => {
    if (activeHotspotId) setActiveHotspotId(null)
    else onClose()
  }, [activeHotspotId, onClose])
  useModal(rootRef, true, handleEscape, { initialFocus: closeRef })

  // --- Tela cheia (quando suportada) -----------------------------------------
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === rootRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined)
    } else if (rootRef.current?.requestFullscreen) {
      await rootRef.current
        .requestFullscreen()
        .then(() => track('tour_fullscreen_entered', { tour_id: tour.id }))
        .catch(() => undefined)
    }
  }

  // --- Controles que recolhem -------------------------------------------------
  const pinned = !interacted || Boolean(activeHotspotId) || planSheetOpen || completion === 'shown'
  useEffect(() => {
    if (pinned) return
    const timer = window.setTimeout(() => setControlsVisible(false), HIDE_AFTER_MS)
    return () => window.clearTimeout(timer)
  }, [pinned, activity])

  const poke = useCallback(() => {
    const now = performance.now()
    if (now - lastPoke.current < 400) return
    lastPoke.current = now
    setControlsVisible(true)
    setActivity((n) => n + 1)
  }, [])

  const markInteracted = useCallback(() => {
    setInteracted(true)
    poke()
  }, [poke])

  // --- Navegação entre ambientes ---------------------------------------------
  const goToScene = useCallback(
    (id: string, source: SceneSource, from: ScreenPoint | null = null) => {
      const next = tour.scenes.find((s) => s.id === id)
      if (!next || next.id === sceneId) return
      markInteracted()
      setOrigin(from)
      setSceneId(next.id)
      setFloorId(next.floorId)
      setActiveHotspotId(null)
      track('tour_scene_changed', { tour_id: tour.id, scene_id: next.id, source })
      setVisited((prev) => {
        if (prev.has(next.id)) return prev
        const updated = new Set(prev).add(next.id)
        if (updated.size === tour.scenes.length) {
          track('tour_completed', {
            tour_id: tour.id,
            scenes: updated.size,
            duration_s: Math.round((performance.now() - startedAt.current) / 1000),
          })
          setCompletion((c) => (c === 'none' ? 'shown' : c))
        }
        return updated
      })
    },
    [tour.id, tour.scenes, sceneId, markInteracted],
  )

  const step = (dir: 1 | -1) => {
    const count = tour.scenes.length
    goToScene(tour.scenes[(sceneIndex + dir + count) % count].id, 'arrow')
  }

  function selectHotspot(hotspot: TourHotspot, at: ScreenPoint) {
    markInteracted()
    track('tour_hotspot_clicked', { tour_id: tour.id, scene_id: scene.id, hotspot_id: hotspot.id, kind: hotspot.kind })
    if (hotspot.kind === 'navigation' && hotspot.targetSceneId) {
      goToScene(hotspot.targetSceneId, 'hotspot', at)
      return
    }
    setActiveHotspotId((current) => (current === hotspot.id ? null : hotspot.id))
  }

  function onBackgroundTap() {
    if (activeHotspotId) {
      setActiveHotspotId(null)
      return
    }
    setInteracted(true)
    // Toque simples alterna a interface, como em visualizadores de fotos.
    if (controlsVisible) setControlsVisible(false)
    else {
      lastPoke.current = 0
      poke()
    }
  }

  function openPlan() {
    poke()
    if (isDesktop) {
      setPlanPanelOpen((open) => {
        if (!open) track('tour_floorplan_opened', { tour_id: tour.id, surface: 'panel' })
        return !open
      })
    } else {
      setPlanSheetOpen(true)
      track('tour_floorplan_opened', { tour_id: tour.id, surface: 'sheet' })
    }
  }

  const getInsets = () => ({
    top: controlsVisible ? (topRef.current?.offsetHeight ?? 0) : 64,
    bottom: controlsVisible ? (bottomRef.current?.offsetHeight ?? 0) : 16,
  })

  const rendererProps = {
    tour,
    scene,
    transitionOrigin: origin,
    activeHotspotId,
    sceneLabels,
    autoMotion: !interacted,
    onHotspotSelect: selectHotspot,
    onBackgroundTap,
    onInteract: markInteracted,
    renderHotspotCard: (hotspot: TourHotspot, anchor: ScreenPoint) => (
      <HotspotCard
        hotspot={hotspot}
        anchor={anchor}
        docked={!isSmUp}
        getInsets={getInsets}
        onClose={() => setActiveHotspotId(null)}
      />
    ),
  }

  const chromeHidden = !controlsVisible
  const fadeChrome = cn('transition-all duration-300', chromeHidden && 'pointer-events-none opacity-0')

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Tour 3D — ${tour.title}`}
      onPointerMove={(e) => e.pointerType === 'mouse' && poke()}
      onPointerDown={(e) => e.pointerType !== 'mouse' && controlsVisible && poke()}
      onKeyDown={poke}
      onFocusCapture={poke}
      className="fixed inset-0 z-[100] h-dvh w-screen animate-fade-in overflow-hidden bg-navy-950 text-white"
    >
      {/* CENTRO — visualização */}
      {renderer === 'embed' && <EmbedRenderer tour={tour} />}
      {renderer === 'panorama' && <PanoramaRenderer {...rendererProps} />}
      {renderer === 'model' && (
        <Suspense fallback={<div className="absolute inset-0 bg-navy-950" />}>
          <ModelRenderer {...rendererProps} />
        </Suspense>
      )}

      <p className="sr-only" aria-live="polite">
        {`${scene.label} — ambiente ${sceneIndex + 1} de ${tour.scenes.length}`}
      </p>

      {/* TOPO */}
      <div
        ref={topRef}
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-navy-950/85 via-navy-950/40 to-transparent pt-[max(0.75rem,env(safe-area-inset-top))] pb-8 short:pb-5',
          fadeChrome,
        )}
      >
        <div className="flex items-center gap-3 pr-3 pl-[4.25rem] sm:pr-5 sm:pl-[4.75rem]">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-medium tracking-[0.02em] text-white/70">{tour.title}</p>
            <p key={scene.id} className="animate-fade-in truncate font-display text-[17px] leading-tight font-bold tracking-[-0.02em] sm:text-[19px]">
              {scene.label}
            </p>
          </div>
          <span className="pointer-events-auto shrink-0 rounded-full bg-white/12 px-2.5 py-1 text-[12px] font-semibold tabular-nums backdrop-blur-md">
            {sceneIndex + 1}/{tour.scenes.length}
          </span>
          {propertyHref && (
            <Link
              to={propertyHref}
              onClick={onClose}
              className="pointer-events-auto hidden h-10 items-center gap-1.5 rounded-full bg-white/12 px-4 text-[13px] font-semibold backdrop-blur-md hover:bg-white/20 sm:inline-flex"
            >
              Ver imóvel
              <ArrowRight className="size-4" />
            </Link>
          )}
          {fullscreenSupported && (
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              className="pointer-events-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/12 backdrop-blur-md hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Fechar — sempre visível (controle crítico) */}
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Fechar tour e voltar"
        className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 z-40 inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-navy-950/60 backdrop-blur-md transition-colors hover:bg-navy-950/85 sm:left-5"
      >
        <X className="size-5" />
      </button>

      {!embedded && (
        <>
          {/* Dica inicial */}
          <div
            className={cn(
              'pointer-events-none absolute top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-[13px] font-semibold text-navy-950 shadow-xl transition-all duration-500',
              interacted ? 'scale-95 opacity-0' : 'opacity-100',
            )}
            aria-hidden={interacted}
          >
            <Hand className="size-4" />
            Arraste para explorar
          </div>

          {/* Planta — painel no desktop */}
          {isDesktop && planPanelOpen && (
            <div
              className={cn(
                'absolute top-[88px] right-5 z-20 w-[232px] rounded-2xl border border-white/12 bg-navy-950/72 p-3 shadow-2xl backdrop-blur-xl',
                fadeChrome,
              )}
            >
              <FloorPlan
                floors={tour.floors}
                floorId={floorId}
                onFloorChange={setFloorId}
                scenes={tour.scenes}
                activeScene={scene}
                onSceneSelect={(id) => goToScene(id, 'floorplan')}
              />
            </div>
          )}

          {/* Tour concluído */}
          {completion === 'shown' && (
            <div
              role="status"
              className="absolute inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+176px)] z-30 mx-auto max-w-sm animate-pop rounded-2xl border border-gold-400/40 bg-navy-950/92 p-4 shadow-2xl backdrop-blur-xl lg:bottom-32 short:bottom-24"
            >
              <div className="flex items-start gap-3">
                <PartyPopper className="mt-0.5 size-5 shrink-0 text-gold-400" />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[15px] font-bold">Você conheceu todos os ambientes</p>
                  <p className="mt-0.5 text-[13px] text-white/70">Que tal ver pessoalmente?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {contactMessage && (
                      <a
                        href={whatsappLink(contactMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track('property_schedule_clicked', { tour_id: tour.id, placement: 'tour_completed' })}
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-gold-500 px-4 text-[13px] font-semibold text-navy-950"
                      >
                        <WhatsAppIcon className="size-4" />
                        Agendar visita
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setCompletion('dismissed')}
                      className="inline-flex h-10 items-center rounded-full px-4 text-[13px] font-semibold text-white/85 hover:bg-white/10"
                    >
                      Continuar explorando
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BASE — ambientes, planta e navegação */}
          <div
            ref={bottomRef}
            className={cn(
              'absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-navy-950/90 via-navy-950/55 to-transparent pt-10 pb-[max(0.75rem,env(safe-area-inset-bottom))] short:pt-6',
              fadeChrome,
            )}
          >
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2.5 px-3 sm:px-5 lg:flex-nowrap short:flex-nowrap">
              <div className="order-first w-full min-w-0 lg:order-none lg:w-auto lg:flex-1 short:order-none short:w-auto short:flex-1">
                <SceneThumbnails
                  scenes={tour.scenes}
                  activeId={scene.id}
                  visited={visited}
                  onSelect={(id) => goToScene(id, 'thumbnail')}
                  className="short:[&>button]:h-11 short:[&>button]:w-[72px]"
                />
              </div>
              <NavButton dir={-1} onClick={() => step(-1)} className="order-1 lg:order-first short:order-first" />
              <button
                type="button"
                onClick={openPlan}
                aria-expanded={isDesktop ? planPanelOpen : planSheetOpen}
                className={cn(
                  'order-2 inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-[14px] font-semibold backdrop-blur-md transition-colors lg:order-none short:order-none',
                  isDesktop && planPanelOpen
                    ? 'border-gold-400/60 bg-gold-500/20 text-gold-400'
                    : 'border-white/20 bg-white/10 hover:bg-white/20',
                )}
              >
                <MapIcon className="size-[18px]" />
                Planta
              </button>
              <NavButton dir={1} onClick={() => step(1)} className="order-3 lg:order-none short:order-none" />
            </div>
          </div>

          {/* Planta — bottom sheet no mobile/tablet */}
          <BottomSheet
            open={planSheetOpen}
            onClose={() => setPlanSheetOpen(false)}
            title="Planta do imóvel"
            description="Toque em um ambiente para ir até ele."
            tone="dark"
          >
            <FloorPlan
              size="sheet"
              floors={tour.floors}
              floorId={floorId}
              onFloorChange={setFloorId}
              scenes={tour.scenes}
              activeScene={scene}
              onSceneSelect={(id) => {
                goToScene(id, 'floorplan')
                setPlanSheetOpen(false)
              }}
            />
          </BottomSheet>
        </>
      )}
    </div>
  )
}

function NavButton({ dir, onClick, className }: { dir: 1 | -1; onClick: () => void; className?: string }) {
  const Icon = dir === 1 ? ChevronRight : ChevronLeft
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 1 ? 'Próximo ambiente' : 'Ambiente anterior'}
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-colors hover:bg-white/20',
        className,
      )}
    >
      <Icon className="size-5" />
    </button>
  )
}
