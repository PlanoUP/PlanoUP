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

/** Modos do visualizador: visão geral (apresentação) · planta · ambientes. */
export type Model3DMode = 'overview' | 'plan' | 'rooms'

/** Caixa em coordenadas normalizadas (ex.: o volume da residência dentro do terreno). */
export interface Model3DBox {
  min: Vec3
  max: Vec3
}

/**
 * Composição da primeira visão (e do "Redefinir visão"): a câmera enquadra
 * automaticamente `focus` a partir de uma direção 3/4 levemente elevada.
 */
export interface Model3DPresentation {
  /** Volume que deve ocupar a tela (normalmente a casa, sem o terreno inteiro). */
  focus: Model3DBox
  /** Direção horizontal da câmera, em graus (0° = eixo +x; 90° = eixo +z). */
  azimuth: number
  /** Inclinação acima do horizonte, em graus. */
  elevation: number
  /** Quanto do espaço livre da tela o volume ocupa (0–1). Padrão 0.86. */
  fill?: number
}

export interface Model3DViewpoint {
  id: string
  label: string
  /** Frase curta exibida na lista de ambientes. */
  description?: string
  /** Ícone na lista de ambientes. */
  icon?: 'facade' | 'living' | 'kitchen' | 'outdoor'
  /** Posição da câmera (coordenadas normalizadas). */
  cameraPosition: Vec3
  /** Ponto observado (coordenadas normalizadas). */
  target: Vec3
  /**
   * Corte horizontal (0–1 da altura): esconde tudo acima, revelando o interior
   * no estilo "casa de bonecas". Omitido = sem corte.
   */
  cutHeight?: number
}

export interface Model3DPlanLevel {
  id: string
  label: string
  /** Altura do corte da planta (0–1 da altura do modelo). Omitido = vista superior sem corte. */
  cutHeight?: number
  /** Altura do olhar (0–1), normalmente o piso do pavimento. */
  focusHeight: number
  /** Área enquadrada neste nível (padrão: `planFocus`). Ex.: o terreno inteiro na vista sem corte. */
  focus?: Model3DBox
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
  /** Em ambientes, mostra apenas neste viewpoint (omitido = todos). */
  viewpointIds?: string[]
  /** Hotspot de navegação: viewpoint de destino. */
  targetViewpointId?: string
}

export interface Model3DConfig {
  /** Tamanho do arquivo em bytes — usado no progresso quando o servidor não informa. */
  sizeBytes?: number
  /** Primeira visão / "Redefinir visão". Sem ela, enquadra o modelo inteiro. */
  presentation?: Model3DPresentation
  /** Área centralizada na planta (padrão: `presentation.focus`). */
  planFocus?: Model3DBox
  /** Zoom mínimo, em múltiplos do raio do modelo (evita atravessar paredes). */
  minDistance?: number
  /** Zoom máximo, em múltiplos da distância da visão geral. */
  maxDistance?: number
  planLevels?: Model3DPlanLevel[]
  /** Pontos de vista da lista "Explore os ambientes" (a visão geral entra automaticamente). */
  viewpoints?: Model3DViewpoint[]
  hotspots?: Model3DHotspot[]
}
