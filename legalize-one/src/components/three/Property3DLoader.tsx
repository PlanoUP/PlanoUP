import { SmartImage } from '@/components/ui/SmartImage'
import { cn } from '@/utils/cn'

interface Property3DLoaderProps {
  poster?: string
  /** 0–1, ou `null` se desconhecido. */
  ratio: number | null
  loadedBytes: number
  totalBytes?: number
  stage: 'downloading' | 'processing' | 'starting'
}

const mb = (bytes: number) => (bytes / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })

/**
 * Tela de carregamento premium do modelo (~25 MB): progresso real em bytes,
 * etapa de montagem e a capa do imóvel ao fundo — nunca uma tela branca.
 */
export function Property3DLoader({ poster, ratio, loadedBytes, totalBytes, stage }: Property3DLoaderProps) {
  const percent = ratio === null ? null : Math.round(ratio * 100)
  const label = stage === 'processing' ? 'Montando os ambientes…' : 'Preparando sua visita…'
  const detail =
    stage === 'processing'
      ? 'Otimizando o modelo para o seu dispositivo'
      : totalBytes && stage === 'downloading'
        ? `Carregando o imóvel em alta qualidade · ${mb(loadedBytes)} de ${mb(totalBytes)} MB`
        : stage === 'starting'
          ? 'Iniciando o visualizador'
          : 'Carregando o imóvel em alta qualidade'

  return (
    <div className="absolute inset-0 flex animate-fade-in items-center justify-center overflow-hidden bg-navy-950 text-white">
      {poster && (
        <SmartImage
          src={poster}
          alt=""
          fallback="facade-day"
          loading="eager"
          className="absolute inset-0 scale-105 opacity-40 blur-[2px]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/40" />
      <div className="relative w-full max-w-sm px-6 text-center" role="status" aria-live="polite">
        <p className="eyebrow text-[10.5px] tracking-[0.3em] text-gold-400">Legalize 3D Experience</p>
        <p className="mt-3 font-display text-[22px] font-bold tracking-[-0.02em]">{label}</p>
        <div
          className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/12"
          role="progressbar"
          aria-label="Progresso do carregamento do modelo 3D"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent ?? undefined}
        >
          <div
            className={cn(
              'h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400 transition-[width] duration-300',
              (percent === null || stage !== 'downloading') && 'animate-pulse',
            )}
            style={{ width: `${stage === 'downloading' ? (percent ?? 30) : 100}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-[12.5px] text-white/70">
          <span className="text-left">{detail}</span>
          {percent !== null && stage === 'downloading' && (
            <span className="shrink-0 font-semibold text-white tabular-nums">{percent}%</span>
          )}
        </div>
      </div>
    </div>
  )
}
