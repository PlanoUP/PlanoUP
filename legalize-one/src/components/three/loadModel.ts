import type { Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export type LoadStage = 'downloading' | 'processing'

export interface LoadProgress {
  stage: LoadStage
  /** 0–1. `null` quando o tamanho total é desconhecido. */
  ratio: number | null
  loadedBytes: number
}

interface LoadOptions {
  signal: AbortSignal
  /** Tamanho esperado (bytes) — usado se o servidor não informar ou se a resposta vier comprimida. */
  sizeHint?: number
  onProgress: (progress: LoadProgress) => void
}

/** Cede a thread para o navegador pintar a interface antes de um trabalho pesado. */
const nextPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)))

/**
 * Baixa um GLB com progresso REAL (bytes recebidos via stream) e cancelamento,
 * e então o interpreta com o GLTFLoader. O arquivo nunca entra no bundle JS.
 */
export async function loadModel(url: string, { signal, sizeHint, onProgress }: LoadOptions): Promise<Group> {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`HTTP ${response.status} ao baixar o modelo`)

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('text/html')) throw new Error('O servidor retornou uma página em vez do modelo 3D')

  const encoded = Boolean(response.headers.get('content-encoding'))
  const headerLength = Number(response.headers.get('content-length')) || 0
  // Com compressão, content-length é o tamanho comprimido e não serve para o progresso.
  const total = sizeHint ?? (encoded ? 0 : headerLength)

  let buffer: ArrayBuffer
  if (response.body) {
    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let loaded = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      loaded += value.byteLength
      onProgress({ stage: 'downloading', ratio: total ? Math.min(loaded / total, 0.99) : null, loadedBytes: loaded })
    }
    const bytes = new Uint8Array(loaded)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }
    buffer = bytes.buffer
  } else {
    buffer = await response.arrayBuffer()
  }

  onProgress({ stage: 'processing', ratio: 1, loadedBytes: buffer.byteLength })
  await nextPaint()
  signal.throwIfAborted()

  const loader = new GLTFLoader()
  const basePath = url.slice(0, url.lastIndexOf('/') + 1)
  const gltf = await loader.parseAsync(buffer, basePath)
  signal.throwIfAborted()
  return gltf.scene
}
