/**
 * Camada única de tracking. Hoje apenas empilha eventos no `dataLayer`;
 * quando Meta Pixel / GA4 forem instalados, os eventos já fluem por aqui.
 */
export type AnalyticsEvent =
  | 'search_submitted'
  | 'property_viewed'
  | 'property_favorited'
  | 'tour_opened'
  | 'tour_hotspot_clicked'
  | 'tour_scene_changed'
  | 'whatsapp_clicked'
  | 'lead_submitted'

type EventPayload = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
  }
}

const metaStandardEvents: Partial<Record<AnalyticsEvent, string>> = {
  search_submitted: 'Search',
  property_viewed: 'ViewContent',
  whatsapp_clicked: 'Contact',
  lead_submitted: 'Lead',
}

export function track(event: AnalyticsEvent, payload: EventPayload = {}): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ event, ...payload })

  const metaEvent = metaStandardEvents[event]
  if (metaEvent && typeof window.fbq === 'function') window.fbq('track', metaEvent, payload)
  if (typeof window.gtag === 'function') window.gtag('event', event, payload)
}
