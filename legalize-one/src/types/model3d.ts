/**
 * MODELO 3D (GLB/GLTF) — configuração por imóvel.
 *
 * Sistema de coordenadas "normalizado" (independente de escala/origem do arquivo):
 * após o carregamento o modelo é centralizado pelo bounding box (centro em x/z, chão em y=0).
 * Uma coordenada normalizada [nx, ny, nz] vira, em metros:
 *   x = nx · largura,  y = ny · altura,  z = nz · profundidade   (a partir do centro da base)
 * Ex.: [0, 0.5, 0] = centro do volume; [0, 0.3, 0.9] = à frente do imóvel, a 30% da altura.
 * Assim os presets continuam válidos mesmo que o arquivo seja reexportado com outra escala/origem.
 */

export type Vec3 = [x: number, y: number, z: number]

export type Model3DMode = 'exterior' | 'plan' | 'tour'

export interface Model3DViewpoint {
  id: string
  label: string
  /** Posição da câmera (coordenadas normalizadas). */
  position: Vec3
  /** Ponto observado (coordenadas normalizadas). */
  target: Vec3
  /**
   * Corte horizontal (0–1 da altura): esconde tudo acima, revelando o interior
   * no estilo "casa de bonecas". Omitido = sem corte.
   */
  cutHeight?: number
  /**
   * Enquadramento automático: mantém a direção do olhar, mas recalcula alvo e
   * distância para o imóvel inteiro caber na tela (qualquer proporção de tela).
   */
  fitAll?: boolean
}

export interface Model3DPlanLevel {
  id: string
  label: string
  /** Altura do corte da planta (0–1 da altura do modelo). */
  cutHeight: number
  /** Altura do olhar (0–1), normalmente o piso do pavimento. */
  focusHeight: number
}

export type Model3DHotspotType = 'feature' | 'navigation' | 'info'

export interface Model3DHotspot {
  id: string
  type: Model3DHotspotType
  /**
   * Posição em coordenadas ORIGINAIS do arquivo (espaço do GLB), obtidas da própria
   * geometria — convertidas automaticamente para a cena centralizada.
   */
  position: Vec3
  title: string
  description: string
  icon?: 'sparkles' | 'car' | 'utensils' | 'waves' | 'info'
  /** Em quais modos o ponto aparece (pontos internos só fazem sentido com corte). */
  visibleIn: Model3DMode[]
  /** Na planta, mostra apenas neste pavimento (ponto abaixo do corte). */
  planLevelId?: string
  /** No modo visita, mostra apenas neste viewpoint (omitido = todos). */
  viewpointIds?: string[]
  /** Hotspot de navegação: viewpoint de destino. */
  targetViewpointId?: string
}

export interface Model3DConfig {
  /** Posição inicial da câmera (normalizada). */
  initialCamera?: Vec3
  /** Alvo inicial (normalizado). */
  target?: Vec3
  /** Distâncias mínima/máxima do zoom, em múltiplos do raio do modelo. */
  minDistance?: number
  maxDistance?: number
  autoRotate?: boolean
  /** Tamanho do arquivo em bytes — usado no progresso quando o servidor não informa. */
  sizeBytes?: number
  planLevels?: Model3DPlanLevel[]
  viewpoints?: Model3DViewpoint[]
  hotspots?: Model3DHotspot[]
}
