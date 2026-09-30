import type { ReactNode } from 'react'
import type { PropertyTour, TourHotspot, TourScene } from '@/types/tour'

/** Ponto na viewport do tour, em frações (0–1) da largura/altura. */
export interface ScreenPoint {
  x: number
  y: number
}

/**
 * Contrato comum dos renderizadores de tour.
 * A interface imersiva (barras, ambientes, planta, cards, analytics) não sabe
 * se a cena é uma panorâmica, uma foto 360° real ou um modelo 3D — ela só
 * conversa com o renderizador por estas props.
 */
export interface TourRendererProps {
  tour: PropertyTour
  scene: TourScene
  /** Ponto de onde partiu a última navegação (para a transição "avançar"). */
  transitionOrigin: ScreenPoint | null
  activeHotspotId: string | null
  /** Rótulos das cenas, para hotspots de navegação. */
  sceneLabels: Map<string, string>
  /** Movimento automático sutil até a primeira interação. */
  autoMotion: boolean
  onHotspotSelect: (hotspot: TourHotspot, at: ScreenPoint) => void
  /** Toque/clique simples no fundo (sem arrastar). */
  onBackgroundTap: () => void
  /** Qualquer interação direta com a visualização (arrastar, teclado). */
  onInteract: () => void
  /** Renderiza o card do hotspot ativo ancorado na posição atual na tela. */
  renderHotspotCard: (hotspot: TourHotspot, anchor: ScreenPoint) => ReactNode
}
