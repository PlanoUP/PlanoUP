import { Html } from '@react-three/drei'
import type { RefObject } from 'react'
import { ArrowUpRight, Car, Info, Sparkles, UtensilsCrossed, Waves } from 'lucide-react'
import type { Model3DHotspot, Model3DMode } from '@/types/model3d'
import type { Model3DView } from './cameraGoals'
import { cn } from '@/utils/cn'
import { fromModelSpace, type ModelFit } from './prepareModel'

const modeOf = (view: Model3DView): Model3DMode =>
  view.kind === 'plan' ? 'plan' : view.kind === 'viewpoint' ? 'tour' : 'exterior'

/** Regras de visibilidade: modo + pavimento (planta) + ponto de vista (visita). */
function isVisible(h: Model3DHotspot, view: Model3DView) {
  if (!h.visibleIn.includes(modeOf(view))) return false
  if (view.kind === 'plan' && h.planLevelId && h.planLevelId !== view.levelId) return false
  if (view.kind === 'viewpoint' && h.viewpointIds && !h.viewpointIds.includes(view.id)) return false
  return true
}

const icons = { sparkles: Sparkles, car: Car, utensils: UtensilsCrossed, waves: Waves, info: Info }

interface Property3DHotspotsProps {
  hotspots: Model3DHotspot[]
  fit: ModelFit
  view: Model3DView
  activeId: string | null
  onSelect: (hotspot: Model3DHotspot) => void
  /** Camada DOM própria para os marcadores (ciclo de vida controlado pelo viewer). */
  portal: RefObject<HTMLElement | null>
}

/**
 * Hotspots 3D: marcadores DOM ancorados em pontos reais do modelo.
 * Cada ponto declara em quais modos aparece — pontos internos só com o corte
 * da planta, para não "flutuarem" através das paredes.
 */
export function Property3DHotspots({ hotspots, fit, view, activeId, onSelect, portal }: Property3DHotspotsProps) {
  return (
    <>
      {hotspots
        .filter((h) => isVisible(h, view))
        .map((hotspot) => {
          const Icon = icons[hotspot.icon ?? (hotspot.type === 'feature' ? 'sparkles' : 'info')]
          const active = hotspot.id === activeId
          const feature = hotspot.type === 'feature'
          return (
            <Html
              key={hotspot.id}
              position={fromModelSpace(hotspot.position, fit)}
              center
              zIndexRange={[20, 10]}
              portal={portal as RefObject<HTMLElement>}
            >
              <button
                type="button"
                onClick={() => onSelect(hotspot)}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label={`${feature ? 'Destaque' : hotspot.type === 'navigation' ? 'Ir para' : 'Detalhe'}: ${hotspot.title}`}
                aria-pressed={active}
                className="group/hs pointer-events-auto flex min-h-11 items-center gap-2 outline-none select-none"
              >
                <span className="relative flex size-11 items-center justify-center">
                  <span
                    className={cn('absolute inset-1 rounded-full animate-pulse-ring', feature ? 'bg-gold-400/60' : 'bg-white/50')}
                  />
                  <span
                    className={cn(
                      'relative flex size-9 items-center justify-center rounded-full border-2 border-white shadow-[0_6px_18px_rgb(0_0_0/0.4)] transition-transform group-hover/hs:scale-110 group-focus-visible/hs:ring-2 group-focus-visible/hs:ring-gold-400',
                      feature ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950' : 'bg-navy-950/70 text-white',
                      active && 'scale-110',
                    )}
                  >
                    {hotspot.type === 'navigation' ? <ArrowUpRight className="size-4" /> : <Icon className="size-4" />}
                  </span>
                </span>
                <span
                  className={cn(
                    'hidden rounded-full bg-navy-950/70 px-3 py-1 text-[12px] font-semibold whitespace-nowrap text-white backdrop-blur-md sm:inline',
                    active && 'sm:hidden',
                  )}
                >
                  {hotspot.title}
                </span>
              </button>
            </Html>
          )
        })}
    </>
  )
}
