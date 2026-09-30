import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { NeutralToneMapping, PMREMGenerator, SRGBColorSpace, type Group, type Scene, type Texture } from 'three'
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
  insets: { top: number; bottom: number }
  /** O primeiro quadro já apareceu (a entrada da câmera só começa depois do fade do loader). */
  sceneReady: boolean
  onFirstFrame: () => void
  reducedMotion: boolean
  activeHotspotId: string | null
  onHotspotSelect: (hotspot: Model3DHotspot) => void
  onUserInteract: () => void
  onInteractionChange: (active: boolean) => void
  onContextLost: () => void
  hotspotLayer: RefObject<HTMLDivElement | null>
}

/** Aplica o mapa de ambiente na cena (API imperativa do three.js). */
function setEnvironment(scene: Scene, texture: Texture | null, intensity = 1) {
  scene.environment = texture
  scene.environmentIntensity = intensity
}

/**
 * Iluminação arquitetônica leve (sem sombras em tempo real nem HDR para baixar):
 * ambiente procedural de estúdio para reflexos suaves + céu/chão + sol quente
 * a 3/4 que desenha os volumes da fachada + contraluz frio que abre as sombras.
 */
function Lighting({ fit }: { fit: ModelFit }) {
  const { gl, scene, invalidate } = useThree()
  useLayoutEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const env = pmrem.fromScene(room, 0.04).texture
    setEnvironment(scene, env, 0.55)
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
      <hemisphereLight args={['#fbf8f2', '#8a8f86', 1.05]} />
      <directionalLight position={[r * 0.9, r * 1.2, r * 0.45]} intensity={1.7} color="#fff3df" />
      <directionalLight position={[-r * 0.7, r * 0.6, -r * 0.9]} intensity={0.55} color="#dde8ff" />
    </>
  )
}

/** Avisa depois que o primeiro quadro (com a compilação dos shaders) foi desenhado. */
function FirstFrame({ onDone }: { onDone: () => void }) {
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    done.current = true
    requestAnimationFrame(() => requestAnimationFrame(onDone))
  })
  return null
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
  insets,
  sceneReady,
  onFirstFrame,
  reducedMotion,
  activeHotspotId,
  onHotspotSelect,
  onUserInteract,
  onInteractionChange,
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
        // "Neutral" (Khronos PBR Neutral): preserva o branco e as cores dos materiais — sem o contraste de cinema do ACES.
        gl.toneMapping = NeutralToneMapping
        gl.toneMappingExposure = 0.95
        gl.outputColorSpace = SRGBColorSpace
      }}
      // Sem aria-hidden: os hotspots (botões DOM do <Html>) vivem dentro deste contêiner.
      className="touch-none"
    >
      <ContextLossWatcher onLost={onContextLost} />
      <FirstFrame onDone={onFirstFrame} />
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
        insets={insets}
        sceneReady={sceneReady}
        reducedMotion={reducedMotion}
        onUserInteract={onUserInteract}
        onInteractionChange={onInteractionChange}
      />
    </Canvas>
  )
}
