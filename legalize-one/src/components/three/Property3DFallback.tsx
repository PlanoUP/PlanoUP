import { CalendarCheck, Images, TriangleAlert } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { track } from '@/lib/analytics'
import { whatsappLink } from '@/lib/whatsapp'

interface Property3DFallbackProps {
  poster?: string
  scheduleMessage: string
  onShowPhotos: () => void
}

/** Sem WebGL ou falha no arquivo: nunca deixa a área vazia — oferece fotos e visita. */
export function Property3DFallback({ poster, scheduleMessage, onShowPhotos }: Property3DFallbackProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-navy-950 p-5 text-white" role="alert">
      {poster && (
        <SmartImage src={poster} alt="" fallback="facade-day" className="absolute inset-0 opacity-25" />
      )}
      <div className="relative max-w-sm rounded-2xl border border-white/15 bg-navy-950/80 p-6 text-center backdrop-blur-md">
        <TriangleAlert className="mx-auto size-8 text-gold-400" strokeWidth={1.6} aria-hidden="true" />
        <p className="mt-3 font-display text-[18px] leading-snug font-bold tracking-[-0.02em]">
          Não foi possível carregar o modelo 3D neste dispositivo.
        </p>
        <p className="mt-2 text-[14px] text-white/70">Você ainda pode ver as fotos ou agendar uma visita presencial.</p>
        <div className="mt-5 grid gap-2.5">
          <button
            type="button"
            onClick={onShowPhotos}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white text-[15px] font-semibold text-navy-950"
          >
            <Images className="size-5" aria-hidden="true" />
            Ver fotos do imóvel
          </button>
          <a
            href={whatsappLink(scheduleMessage)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('model3d_schedule_clicked', { placement: 'fallback' })}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 text-[15px] font-semibold text-white hover:bg-white/10"
          >
            <CalendarCheck className="size-5" aria-hidden="true" />
            Agendar visita
          </a>
        </div>
      </div>
    </div>
  )
}
