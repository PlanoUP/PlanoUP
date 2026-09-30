import { ChevronLeft, ChevronRight, Hand, Map as MapIcon, Maximize, Minimize } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'
import { useFullscreen } from '@/hooks/useFullscreen'
import { track } from '@/lib/analytics'
import type { PropertyTour, TourHotspot } from '@/types/tour'
import { cn } from '@/utils/cn'
import { ExternalTourFrame } from './ExternalTourFrame'
import { FloorPlanMini } from './FloorPlanMini'
import { HotspotCard } from './HotspotCard'
import { SceneThumbnails } from './SceneThumbnails'
import { TourHotspotMarker } from './TourHotspotMarker'

/** Largura da panorâmica em relação à viewport (1.6 = 160%). */
const PANO_SCALE = 1.6
const PAN_RANGE = PANO_SCALE - 1

interface Tour3DPreviewProps {
  tour: PropertyTour
  initialSceneId?: string
  className?: string
  /** Movimento automático sutil até a primeira interação. */
  autoPan?: boolean
}

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max)

/**
 * Tour 3D.
 * - `tourType: 'mock'` → viewer simulado (panorâmica arrastável, hotspots, planta, miniaturas).
 * - Demais tipos com `tourUrl` → iframe do provedor, mantendo moldura e tela cheia.
 */
