import { useCallback, useState, type ImgHTMLAttributes } from 'react'
import { SceneArt } from '@/components/illustrations/SceneArt'
import { buildSrcSet } from '@/lib/images'
import type { SceneArtVariant } from '@/types/media'
import { cn } from '@/utils/cn'

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string
  alt: string
  fallback: SceneArtVariant
  /** Classes aplicadas ao wrapper (posicionamento/tamanho). */
  className?: string
  /** Classes aplicadas à imagem (object-position, transform...). */
  imgClassName?: string
  /** Quando informado, gera `srcSet` responsivo (evita baixar fotos grandes no celular). */
  sizes?: string
}

type Status = 'loading' | 'loaded' | 'error'

/**
 * Imagem com fallback ilustrado: enquanto carrega, se falhar ou se não houver
 * URL (ex.: Supabase Storage ainda não configurado), exibe uma ilustração
 * arquitetônica — nunca uma imagem quebrada. A experiência não depende do
 * provedor externo estar disponível. URLs são montadas em `lib/images.ts`.
 */
export function SmartImage({ src, alt, fallback, className, imgClassName, sizes, loading = 'lazy', ...rest }: SmartImageProps) {
  const [state, setState] = useState<{ src: string; status: Status }>({ src, status: 'loading' })
  const status: Status = !src ? 'error' : state.src === src ? state.status : 'loading'

  const handleRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete) setState({ src, status: img.naturalWidth > 0 ? 'loaded' : 'error' })
    },
    [src],
  )

  return (
    <div className={cn('overflow-hidden bg-sand-200', !/\b(absolute|fixed)\b/.test(className ?? '') && 'relative', className)}>
      {status !== 'loaded' && (
        <SceneArt variant={fallback} title={alt} className="absolute inset-0 h-full w-full" />
      )}
      {status !== 'error' && (
        <img
          ref={handleRef}
          src={src}
          srcSet={sizes ? buildSrcSet(src) : undefined}
          sizes={sizes}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setState({ src, status: 'loaded' })}
          onError={() => setState({ src, status: 'error' })}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
          {...rest}
        />
      )}
    </div>
  )
}
