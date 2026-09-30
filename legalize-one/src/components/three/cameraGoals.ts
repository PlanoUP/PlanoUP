import { MathUtils, Vector3 } from 'three'
import type { Model3DBox, Model3DConfig } from '@/types/model3d'
import { fromNormalized, type ModelFit } from './prepareModel'

/** O que mostrar — a câmera é resolvida a partir do modelo e da tela. */
export type Model3DView =
  | { kind: 'overview' }
  | { kind: 'viewpoint'; id: string }
  | { kind: 'plan'; levelId: string }

export interface CameraGoal {
  position: Vector3
  target: Vector3
  /** Campo de visão vertical (graus). A planta usa um valor baixo para simular vista ortográfica. */
  fov: number
  /** Corte horizontal em metros (acima dele nada é desenhado). `null` = sem corte. */
  cutY: number | null
  /** Visão superior travada (planta). */
  topDown: boolean
}

/** Área útil da tela: descontamos a barra superior e a inferior para centralizar o imóvel no espaço livre. */
export interface Viewport {
  width: number
  height: number
  insetTop: number
  insetBottom: number
}

export const FOV = 40
/** Teleobjetiva na planta: quase sem perspectiva (paredes não "abrem"), sem trocar de câmera. */
export const PLAN_FOV = 16

const DEFAULT_PRESENTATION = { azimuth: 32, elevation: 24, fill: 0.86 }

/** Em telas estreitas (celular em pé) o campo horizontal é menor: afasta a câmera proporcionalmente. */
function portraitScale(aspect: number) {
  return aspect >= 1 ? 1 : 1 + (1 - aspect) * 1.4
}

function boxCorners(box: { min: Vector3; max: Vector3 }) {
  const corners: Vector3[] = []
  for (const x of [box.min.x, box.max.x])
    for (const y of [box.min.y, box.max.y])
      for (const z of [box.min.z, box.max.z]) corners.push(new Vector3(x, y, z))
  return corners
}

function resolveBox(box: Model3DBox | undefined, fit: ModelFit) {
  if (!box) {
    return {
      min: new Vector3(-fit.size.x / 2, 0, -fit.size.z / 2),
      max: new Vector3(fit.size.x / 2, fit.size.y, fit.size.z / 2),
    }
  }
  return { min: fromNormalized(box.min, fit), max: fromNormalized(box.max, fit) }
}

function usable(vp: Viewport) {
  const aspect = vp.width / Math.max(vp.height, 1)
  const freeRatio = Math.max(0.35, (vp.height - vp.insetTop - vp.insetBottom) / Math.max(vp.height, 1))
  // Deslocamento do centro da área livre em relação ao centro da tela (fração da meia-altura).
  const shift = (vp.insetTop - vp.insetBottom) / Math.max(vp.height, 1)
  return { aspect, freeRatio, shift }
}

/**
 * Enquadra uma caixa a partir de uma direção: projeta os 8 cantos no referencial
 * da câmera, recentraliza o alvo, calcula a menor distância que cabe na largura
 * e na altura livres (com `fill` de respiro) e centraliza na área sem controles.
 */
