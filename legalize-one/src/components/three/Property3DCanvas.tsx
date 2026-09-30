import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, type RefObject } from 'react'
import { ACESFilmicToneMapping, PMREMGenerator, SRGBColorSpace, type Group, type Scene, type Texture } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { Model3DConfig, Model3DHotspot } from '@/types/model3d'
import { FOV, type Model3DView } from './cameraGoals'
import { Property3DControls } from './Property3DControls'
import { Property3DHotspots } from './Property3DHotspots'
import type { ModelFit } from './prepareModel'

interface Property3DCanvasProps {
  model: Group
  fit: ModelFit
  config: Model3DConfig
  view: Model3DView
  autoRotate: boolean
  reducedMotion: boolean
  activeHotspotId: string | null
  onHotspotSelect: (hotspot: Model3DHotspot) => void
  onUserInteract: () => void
  onContextLost: () => void
  hotspotLayer: RefObject<HTMLDivElement | null>
}

/** Aplica o mapa de ambiente na cena (API imperativa do three.js). */
function setEnvironment(scene: Scene, texture: Texture | null, intensity = 1) {
  scene.environment = texture
  scene.environmentIntensity = intensity
}

/** Iluminação de estúdio leve: ambiente procedural (sem baixar HDR) + sol + céu. */
function Lighting({ fit }: { fit: ModelFit }) {
  const { gl, scene, invalidate } = useThree()
  useLayoutEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const env = pmrem.fromScene(room, 0.04).texture
    setEnvironment(scene, env, 0.45)
    invalidate()
    return () => {
      setEnvironment(scene, null)
      env.dispose()
      room.dispose()
      pmrem.dispose()
    }
  }, [gl, scene, invalidate])

  const r = fit.radius
  return (
    <>
      <hemisphereLight args={['#f4efe6', '#3b4a3a', 0.9]} />
      <directionalLight position={[r * 0.6, r * 1.1, r * 0.8]} intensity={2.1} color="#fff4e2" />
      <directionalLight position={[-r * 0.8, r * 0.5, -r * 0.6]} intensity={0.45} color="#cfe0ff" />
    </>
  )
}

function ContextLossWatcher({ onLost }: { onLost: () => void }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const canvas = gl.domElement
    const handle = (e: Event) => {
      e.preventDefault()
      onLost()
    }
    canvas.addEventListener('webglcontextlost', handle)
    return () => canvas.removeEventListener('webglcontextlost', handle)
  }, [gl, onLost])
  return null
}

/**
 * Canvas WebGL do modelo. `frameloop="demand"`: só desenha quando algo muda
 * (arraste, animação, giro automático) — poupa bateria no celular.
 * DPR limitado a 1.5: evita renderizar em 3x em smartphones.
 */
export function Property3DCanvas({
  model,
  fit,
  config,
  view,
  autoRotate,
  reducedMotion,
  activeHotspotId,
  onHotspotSelect,
  onUserInteract,
  onContextLost,
  hotspotLayer,
}: Property3DCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop="demand"
      camera={{ fov: FOV, position: [fit.radius, fit.radius * 0.6, fit.radius] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = 0.9
        gl.outputColorSpace = SRGBColorSpace
      }}
      // Sem aria-hidden: os hotspots (botões DOM do <Html>) vivem dentro deste contêiner.
      className="touch-none"
    >
      <ContextLossWatcher onLost={onContextLost} />
      <Lighting fit={fit} />
      <primitive object={model} dispose={null} />
      <Property3DHotspots
        hotspots={config.hotspots ?? []}
        fit={fit}
        view={view}
        activeId={activeHotspotId}
        onSelect={onHotspotSelect}
        portal={hotspotLayer}
      />
      <Property3DControls
        fit={fit}
        config={config}
        view={view}
        autoRotate={autoRotate}
        reducedMotion={reducedMotion}
        onUserInteract={onUserInteract}
      />
    </Canvas>
  )
}
