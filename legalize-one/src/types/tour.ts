import type { SceneArtVariant } from './media'

/**
 * TOUR 3D — modelo de dados independente de tecnologia de visualização.
 *
 * Dois modos de experiência:
 * - `tour-360`: sequência de cenas panorâmicas (fotos 360° reais ou panorâmicas planas);
 * - `model-3d`: modelo tridimensional navegável (GLB/GLTF via Three.js/React Three Fiber,
 *   ou Matterport), onde cada "cena" é um ponto de vista da câmera.
 *
 * A interface do tour (entrada, modo imersivo, ambientes, planta, hotspots, analytics)
 * trabalha só com `scenes`/`floors`/`hotspots`; o renderizador é escolhido por `tourType`
 * (ver components/tour/renderers).
 */

export type TourMode = 'tour-360' | 'model-3d'

/**
 * Provedor/tecnologia do tour.
 * - `mock`: panorâmica plana simulada (fase atual, fotos comuns).
 * - `panorama`: fotos 360° equiretangulares próprias (renderizador WebGL futuro).
 * - `matterport` | `kuula` | `iframe`: provedores externos via `tourUrl`.
 * - `model`: modelo GLB/GLTF próprio (`model`).
 */
export type TourType = 'mock' | 'panorama' | 'matterport' | 'kuula' | 'iframe' | 'model'

/**
 * - `navigation`: leva a outro ambiente;
 * - `info`: detalhe técnico/informativo;
 * - `feature`: destaque comercial do imóvel (quartzo, vista, varanda gourmet...).
 */
export type HotspotKind = 'navigation' | 'info' | 'feature'

export type Vec3 = [x: number, y: number, z: number]

export interface TourHotspot {
  id: string
  kind: HotspotKind
  /** Posição na imagem panorâmica plana (0–100%). Usada pelo renderizador atual. */
  x: number
  y: number
  /** Fotos 360° reais: ângulos em graus (yaw −180…180, pitch −90…90). */
  spherical?: { yaw: number; pitch: number }
  /** Modelo 3D: ponto no espaço do modelo. */
  point?: Vec3
  title: string
  description: string
  /** Destaque curto exibido no card (ex.: "5,40 m de pé-direito"). */
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

/** Mídia panorâmica da cena (modo `tour-360`). */
export interface ScenePanorama {
  /** Padrão: `image` da cena. */
  src?: string
  /** `flat`: foto larga comum. `equirectangular`: foto 360° 2:1. */
  projection: 'flat' | 'equirectangular'
  /** Posição horizontal inicial (0 = esquerda, 1 = direita). Padrão 0.5. */
  initialPan?: number
}

/** Ponto de vista da câmera (modo `model-3d`). */
export interface SceneViewpoint {
  position: Vec3
  target: Vec3
}

export interface TourScene {
  id: string
  label: string
  /** Imagem de prévia (miniaturas, capa da entrada, fallback). Obrigatória em qualquer modo. */
  image: string
  fallback: SceneArtVariant
  floorId: string
  /** Cômodo correspondente na planta. */
  roomId: string
  /** Direção da câmera na planta, em graus (0 = para cima). */
  heading: number
  panorama?: ScenePanorama
  viewpoint?: SceneViewpoint
  hotspots: TourHotspot[]
}

export interface TourModelAsset {
  format: 'glb' | 'gltf'
  url: string
  /** Imagem exibida enquanto o modelo carrega. */
  poster?: string
  /** Escala/unidade do arquivo, para medidas reais. */
  unitsPerMeter?: number
}

export interface PropertyTour {
  id: string
  tourType: TourType
  /** URL do provedor externo (`matterport`, `kuula`, `iframe`). */
  tourUrl?: string
  /** Arquivo do modelo quando `tourType` é `model`. */
  model?: TourModelAsset
  title: string
  subtitle: string
  agent: {
    name: string
    initials: string
  }
  floors: TourFloor[]
  scenes: TourScene[]
}

export function tourModeOf(tour: Pick<PropertyTour, 'tourType'>): TourMode {
  return tour.tourType === 'model' || tour.tourType === 'matterport' ? 'model-3d' : 'tour-360'
}

/** Tours de provedores externos são exibidos em iframe e têm interface própria. */
export function isEmbeddedTour(tour: Pick<PropertyTour, 'tourType' | 'tourUrl'>): boolean {
  return (tour.tourType === 'matterport' || tour.tourType === 'kuula' || tour.tourType === 'iframe') && Boolean(tour.tourUrl)
}
