import { integrations } from '@/config/site'

/**
 * Camada única de URLs de imagem.
 *
 * Hoje as fotos de demonstração vêm do Unsplash. Quando as fotos reais estiverem
 * no Supabase Storage, os dados passam a usar `storageImage('imoveis/<id>/capa.jpg')`
 * e nenhum componente precisa mudar: todos renderizam via `SmartImage`, que exibe
 * a ilustração de fallback enquanto carrega ou se a URL falhar/estiver vazia.
 */

interface ImageOptions {
  width?: number
  quality?: number
}

const UNSPLASH_HOST = 'images.unsplash.com'

/** Foto do Unsplash otimizada (formato automático, recorte e largura). */
export function unsplash(photoId: string, width = 1200, quality = 75): string {
  return `https://${UNSPLASH_HOST}/${photoId}?auto=format&fit=crop&w=${width}&q=${quality}`
}

/**
 * Imagem pública do Supabase Storage com transformação on-the-fly.
 * Retorna string vazia enquanto o Supabase não estiver configurado —
 * o `SmartImage` então exibe diretamente a ilustração de fallback.
 */
export function storageImage(path: string, { width = 1200, quality = 75 }: ImageOptions = {}): string {
  const { url, storageBucket } = integrations.supabase
  if (!url) return ''
  const cleanPath = path.replace(/^\/+/, '')
  const base = url.replace(/\/+$/, '')
  return `${base}/storage/v1/render/image/public/${storageBucket}/${cleanPath}?width=${width}&quality=${quality}&resize=cover`
}

/** Gera a versão em outra largura da mesma imagem, respeitando o provedor. */
export function resizeImage(src: string, width: number): string {
  if (!src) return src
  try {
    const url = new URL(src, window.location.origin)
    if (url.hostname === UNSPLASH_HOST) url.searchParams.set('w', String(width))
    else if (url.pathname.includes('/storage/v1/render/image/')) url.searchParams.set('width', String(width))
    else return src
    return url.toString()
  } catch {
    return src
  }
}

const SRCSET_WIDTHS = [480, 768, 1080, 1440, 2000]

/**
 * `srcSet` responsivo para provedores com redimensionamento (Unsplash, Supabase).
 * Retorna `undefined` para outras URLs (ex.: arquivos locais).
 */
export function buildSrcSet(src: string, widths: number[] = SRCSET_WIDTHS): string | undefined {
  if (!src) return undefined
  const variants = widths.map((w) => [resizeImage(src, w), w] as const)
  if (variants.every(([url]) => url === src)) return undefined
  return variants.map(([url, w]) => `${url} ${w}w`).join(', ')
}
