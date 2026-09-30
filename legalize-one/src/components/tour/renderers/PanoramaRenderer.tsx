import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import type { TourScene } from '@/types/tour'
import { cn } from '@/utils/cn'
import { TourHotspotMarker } from '../TourHotspotMarker'
import type { TourRendererProps } from './types'

/** Largura da panorâmica em relação à viewport (1.6 = 160%). */
const PANO_SCALE = 1.6
const PAN_RANGE = PANO_SCALE - 1
const LEAVE_MS = 450

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max)
const initialPanOf = (scene: TourScene) => scene.panorama?.initialPan ?? 0.5

interface Layer {
  scene: TourScene
  pan: number
  /** Cena saindo: anima em direção ao ponto de origem da navegação. */
  leaving?: { origin: string }
}

/**
 * Renderizador panorâmico (modo `tour-360`).
 * Hoje exibe fotos largas com arraste horizontal. Fotos 360° equiretangulares
 * (`projection: 'equirectangular'`) já são aceitas nos dados e usam este mesmo
 * renderizador como pré-visualização até a entrada de um renderizador WebGL
 * esférico com o mesmo contrato (`TourRendererProps`).
 */
export function PanoramaRenderer({
  tour,
  scene,
  transitionOrigin,
  activeHotspotId,
  sceneLabels,
  autoMotion,
  onHotspotSelect,
  onBackgroundTap,
  onInteract,
  renderHotspotCard,
}: TourRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const [pan, setPan] = useState(() => initialPanOf(scene))
  const [dragging, setDragging] = useState(false)
  const [hovering, setHovering] = useState(false)
  const dragRef = useRef<{ x: number; pan: number; moved: boolean } | null>(null)

  // Troca de cena: a cena anterior vira uma camada "saindo" e a nova entra na posição inicial.
  const [layers, setLayers] = useState<Layer[]>(() => [{ scene, pan: initialPanOf(scene) }])
  const current = layers[layers.length - 1]
  if (current.scene.id !== scene.id) {
    const origin = transitionOrigin
      ? `${(transitionOrigin.x * 100).toFixed(1)}% ${(transitionOrigin.y * 100).toFixed(1)}%`
      : '50% 50%'
    const nextPan = initialPanOf(scene)
    setLayers(
      reducedMotion
        ? [{ scene, pan: nextPan }]
        : [{ scene: current.scene, pan, leaving: { origin } }, { scene, pan: nextPan }],
    )
    setPan(nextPan)
  }

  const hasLeaving = layers.some((l) => l.leaving)
  useEffect(() => {
    if (!hasLeaving) return
    const timer = window.setTimeout(() => setLayers((ls) => ls.filter((l) => !l.leaving)), LEAVE_MS)
    return () => window.clearTimeout(timer)
  }, [hasLeaving])

  // Movimento automático suave até a primeira interação; pausa com o mouse sobre a cena.
  const phaseRef = useRef(0)
  useEffect(() => {
    if (!autoMotion || hovering || reducedMotion) return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      phaseRef.current += now - last
      last = now
      setPan(0.5 + Math.sin(phaseRef.current / 4200) * 0.2)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [autoMotion, hovering, reducedMotion])

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    dragRef.current = { x: e.clientX, pan, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    const width = containerRef.current?.clientWidth
    if (!drag || !width) return
    const delta = e.clientX - drag.x
    if (!drag.moved && Math.abs(delta) > 4) {
      drag.moved = true
      onInteract()
    }
    if (drag.moved) setPan(clamp(drag.pan - delta / (width * PAN_RANGE)))
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    dragRef.current = null
    setDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    if (drag && !drag.moved && e.type === 'pointerup') onBackgroundTap()
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      onInteract()
      setPan((p) => clamp(p + (e.key === 'ArrowLeft' ? -0.15 : 0.15)))
    }
  }

  /** Posição do hotspot na viewport, considerando o deslocamento atual. */
  const toScreen = (hx: number, hy: number) => ({ x: (hx / 100) * PANO_SCALE - pan * PAN_RANGE, y: hy / 100 })

  const activeHotspot = scene.hotspots.find((h) => h.id === activeHotspotId)

  return (
    <div
      ref={containerRef}
      role="application"
      aria-roledescription="Tour 3D"
      aria-label={`${tour.title} — ${scene.label}. Arraste ou use as setas do teclado para girar a visão.`}
      tabIndex={0}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        'absolute inset-0 touch-pan-y overflow-hidden bg-navy-950 outline-none select-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-inset',
        dragging ? 'cursor-grabbing' : 'cursor-grab',
      )}
    >
      {layers.map((layer) => {
        const isLeaving = Boolean(layer.leaving)
        const layerPan = isLeaving ? layer.pan : pan
        return (
          <div
            key={layer.scene.id + (isLeaving ? '-out' : '')}
            aria-hidden={isLeaving || undefined}
            className={cn(
              'absolute inset-0',
              isLeaving ? 'pointer-events-none z-10 animate-scene-out' : layers.length > 1 && 'animate-scene-in',
            )}
            style={isLeaving ? { transformOrigin: layer.leaving?.origin } : undefined}
          >
            <div
              className={cn(
                'absolute inset-y-0 left-0 will-change-transform',
                !dragging && !autoMotion && 'transition-transform duration-500 ease-out',
              )}
              style={{
                width: `${PANO_SCALE * 100}%`,
                transform: `translate3d(${-(layerPan * PAN_RANGE * 100) / PANO_SCALE}%, 0, 0)`,
              }}
            >
              <SmartImage
                src={layer.scene.panorama?.src ?? layer.scene.image}
                alt={layer.scene.label}
                fallback={layer.scene.fallback}
                loading="eager"
                draggable={false}
                className="absolute inset-0"
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(7_27_46/0.35))]" />
              {!isLeaving &&
                layer.scene.hotspots.map((hotspot) => (
                  <TourHotspotMarker
                    key={hotspot.id}
                    hotspot={hotspot}
                    active={hotspot.id === activeHotspotId}
                    targetLabel={hotspot.targetSceneId ? sceneLabels.get(hotspot.targetSceneId) : undefined}
                    onSelect={(h) => {
                      const at = toScreen(h.x, h.y)
                      // Traz hotspots informativos da borda para uma área confortável.
                      if (h.kind !== 'navigation' && (at.x < 0.18 || at.x > 0.82))
                        setPan(clamp(((h.x / 100) * PANO_SCALE - 0.5) / PAN_RANGE))
                      onHotspotSelect(h, at)
                    }}
                  />
                ))}
            </div>
          </div>
        )
      })}

      {activeHotspot && renderHotspotCard(activeHotspot, toScreen(activeHotspot.x, activeHotspot.y))}
    </div>
  )
}
