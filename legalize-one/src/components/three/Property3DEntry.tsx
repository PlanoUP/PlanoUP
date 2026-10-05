import { Box, DoorOpen, LayoutGrid, Wifi } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'
import { track } from '@/lib/analytics'
import { cn } from '@/utils/cn'
import { prefetchViewer } from './webgl'
import { useTenant } from '@/tenant/store'

interface Property3DEntryProps {
  poster?: string
  posterAlt: string
  /** Tamanho do arquivo (bytes), exibido para quem está no plano de dados. */
  sizeBytes?: number
  onStart: () => void
  className?: string
}

/**
 * Capa do modelo 3D. Não baixa o GLB nem o three.js: apenas imagem e convite.
 * O carregamento começa somente no clique em "Explorar modelo 3D".
 */
export function Property3DEntry({ poster, posterAlt, sizeBytes, onStart, className }: Property3DEntryProps) {
  const tenant = useTenant()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        track('model3d_card_viewed')
        observer.disconnect()
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const sizeLabel = sizeBytes ? `${(sizeBytes / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} MB` : null

  return (
    <div
      ref={ref}
      className={cn(
        'relative isolate flex min-h-[440px] flex-col justify-end overflow-hidden rounded-2xl bg-navy-950 text-white sm:min-h-[480px]',
        className,
      )}
    >
      {poster && (
        <SmartImage
          src={poster}
          alt={posterAlt}
          fallback="facade-day"
          sizes="(min-width: 1024px) 760px, 100vw"
          className="absolute inset-0 -z-10"
          imgClassName="object-[60%_center]"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/10" />

      <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-lg bg-navy-950/75 px-3 py-1.5 text-[11.5px] font-bold tracking-[0.14em] text-gold-400 uppercase ring-1 ring-gold-500/40 backdrop-blur-md">
        <Box className="size-4" aria-hidden="true" />
        Modelo 3D interativo
      </span>

      <div className="p-5 sm:p-7">
        <p className="eyebrow text-[10.5px] tracking-[0.3em] text-gold-400 sm:text-[11px]">{tenant.name} 3D Experience</p>
        <h2 className="mt-2.5 font-display text-[28px] leading-[1.04] font-extrabold tracking-[-0.035em] text-balance sm:text-[36px]">
          Explore este imóvel
          <br />
          por todos os ângulos.
        </h2>
        <p className="mt-2.5 max-w-md text-[14.5px] leading-relaxed text-white/80 sm:text-[15px]">
          Gire, aproxime e descubra cada detalhe antes da visita.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onStart}
            onPointerEnter={prefetchViewer}
            onFocus={prefetchViewer}
            className="inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-gold-400 to-gold-500 px-7 text-[15.5px] font-bold text-navy-950 shadow-[0_18px_40px_-14px_rgb(217_180_122/0.9)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Box className="size-5" aria-hidden="true" />
            Explorar modelo 3D
          </button>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-white/75">
            <li className="inline-flex items-center gap-1.5">
              <Box className="size-3.5 text-gold-400" aria-hidden="true" />
              Visão geral
            </li>
            <li className="inline-flex items-center gap-1.5">
              <LayoutGrid className="size-3.5 text-gold-400" aria-hidden="true" />
              Planta
            </li>
            <li className="inline-flex items-center gap-1.5">
              <DoorOpen className="size-3.5 text-gold-400" aria-hidden="true" />
              Ambientes
            </li>
          </ul>
        </div>
        {sizeLabel && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-white/60">
            <Wifi className="size-3.5" aria-hidden="true" />
            Modelo em alta qualidade ({sizeLabel}) — recomendamos Wi-Fi.
          </p>
        )}
      </div>
    </div>
  )
}
