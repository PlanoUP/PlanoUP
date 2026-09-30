import { MathUtils, Vector3 } from 'three'
import type { Model3DConfig } from '@/types/model3d'
import { fromNormalized, type ModelFit } from './prepareModel'

/** O que mostrar — a câmera é resolvida a partir do modelo e da tela. */
export type Model3DView =
  | { kind: 'exterior' }
  | { kind: 'viewpoint'; id: string }
  | { kind: 'plan'; levelId: string }

export interface CameraGoal {
  position: Vector3
  target: Vector3
  /** Corte horizontal em metros (acima dele nada é desenhado). `null` = sem corte. */
  cutY: number | null
  /** Visão superior travada (planta). */
  topDown: boolean
}

export const FOV = 42
const DEFAULT_CAMERA: [number, number, number] = [1, 0.62, 0.62]
const DEFAULT_TARGET: [number, number, number] = [0, 0.3, 0]

/**
 * Em telas estreitas (celular em pé) o campo horizontal é menor: afasta a
 * câmera proporcionalmente para o imóvel continuar inteiro no quadro.
 */
function portraitScale(aspect: number) {
  return aspect >= 1 ? 1 : 1 + (1 - aspect) * 2.1
}

/**
 * Enquadra o bounding box inteiro mantendo a direção do olhar: projeta os 8 cantos
 * no referencial da câmera, recentraliza o alvo e calcula a menor distância que
 * cabe na horizontal e na vertical (vale para paisagem e retrato).
 */
function fitToView(position: Vector3, target: Vector3, fit: ModelFit, aspect: number) {
  const forward = target.clone().sub(position).normalize()
  const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize()
  const up = new Vector3().crossVectors(right, forward).normalize()
  const hx = fit.size.x / 2
  const hz = fit.size.z / 2
  const corners: Vector3[] = []
  for (const x of [-hx, hx]) for (const y of [0, fit.size.y]) for (const z of [-hz, hz]) corners.push(new Vector3(x, y, z))

  const project = (t: Vector3) =>
    corners.map((p) => {
      const d = p.clone().sub(t)
      return { a: d.dot(right), b: d.dot(up), c: d.dot(forward) }
    })
  // Recentraliza o alvo no meio da projeção.
  let pts = project(target)
  const mid = (vals: number[]) => (Math.min(...vals) + Math.max(...vals)) / 2
  const centered = target.clone().addScaledVector(right, mid(pts.map((p) => p.a))).addScaledVector(up, mid(pts.map((p) => p.b)))
  pts = project(centered)

  const tanV = Math.tan(MathUtils.degToRad(FOV / 2))
  const tanH = tanV * aspect
  const distance = Math.max(...pts.map((p) => Math.max(Math.abs(p.a) / tanH, Math.abs(p.b) / tanV) - p.c)) * 1.06
  return { position: centered.clone().addScaledVector(forward, -distance), target: centered }
}

export function resolveGoal(view: Model3DView, config: Model3DConfig, fit: ModelFit, aspect: number): CameraGoal {
  if (view.kind === 'plan') {
    const levels = config.planLevels ?? []
    const level = levels.find((l) => l.id === view.levelId) ?? levels[0]
    const focusY = (level?.focusHeight ?? 0) * fit.size.y
    const half = Math.tan(MathUtils.degToRad(FOV / 2))
    // Altura para enquadrar o terreno inteiro, considerando largura e profundidade da tela.
    const distance = Math.max(fit.size.z / 2 / half, fit.size.x / 2 / (half * Math.max(aspect, 0.1))) * 1.08
    return {
      position: new Vector3(0, focusY + distance, 0.001),
      target: new Vector3(0, focusY, 0),
      cutY: level ? level.cutHeight * fit.size.y : fit.size.y * 0.45,
      topDown: true,
    }
  }

  const vp = view.kind === 'viewpoint' ? config.viewpoints?.find((v) => v.id === view.id) : undefined
  const target = fromNormalized(vp?.target ?? config.target ?? DEFAULT_TARGET, fit)
  const raw = fromNormalized(vp?.position ?? config.initialCamera ?? DEFAULT_CAMERA, fit)
  // Exterior e pontos "fitAll": enquadramento automático do imóvel inteiro.
  if (view.kind === 'exterior' || vp?.fitAll) {
    const framed = fitToView(raw, target, fit, aspect)
    return { ...framed, cutY: vp?.cutHeight !== undefined ? vp.cutHeight * fit.size.y : null, topDown: false }
  }
  const position = target.clone().add(raw.sub(target).multiplyScalar(portraitScale(aspect)))
  return {
    position,
    target,
    cutY: vp?.cutHeight !== undefined ? vp.cutHeight * fit.size.y : null,
    topDown: false,
  }
}
