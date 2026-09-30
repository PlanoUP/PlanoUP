import type { SceneArtVariant } from './media'

/**
 * Tipos de tour suportados.
 * - `mock`: tour simulado renderizado pelo próprio componente (fase atual).
 * - `matterport` | `kuula` | `iframe`: provedores externos carregados por `tourUrl`.
 */
export type TourType = 'mock' | 'matterport' | 'kuula' | 'iframe'

export type HotspotKind = 'info' | 'navigation'

export interface TourHotspot {
  id: string
  kind: HotspotKind
  /** Posição horizontal na imagem panorâmica (0–100%). */
  x: number
  /** Posição vertical na imagem panorâmica (0–100%). */
  y: number
  title: string
  description: string
  /** Destaque curto exibido no card (ex.: "5,2 m de pé-direito"). */
  highlight?: string
  /** Para hotspots de navegação: cena de destino. */
  targetSceneId?: string
}

export interface FloorPlanRoom {
  id: string
  label: string
  /** Retângulo em coordenadas do viewBox da planta (0–100). */
  x: number
  y: number
  width: number
  height: number
}

export interface TourFloor {
  id: string
  label: string
  rooms: FloorPlanRoom[]
}

export interface TourScene {
  id: string
  label: string
  image: string
  fallback: SceneArtVariant
  floorId: string
  /** Cômodo correspondente na planta. */
  roomId: string
  /** Direção da câmera na planta, em graus (0 = para cima). */
  heading: number
  hotspots: TourHotspot[]
}

export interface PropertyTour {
  id: string
  tourType: TourType
  /** URL do provedor externo quando `tourType` não é `mock`. */
  tourUrl?: string
  title: string
  subtitle: string
  agent: {
    name: string
    initials: string
  }
  floors: TourFloor[]
  scenes: TourScene[]
}
