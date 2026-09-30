import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { MathUtils, PerspectiveCamera, Plane, Spherical, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Model3DConfig } from '@/types/model3d'
import { resolveGoal, type CameraGoal, type Model3DView, type Viewport } from './cameraGoals'
import type { ModelFit } from './prepareModel'

interface Property3DControlsProps {
  fit: ModelFit
  config: Model3DConfig
  /** Cada pedido de câmera é um novo objeto (mesmo destino = anima de novo, ex.: "Redefinir visão"). */
  view: Model3DView
  /** Espaço ocupado pelas barras do visualizador (px), para centralizar o imóvel na área livre. */
  insets: { top: number; bottom: number }
  /** Enquanto falso, a entrada fica parada na pose inicial (o loader ainda cobre a cena). */
  sceneReady: boolean
  reducedMotion: boolean
  onUserInteract: () => void
  onInteractionChange: (active: boolean) => void
}

const MIN_POLAR = MathUtils.degToRad(10)
/** Nunca abaixo do horizonte: o usuário não entra por baixo do terreno. */
const MAX_POLAR = MathUtils.degToRad(80)
const TRANSITION_MS = 850
const INTRO_MS = 1300

interface Pose {
  position: Vector3
  target: Vector3
  fov: number
}

interface Transition {
  from: Pose
  to: CameraGoal
  /** `null` = aguardando o primeiro quadro (a compilação inicial não "come" a animação). */
  start: number | null
  duration: number
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Menor caminho entre dois ângulos (evita dar a volta completa no modelo). */
function lerpAngle(a: number, b: number, t: number) {
  let d = (b - a) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}

/**
 * OrbitControls + câmera animada entre composições.
 * Desktop: arrastar gira, scroll aproxima, botão direito move.
 * Toque: um dedo gira, pinça aproxima, dois dedos movem.
 *
 * Transições: interpolação esférica em torno do alvo (a câmera "orbita" até o
 * destino em vez de atravessar o modelo), duração fixa e easing suave. Qualquer
 * gesto do usuário interrompe a animação — sem disputa com o OrbitControls.
 */
export function Property3DControls({
  fit,
  config,
  view,
  insets,
  sceneReady,
  reducedMotion,
  onUserInteract,
  onInteractionChange,
}: Property3DControlsProps) {
  const controls = useRef<OrbitControlsImpl>(null)
  const { camera, gl, invalidate, size } = useThree()
  const transition = useRef<Transition | null>(null)
  const firstGoal = useRef(true)

  // Tamanho arredondado: evita recalcular o destino a cada pixel de redimensionamento.
  const vp: Viewport = useMemo(
    () => ({
      width: Math.round(size.width / 8) * 8,
      height: Math.round(size.height / 8) * 8,
      insetTop: insets.top,
      insetBottom: insets.bottom,
    }),
    [size.width, size.height, insets.top, insets.bottom],
  )
  const goal = useMemo(() => resolveGoal(view, config, fit, vp), [view, config, fit, vp])
  const home = useMemo(() => resolveGoal({ kind: 'overview' }, config, fit, vp), [config, fit, vp])
  const homeDistance = home.position.distanceTo(home.target)

  const minDistance = (config.minDistance ?? 0.2) * fit.radius
  // Afastar no máximo ~1.8× a visão geral (a casa nunca "some"), sempre comportando o destino atual.
  const maxDistance = Math.max(homeDistance * (config.maxDistance ?? 1.8), goal.position.distanceTo(goal.target) * 1.15)

  useEffect(() => {
    camera.near = Math.max(fit.radius / 300, 0.03)
    camera.far = fit.radius * 40
    camera.updateProjectionMatrix()
  }, [camera, fit.radius])

  function setFov(fov: number) {
    const cam = camera as PerspectiveCamera
    if (Math.abs(cam.fov - fov) > 0.001) {
      cam.fov = fov
      cam.updateProjectionMatrix()
    }
  }

  /** Limites no destino: planta travada de cima (sem girar); demais modos acima do horizonte. */
  function applyLimits(c: OrbitControlsImpl, g: CameraGoal, animating: boolean) {
    if (animating) {
      c.minPolarAngle = 0
      c.maxPolarAngle = Math.PI
      c.enableRotate = true
      return
    }
    if (g.topDown) {
      c.minPolarAngle = 0
      c.maxPolarAngle = MathUtils.degToRad(1)
      c.enableRotate = false
    } else {
      c.minPolarAngle = MIN_POLAR
      c.maxPolarAngle = MAX_POLAR
      c.enableRotate = true
    }
  }

  function snapTo(c: OrbitControlsImpl, g: CameraGoal) {
    camera.position.copy(g.position)
    c.target.copy(g.target)
    setFov(g.fov)
    applyLimits(c, g, false)
    c.update()
  }

  // Novo destino: anima até ele (ou salta, com "reduzir movimento") e aplica o corte.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    gl.clippingPlanes = goal.cutY === null ? [] : [new Plane(new Vector3(0, -1, 0), goal.cutY)]
    const intro = firstGoal.current
    firstGoal.current = false

    if (reducedMotion) {
      transition.current = null
      snapTo(c, goal)
      invalidate()
      return
    }

    let from: Pose = { position: camera.position.clone(), target: c.target.clone(), fov: (camera as PerspectiveCamera).fov }
    if (intro) {
      // Entrada: começa um pouco mais longe, mais alto e girado — e "pousa" na composição.
      const offset = new Spherical().setFromVector3(goal.position.clone().sub(goal.target))
      offset.radius *= 1.3
      offset.theta -= MathUtils.degToRad(28)
      offset.phi = Math.max(0.15, offset.phi - MathUtils.degToRad(12))
      from = {
        position: goal.target.clone().add(new Vector3().setFromSpherical(offset)),
        target: goal.target.clone(),
        fov: goal.fov,
      }
      camera.position.copy(from.position)
      c.target.copy(from.target)
      setFov(from.fov)
    }
    applyLimits(c, goal, true)
    transition.current = { from, to: goal, start: intro ? null : performance.now(), duration: intro ? INTRO_MS : TRANSITION_MS }
    c.update()
    invalidate()
    // snapTo/applyLimits/setFov dependem só dos valores já listados.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal, camera, gl, invalidate, reducedMotion])

  // Ao desmontar, remove o corte do renderizador.
  useEffect(() => () => void (gl.clippingPlanes = []), [gl])

  const ready = useRef(sceneReady)
  useEffect(() => {
    ready.current = sceneReady
    invalidate()
  }, [sceneReady, invalidate])

  const sFrom = useMemo(() => new Spherical(), [])
  const sTo = useMemo(() => new Spherical(), [])
  const tmp = useMemo(() => new Vector3(), [])

  useFrame(() => {
    const c = controls.current
    const tr = transition.current
    if (!c || !tr) return
    if (tr.start === null) {
      if (!ready.current) return
      // Pequena pausa para acompanhar o fade do loader.
      tr.start = performance.now() + 200
    }
    const raw = MathUtils.clamp((performance.now() - tr.start) / tr.duration, 0, 1)
    const e = easeInOutCubic(raw)

    sFrom.setFromVector3(tmp.copy(tr.from.position).sub(tr.from.target))
    sTo.setFromVector3(tmp.copy(tr.to.position).sub(tr.to.target))
    // Raio interpolado em escala logarítmica: aproximações/afastamentos grandes ficam naturais.
    const radius = Math.exp(MathUtils.lerp(Math.log(sFrom.radius), Math.log(sTo.radius), e))
    const phi = MathUtils.lerp(sFrom.phi, sTo.phi, e)
    // A planta tem azimute fixo (norte para cima): girar junto com a subida evita um "salto" no fim.
    const theta = lerpAngle(sFrom.theta, sTo.theta, e)

    c.target.lerpVectors(tr.from.target, tr.to.target, e)
    camera.position.copy(c.target).add(tmp.setFromSpherical(new Spherical(radius, phi, theta)))
    setFov(MathUtils.lerp(tr.from.fov, tr.to.fov, e))

    if (raw >= 1) {
      transition.current = null
      snapTo(c, tr.to)
    } else {
      c.update()
    }
    invalidate()
  })

  /** Limita o "pan": o alvo não sai do volume do imóvel (a casa nunca se perde da tela). */
  function clampTarget() {
    const c = controls.current
    if (!c || transition.current) return
    const hx = fit.size.x * 0.5
    const hz = fit.size.z * 0.5
    const clamped = tmp.set(
      MathUtils.clamp(c.target.x, -hx, hx),
      MathUtils.clamp(c.target.y, 0, fit.size.y),
      MathUtils.clamp(c.target.z, -hz, hz),
    )
    if (clamped.distanceToSquared(c.target) > 1e-8) {
      const delta = clamped.clone().sub(c.target)
      c.target.add(delta)
      camera.position.add(delta)
    }
  }

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping={!reducedMotion}
      dampingFactor={0.09}
      rotateSpeed={0.65}
      zoomSpeed={0.85}
      panSpeed={0.6}
      screenSpacePanning
      minDistance={minDistance}
      maxDistance={maxDistance}
      onChange={clampTarget}
      onStart={() => {
        // O usuário assume o controle: interrompe a animação (sem disputa com o OrbitControls).
        if (transition.current && controls.current) {
          transition.current = null
          setFov(goal.fov)
          applyLimits(controls.current, goal, false)
        }
        onUserInteract()
        onInteractionChange(true)
      }}
      onEnd={() => onInteractionChange(false)}
    />
  )
}
