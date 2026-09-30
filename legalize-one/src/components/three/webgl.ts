/** Verifica suporte a WebGL sem carregar three.js. */
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    const ok = Boolean(gl)
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return ok
  } catch {
    return false
  }
}

/** Import dinâmico do visualizador (three + R3F + drei ficam neste chunk). */
export const loadViewer = () => import('./Property3DViewer')

/** Antecipa só o JavaScript do visualizador (nunca o arquivo GLB). */
export function prefetchViewer() {
  void loadViewer()
}
