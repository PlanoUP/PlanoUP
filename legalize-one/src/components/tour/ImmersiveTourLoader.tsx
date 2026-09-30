import { LoaderCircle } from 'lucide-react'
import { lazy, Suspense } from 'react'
import type { ImmersiveTourProps } from './ImmersiveTour'
import { loadImmersiveTour } from './prefetch'

const ImmersiveTour = lazy(loadImmersiveTour)

/** Carrega o modo imersivo sob demanda, com tela de espera na identidade da marca. */
export function ImmersiveTourLoader(props: ImmersiveTourProps) {
  return (
    <Suspense
      fallback={
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-navy-950 text-white"
          role="status"
        >
          <LoaderCircle className="size-8 animate-spin text-gold-400" />
          <p className="text-[14px] text-white/80">Preparando a visita…</p>
        </div>
      }
    >
      <ImmersiveTour {...props} />
    </Suspense>
  )
}