export function Tour3DPreview({ tour, initialSceneId, className, autoPan = true }: Tour3DPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isFullscreen, pseudo, toggle: toggleFullscreen } = useFullscreen(containerRef)

  const isExternal = tour.tourType !== 'mock' && Boolean(tour.tourUrl)

  const [sceneId, setSceneId] = useState(initialSceneId ?? tour.scenes[0]?.id)
  const scene = tour.scenes.find((s) => s.id === sceneId) ?? tour.scenes[0]
  const sceneIndex = tour.scenes.indexOf(scene)
  const [floorId, setFloorId] = useState(scene?.floorId ?? tour.floors[0]?.id)

  const [pan, setPan] = useState(0.5)
  const [dragging, setDragging] = useState(false)
  const [interacted, setInteracted] = useState(false)
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null)
  const [planOpen, setPlanOpen] = useState(false)
  const dragRef = useRef<{ x: number; pan: number; moved: boolean } | null>(null)

  const sceneLabels = useMemo(() => new Map(tour.scenes.map((s) => [s.id, s.label])), [tour.scenes])

  const markInteracted = useCallback(() => {
    setInteracted((was) => {
      if (!was) track('tour_opened', { tour_id: tour.id })
      return true
    })
  }, [tour.id])

  const goToScene = useCallback(
    (id: string) => {
      const next = tour.scenes.find((s) => s.id === id)
      if (!next) return
      markInteracted()
      setSceneId(next.id)
      setFloorId(next.floorId)
      setActiveHotspotId(null)
      setPan(0.5)
      track('tour_scene_changed', { tour_id: tour.id, scene_id: next.id })
    },
    [tour.id, tour.scenes, markInteracted],
  )

  const step = useCallback(
    (dir: 1 | -1) => {
      const count = tour.scenes.length
      goToScene(tour.scenes[(sceneIndex + dir + count) % count].id)
    },
    [goToScene, sceneIndex, tour.scenes],
  )

  // Movimento automático suave: pausa com o ponteiro sobre o tour e desliga na
  // primeira interação (ou com "reduzir movimento").
  const [hovering, setHovering] = useState(false)
  const phaseRef = useRef(0)
  useEffect(() => {
    if (!autoPan || interacted || hovering || isExternal) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      phaseRef.current += now - last
      last = now
      setPan(0.5 + Math.sin(phaseRef.current / 4200) * 0.22)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [autoPan, interacted, hovering, isExternal])

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    markInteracted()
    dragRef.current = { x: e.clientX, pan, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    const width = containerRef.current?.clientWidth
    if (!drag || !width) return
    const delta = e.clientX - drag.x
    if (Math.abs(delta) > 3) drag.moved = true
    setPan(clamp(drag.pan - delta / (width * PAN_RANGE)))
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    dragRef.current = null
    setDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    // Clique simples no fundo fecha o card aberto.
    if (drag && !drag.moved) setActiveHotspotId(null)
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      markInteracted()
      setPan((p) => clamp(p - 0.15))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      markInteracted()
      setPan((p) => clamp(p + 0.15))
    } else if (e.key === 'Escape') {
      setActiveHotspotId(null)
    }
  }

  function selectHotspot(hotspot: TourHotspot) {
    markInteracted()
    if (hotspot.kind === 'navigation' && hotspot.targetSceneId) {
      goToScene(hotspot.targetSceneId)
      return
    }
    setActiveHotspotId((current) => (current === hotspot.id ? null : hotspot.id))
    // Traz o hotspot para uma área confortável da tela.
    const screenX = (hotspot.x / 100) * PANO_SCALE - pan * PAN_RANGE
    if (screenX < 0.18 || screenX > 0.82) setPan(clamp(((hotspot.x / 100) * PANO_SCALE - 0.5) / PAN_RANGE))
    track('tour_hotspot_clicked', { tour_id: tour.id, scene_id: scene.id, hotspot_id: hotspot.id })
  }

  const activeHotspot = scene?.hotspots.find((h) => h.id === activeHotspotId)

  if (!scene) return null

  return (
    <div
      ref={containerRef}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      className={cn(
        'relative isolate overflow-hidden bg-navy-950 text-white select-none',
        pseudo && 'fixed! inset-0 z-[100] h-dvh! w-screen rounded-none!',
        isFullscreen && !pseudo && 'h-screen!',
        className,
      )}
    >
      {isExternal ? (
        <ExternalTourFrame tour={tour} className="absolute inset-0 h-full w-full border-0" />
      ) : (
        <>
          {/* Panorâmica arrastável */}
          <div
            role="application"
            aria-roledescription="Tour 3D"
            aria-label={`${tour.title} — ${scene.label}. Use as setas do teclado para girar a visão.`}
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
            className={cn('absolute inset-0 touch-pan-y outline-none', dragging ? 'cursor-grabbing' : 'cursor-grab')}
          >
            <div
              key={scene.id}
              className={cn(
                'absolute inset-y-0 left-0 animate-tour-enter will-change-transform',
                !dragging && interacted && 'transition-transform duration-500 ease-out',
              )}
              style={{
                width: `${PANO_SCALE * 100}%`,
                transform: `translate3d(${-(pan * PAN_RANGE * 100) / PANO_SCALE}%, 0, 0)`,
              }}
            >
              <SmartImage
                src={scene.image}
                alt={scene.label}
                fallback={scene.fallback}
                loading="eager"
                draggable={false}
                className="absolute inset-0"
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(7_27_46/0.35))]" />
              {scene.hotspots.map((hotspot) => (
                <TourHotspotMarker
                  key={hotspot.id}
                  hotspot={hotspot}
                  active={hotspot.id === activeHotspotId}
                  targetLabel={hotspot.targetSceneId ? sceneLabels.get(hotspot.targetSceneId) : undefined}
                  onSelect={selectHotspot}
                />
              ))}
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            {`Ambiente ${sceneIndex + 1} de ${tour.scenes.length}: ${scene.label}`}
          </p>

          {/* Gradientes para legibilidade dos controles */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-navy-950/60 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-navy-950/85 to-transparent" />

          {/* Imóvel / corretor */}
          <div className="absolute top-3 left-3 z-20 flex max-w-[calc(100%-7rem)] items-center gap-2.5 rounded-xl border border-white/15 bg-navy-950/60 py-2 pr-4 pl-2 backdrop-blur-md sm:top-4 sm:left-4">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 font-display text-[13px] font-bold text-navy-950 ring-2 ring-white/70"
            >
              {tour.agent.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">{tour.title}</p>
              <p className="truncate text-[11px] text-white/70">{tour.subtitle}</p>
            </div>
          </div>

          {/* Planta: sempre visível a partir de sm; alternável no mobile */}
          <button
            type="button"
            onClick={() => setPlanOpen((v) => !v)}
            aria-expanded={planOpen}
            aria-label={planOpen ? 'Ocultar planta' : 'Mostrar planta'}
            className="absolute top-3 right-3 z-20 inline-flex size-10 items-center justify-center rounded-xl border border-white/15 bg-navy-950/60 backdrop-blur-md sm:hidden"
          >
            <MapIcon className="size-[18px]" />
          </button>
          <FloorPlanMini
            floors={tour.floors}
            floorId={floorId}
            onFloorChange={setFloorId}
            scenes={tour.scenes}
            activeScene={scene}
            onSceneSelect={goToScene}
            className={cn(
              'absolute top-15 right-3 z-20 w-[150px] sm:top-4 sm:right-4 sm:block sm:w-[168px] lg:w-[180px]',
              planOpen ? 'block animate-pop' : 'hidden',
            )}
          />

          {/* Setas de navegação entre ambientes */}
          {[
            { dir: -1 as const, icon: ChevronLeft, label: 'Ambiente anterior', pos: 'left-3 sm:left-4' },
            { dir: 1 as const, icon: ChevronRight, label: 'Próximo ambiente', pos: 'right-3 sm:right-4' },
          ].map(({ dir, icon: Icon, label, pos }) => (
            <button
              key={label}
              type="button"
              onClick={() => step(dir)}
              aria-label={label}
              className={cn(
                'absolute top-1/2 z-20 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-navy-950/55 backdrop-blur-md transition-all hover:scale-105 hover:bg-navy-950/80 sm:size-11',
                pos,
              )}
            >
              <Icon className="size-5" />
            </button>
          ))}

          {/* Dica de interação */}
          <div
            className={cn(
              'pointer-events-none absolute bottom-[96px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-[11.5px] font-semibold text-navy-950 shadow-lg transition-all duration-500 sm:bottom-[104px]',
              interacted ? 'translate-y-2 opacity-0' : 'opacity-100',
            )}
          >
            <Hand className="size-3.5" />
            Arraste para explorar<span className="hidden sm:inline"> · toque nos pontos</span>
          </div>

          {activeHotspot && (
            <HotspotCard
              hotspot={activeHotspot}
              screenX={(activeHotspot.x / 100) * PANO_SCALE - pan * PAN_RANGE}
              screenY={activeHotspot.y / 100}
              onClose={() => setActiveHotspotId(null)}
            />
          )}

          {/* Miniaturas + tela cheia */}
          <div className="absolute inset-x-3 bottom-3 z-20 flex items-end gap-2 sm:inset-x-4 sm:bottom-4 sm:gap-3">
            <div className="min-w-0 flex-1">
              <SceneThumbnails scenes={tour.scenes} activeId={scene.id} onSelect={goToScene} />
            </div>
            <FullscreenButton isFullscreen={isFullscreen} onClick={toggleFullscreen} />
          </div>
        </>
      )}

      {isExternal && (
        <div className="absolute right-3 bottom-3 z-20">
          <FullscreenButton isFullscreen={isFullscreen} onClick={toggleFullscreen} />
        </div>
      )}
    </div>
  )
}

function FullscreenButton({ isFullscreen, onClick }: { isFullscreen: boolean; onClick: () => void }) {
  const Icon = isFullscreen ? Minimize : Maximize
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
      className="inline-flex size-[58px] shrink-0 items-center justify-center rounded-lg border border-white/20 bg-navy-950/60 backdrop-blur-md transition-colors hover:bg-navy-950/85 sm:size-[64px]"
    >
      <Icon className="size-5" />
    </button>
  )
}