function frameBox(
  box: { min: Vector3; max: Vector3 },
  direction: Vector3,
  vp: Viewport,
  fov: number,
  fill: number,
) {
  const { aspect, freeRatio, shift } = usable(vp)
  const forward = direction.clone().negate().normalize()
  const worldUp = Math.abs(forward.y) > 0.999 ? new Vector3(0, 0, -1) : new Vector3(0, 1, 0)
  const right = new Vector3().crossVectors(forward, worldUp).normalize()
  const up = new Vector3().crossVectors(right, forward).normalize()
  const corners = boxCorners(box)
  const project = (t: Vector3) =>
    corners.map((p) => {
      const d = p.clone().sub(t)
      return { a: d.dot(right), b: d.dot(up), c: d.dot(forward) }
    })

  const center = box.min.clone().add(box.max).multiplyScalar(0.5)
  let pts = project(center)
  const mid = (vals: number[]) => (Math.min(...vals) + Math.max(...vals)) / 2
  const target = center
    .clone()
    .addScaledVector(right, mid(pts.map((p) => p.a)))
    .addScaledVector(up, mid(pts.map((p) => p.b)))
  pts = project(target)

  const tanV = Math.tan(MathUtils.degToRad(fov / 2))
  const tanH = tanV * aspect
  // Estimativa inicial (conservadora) da distância.
  let distance = Math.max(
    ...pts.map((p) => Math.max(Math.abs(p.a) / (tanH * fill), Math.abs(p.b) / (tanV * freeRatio * fill)) - p.c),
  )

  // Refinamento em perspectiva real: os cantos próximos da câmera "descem" na tela, então
  // recentraliza (no meio da área livre, entre as barras) e reajusta a distância algumas vezes.
  const freeCenterY = -shift // centro da área livre em coordenadas de tela (-1…1, para cima)
  for (let i = 0; i < 6; i++) {
    const eye = target.clone().addScaledVector(forward, -distance)
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
    for (const p of corners) {
      const d = p.clone().sub(eye)
      const depth = Math.max(d.dot(forward), distance * 0.05)
      const x = d.dot(right) / (depth * tanH)
      const y = d.dot(up) / (depth * tanV)
      xMin = Math.min(xMin, x); xMax = Math.max(xMax, x)
      yMin = Math.min(yMin, y); yMax = Math.max(yMax, y)
    }
    target
      .addScaledVector(right, ((xMin + xMax) / 2) * tanH * distance)
      .addScaledVector(up, ((yMin + yMax) / 2 - freeCenterY) * tanV * distance)
    distance *= Math.max((xMax - xMin) / 2 / fill, (yMax - yMin) / 2 / (freeRatio * fill))
  }
  return { position: target.clone().addScaledVector(forward, -distance), target }
}

/** Direção (do alvo para a câmera) a partir de azimute/elevação em graus. */
function directionFrom(azimuth: number, elevation: number) {
  const az = MathUtils.degToRad(azimuth)
  const el = MathUtils.degToRad(elevation)
  return new Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az))
}

export function resolveGoal(view: Model3DView, config: Model3DConfig, fit: ModelFit, vp: Viewport): CameraGoal {
  if (view.kind === 'plan') {
    const levels = config.planLevels ?? []
    const level = levels.find((l) => l.id === view.levelId) ?? levels[0]
    const focusY = (level?.focusHeight ?? 0) * fit.size.y
    const area = resolveBox(level?.focus ?? config.planFocus ?? config.presentation?.focus, fit)
    // Vista superior: só a projeção em planta (x/z) importa, na altura do piso escolhido.
    const flat = {
      min: new Vector3(area.min.x, focusY, area.min.z),
      max: new Vector3(area.max.x, focusY, area.max.z),
    }
    const framed = frameBox(flat, new Vector3(0, 1, 0.0005), vp, PLAN_FOV, 0.9)
    // Nunca abaixo do telhado.
    const minHeight = fit.size.y - focusY + fit.radius * 0.2
    if (framed.position.y - focusY < minHeight) framed.position.y = focusY + minHeight
    return {
      ...framed,
      fov: PLAN_FOV,
      cutY: level?.cutHeight !== undefined ? level.cutHeight * fit.size.y : null,
      topDown: true,
    }
  }

  if (view.kind === 'viewpoint') {
    const vpConfig = config.viewpoints?.find((v) => v.id === view.id)
    if (vpConfig) {
      const target = fromNormalized(vpConfig.target, fit)
      const raw = fromNormalized(vpConfig.cameraPosition, fit)
      const aspect = vp.width / Math.max(vp.height, 1)
      const position = target.clone().add(raw.sub(target).multiplyScalar(portraitScale(aspect)))
      return {
        position,
        target,
        fov: FOV,
        cutY: vpConfig.cutHeight !== undefined ? vpConfig.cutHeight * fit.size.y : null,
        topDown: false,
      }
    }
  }

  // Visão geral: composição arquitetônica configurada por imóvel.
  const p = { ...DEFAULT_PRESENTATION, ...config.presentation }
  const framed = frameBox(resolveBox(config.presentation?.focus, fit), directionFrom(p.azimuth, p.elevation), vp, FOV, p.fill)
  return { ...framed, fov: FOV, cutY: null, topDown: false }
}
