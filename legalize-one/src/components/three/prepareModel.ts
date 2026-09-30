import { Box3, BufferGeometry, Group, Mesh, Vector3, type Material, type Object3D, type Texture } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export interface ModelFit {
  /** Deslocamento aplicado ao modelo (centro x/z na origem, chão em y = 0). */
  offset: Vector3
  /** Dimensões do bounding box (m). */
  size: Vector3
  /** Raio da esfera envolvente. */
  radius: number
}

export interface PreparedModel {
  root: Group
  fit: ModelFit
  stats: { meshesBefore: number; meshesAfter: number; triangles: number }
}

/**
 * Prepara o modelo para web/mobile, sem alterar o arquivo:
 * 1. agrupa as geometrias por material (milhares de draw calls → uma por material);
 * 2. calcula o bounding box real e centraliza (origem/escala do SketchUp não importam).
 */
export function prepareModel(scene: Group): PreparedModel {
  scene.updateMatrixWorld(true)

  const groups = new Map<string, { material: Material; geometries: BufferGeometry[] }>()
  const leftovers: Object3D[] = []
  let meshesBefore = 0
  let triangles = 0

  scene.traverse((obj) => {
    const mesh = obj as Mesh
    if (!mesh.isMesh) return
    meshesBefore++
    if (Array.isArray(mesh.material)) {
      leftovers.push(mesh)
      return
    }
    // Geometria em coordenadas de mundo (transformações da hierarquia "assadas").
    const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld)
    triangles += (geometry.index ? geometry.index.count : geometry.attributes.position.count) / 3
    const signature = [
      mesh.material.uuid,
      geometry.index ? 'i' : 'n',
      Object.keys(geometry.attributes).sort().join(','),
      Object.keys(geometry.morphAttributes).length,
    ].join('|')
    const bucket = groups.get(signature) ?? { material: mesh.material, geometries: [] }
    bucket.geometries.push(geometry)
    groups.set(signature, bucket)
  })

  const root = new Group()
  root.name = 'Legalize3DModel'

  for (const { material, geometries } of groups.values()) {
    const merged = geometries.length > 1 ? mergeGeometries(geometries, false) : geometries[0]
    if (merged) {
      if (merged !== geometries[0]) geometries.forEach((g) => g.dispose())
      const mesh = new Mesh(merged, material)
      mesh.matrixAutoUpdate = false
      root.add(mesh)
    } else {
      // Não foi possível mesclar (atributos incompatíveis): mantém separados.
      geometries.forEach((g) => {
        const mesh = new Mesh(g, material)
        mesh.matrixAutoUpdate = false
        root.add(mesh)
      })
    }
  }
  for (const obj of leftovers) {
    const clone = obj.clone(false)
    obj.matrixWorld.decompose(clone.position, clone.quaternion, clone.scale)
    root.add(clone)
  }

  // Libera a hierarquia original (as geometrias já foram copiadas).
  scene.traverse((obj) => (obj as Mesh).isMesh && (obj as Mesh).geometry.dispose())

  // Enquadramento a partir do volume real.
  const box = new Box3().setFromObject(root)
  const size = box.getSize(new Vector3())
  const center = box.getCenter(new Vector3())
  const offset = new Vector3(-center.x, -box.min.y, -center.z)
  root.position.copy(offset)
  root.updateMatrixWorld(true)

  return {
    root,
    fit: { offset, size, radius: size.length() / 2 },
    stats: { meshesBefore, meshesAfter: root.children.length, triangles: Math.round(triangles) },
  }
}

/** Libera GPU/memória do modelo (geometrias, materiais e texturas). */
export function disposeModel(root: Object3D) {
  const textures = new Set<Texture>()
  const materials = new Set<Material>()
  root.traverse((obj) => {
    const mesh = obj as Mesh
    if (!mesh.isMesh) return
    mesh.geometry.dispose()
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((m) => materials.add(m))
  })
  materials.forEach((m) => {
    Object.values(m).forEach((v) => {
      if (v && typeof v === 'object' && (v as Texture).isTexture) textures.add(v as Texture)
    })
    m.dispose()
  })
  textures.forEach((t) => t.dispose())
}

/** Converte coordenadas normalizadas (ver types/model3d.ts) em metros na cena centralizada. */
export function fromNormalized([nx, ny, nz]: [number, number, number], fit: ModelFit): Vector3 {
  return new Vector3(nx * fit.size.x, ny * fit.size.y, nz * fit.size.z)
}

/** Converte coordenadas originais do arquivo em coordenadas da cena centralizada. */
export function fromModelSpace([x, y, z]: [number, number, number], fit: ModelFit): Vector3 {
  return new Vector3(x, y, z).add(fit.offset)
}
