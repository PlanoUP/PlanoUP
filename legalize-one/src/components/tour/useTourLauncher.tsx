import { useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { track } from '@/lib/analytics'
import type { PropertyTour } from '@/types/tour'
import type { ImmersiveTourProps } from './ImmersiveTour'
import { ImmersiveTourLoader } from './ImmersiveTourLoader'
import { prefetchImmersiveTour } from './prefetch'

const PARAM = 'tour'

interface LauncherOptions extends Pick<ImmersiveTourProps, 'propertyHref' | 'contactMessage'> {
  /** Onde o tour está sendo oferecido (analytics). */
  placement: string
}

/**
 * Controla o modo imersivo pela URL (`?tour=<cena>`):
 * - o botão "voltar" do celular fecha o tour em vez de sair da página;
 * - links diretos para o tour funcionam (ex.: `/imovel/slug?tour=cozinha`);
 * - o componente imersivo (e provedores externos) só carrega ao entrar.
 */
export function useTourLauncher(tour: PropertyTour | null | undefined, { placement, ...options }: LauncherOptions) {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const requested = params.get(PARAM)
  const isOpen = Boolean(tour && requested)
  const initialSceneId = tour?.scenes.some((s) => s.id === requested) ? (requested ?? undefined) : undefined

  const open = useCallback(
    (sceneId?: string, source = placement) => {
      if (!tour) return
      track('tour_started', { tour_id: tour.id, placement: source, scene_id: sceneId })
      prefetchImmersiveTour()
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set(PARAM, sceneId ?? tour.scenes[0]?.id ?? '1')
          return next
        },
        { state: { tourPushed: true }, preventScrollReset: true },
      )
    },
    [tour, placement, setParams],
  )

  const close = useCallback(() => {
    if ((location.state as { tourPushed?: boolean } | null)?.tourPushed) {
      navigate(-1)
      return
    }
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete(PARAM)
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }, [location.state, navigate, setParams])

  const element =
    isOpen && tour ? (
      <ImmersiveTourLoader tour={tour} initialSceneId={initialSceneId} onClose={close} {...options} />
    ) : null

  return { isOpen, open, close, element }
}
