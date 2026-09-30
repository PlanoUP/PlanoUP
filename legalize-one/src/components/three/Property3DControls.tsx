import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { MathUtils, Plane, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Model3DConfig } from '@/types/model3d'
import { resolveGoal, type Model3DView } from './cameraGoals'
import type { ModelFit } from './prepareModel'

interface Property3DControlsProps {
  fit: ModelFit
  config: Model3DConfig
  /** Cada pedido de câmera é um novo objeto (mesmo destino = anima de novo). */
  view: Model3DView
  autoRotate: boolean
  reducedMotion: boolean
  onUserInteract: () => void
}

const ARRIVE_EPSILON = 0.004
const MIN_POLAR = MathUtils.degToRad(8)
const MAX_POLAR = MathUtils.degToRad(84)

/**
 * OrbitControls + câmera animada entre presets.
 * Desktop: arrastar gira, scroll aproxima, botão direito move.
 * Toque: um dedo gira, pinça aproxima, dois dedos movem.
 */
export function Property3DControls({
  fit,
  config,
  view,
  autoRotate,
  reducedMotion,
  onUserInteract,
}: Property3DControlsProps) {
  const controls = useRef<OrbitControlsImpl>(null)
  const { camera, gl, invalidate, size } = useThree()
  const animating = useRef(false)
  // Formato da tela arredondado: evita recalcular o destino a cada pixel de redimensionamento.
  const aspect = Math.round((size.width / Math.max(size.height, 1)) * 10) / 10
  const goal = useMemo(() => resolveGoal(view, config, fit, aspect), [view, config, fit, aspect])

  const minDistance = (config.minDistance ?? 0.3) * fit.radius
  // O limite de zoom sempre comporta o enquadramento pedido (ex.: celular em pé afasta a câmera).
  const maxDistance = Math.max((config.maxDistance ?? 2.6) * fit.radius, goal.position.distanceTo(goal.target) * 1.2)

  useEffect(() => {
    camera.near = Math.max(fit.radius / 400, 0.02)
    camera.far = fit.radius * 30
    camera.updateProjectionMatrix()
  }, [camera, fit.radius])

  /** Limites de inclinação: planta travada de cima; demais modos não passam por baixo do chão. */
  function applyPolarLimits(c: OrbitControlsImpl, arrived: boolean) {
    if (!arrived) {
      c.minPolarAngle = 0
      c.maxPolarAngle = MAX_POLAR
    } else if (goal.topDown) {
      c.minPolarAngle = 0
      c.maxPolarAngle = 0
    } else {
      c.minPolarAngle = MIN_POLAR
      c.maxPolarAngle = MAX_POLAR
    }
  }

  // Novo destino: anima até ele (ou salta, com "reduzir movimento") e aplica o corte.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    gl.clippingPlanes = goal.cutY === null ? [] : [new Plane(new Vector3(0, -1, 0), goal.cutY)]
    if (reducedMotion) {
      camera.position.copy(goal.position)
      c.target.copy(goal.target)
      applyPolarLimits(c, true)
      c.update()
    } else {
      applyPolarLimits(c, false)
      animating.current = true
    }
    invalidate()
    // applyPolarLimits depende só de `goal`, já listado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal, camera, gl, invalidate, reducedMotion])

  // Ao desmontar, remove o corte do renderizador.
  useEffect(() => () => void (gl.clippingPlanes = []), [gl])

  useFrame((_, delta) => {
    const c = controls.current
    if (!c || !animating.current) return
    const t = 1 - Math.exp(-Math.min(delta, 0.1) * 4.5)
    camera.position.lerp(goal.position, t)
    c.target.lerp(goal.target, t)
    const eps = ARRIVE_EPSILON * fit.radius
    if (camera.position.distanceTo(goal.position) < eps && c.target.distanceTo(goal.target) < eps) {
      camera.position.copy(goal.position)
      c.target.copy(goal.target)
      animating.current = false
      applyPolarLimits(c, true)
    }
    c.update()
    invalidate()
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping={!reducedMotion}
      dampingFactor={0.08}
      rotateSpeed={0.7}
      zoomSpeed={0.9}
      panSpeed={0.8}
      screenSpacePanning
      minDistance={minDistance}
      maxDistance={maxDistance}
      autoRotate={autoRotate && !reducedMotion}
      autoRotateSpeed={0.45}
      onStart={() => {
        // O usuário assume o controle: interrompe animações e o giro automático.
        if (animating.current && controls.current) applyPolarLimits(controls.current, true)
        animating.current = false
        onUserInteract()
      }}
    />
  )
}
