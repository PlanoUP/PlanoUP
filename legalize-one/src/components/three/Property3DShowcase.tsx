import { Box, DoorOpen, LayoutGrid, Rotate3d } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { SmartImage } from '@/components/ui/SmartImage'
import { track } from '@/lib/analytics'
import { cn } from '@/utils/cn'
import { AUTO_START_3D, type AutoStart3DState } from './autoStart'

interface Property3DShowcaseProps {
  /** Página do imóvel com o modelo (o visualizador abre sozinho ao chegar). */
  href: string
  poster: string
  posterAlt: string
  title: string
  subtitle: string
  /** Onde a vitrine aparece (analytics). */
  placement: string
  className?: string
}

/**
 * VITRINE do modelo 3D interativo (Home): capa renderizada do próprio modelo e o
 * convite "Explorar modelo 3D". Não carrega three.js nem o GLB — o clique leva à
 * página do imóvel, onde o visualizador abre direto (intenção explícita do visitante).
 */
export function Property3DShowcase({ href, poster, posterAlt, title, subtitle, placement, className }: Property3DShowcaseProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        track('model3d_card_viewed', { placement })
        observer.disconnect()
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [placement])

  const state: AutoStart3DState = { [AUTO_START_3D]: placement }

  return (
    <div ref={ref} className={cn('group/showcase relative isolate flex flex-col overflow-hidden bg-navy-950 text-white', className)}>
      {/* Capa: render do próprio modelo (fundo navy contínuo com a seção) */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <SmartImage
          src={poster}
          alt=""
          fallback="facade-day"
          loading="lazy"
          className="absolute inset-0"
          imgClassName="object-cover object-[40%_50%] transition-transform duration-[1.2s] ease-out lg:group-hover/showcase:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/25 to-navy-950/40" />
      </div>

      {/* Imóvel */}
      <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/15 bg-navy-950/55 py-2 pr-4 pl-2 backdrop-blur-md">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950 ring-2 ring-white/70"
          >
            <Box className="size-[18px]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold">{title}</p>
            <p className="truncate text-[11.5px] text-white/70">{subtitle}</p>
          </div>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-navy-950/75 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-gold-400 uppercase ring-1 ring-gold-500/40 backdrop-blur-md sm:inline-flex">
          <Box className="size-3.5" aria-hidden="true" />
          Modelo 3D interativo
        </span>
      </div>

      {/* Convite (na parte de baixo: a casa fica livre no centro da capa) */}
      <div className="mt-auto flex flex-col items-center px-5 pt-6 pb-7 text-center sm:pb-9">
        <Link
          to={href}
          state={state}
          aria-label={`Explorar modelo 3D: ${posterAlt}`}
          onClick={() => track('model3d_cta_clicked', { placement })}
          className="relative inline-flex h-14 items-center gap-3 rounded-full bg-gradient-to-b from-gold-400 to-gold-500 pr-7 pl-2.5 text-[16px] font-bold text-navy-950 shadow-[0_18px_40px_-14px_rgb(217_180_122/0.9)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          <span className="absolute inset-0 animate-pulse-ring rounded-full ring-2 ring-gold-400/60" aria-hidden="true" />
          <span className="flex size-10 items-center justify-center rounded-full bg-navy-950 text-gold-400">
            <Rotate3d className="size-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          Explorar modelo 3D
        </Link>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[12px] text-white/80">
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
    </div>
  )
}
