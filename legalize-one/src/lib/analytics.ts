/**
 * Camada única de tracking. Hoje apenas empilha eventos no `dataLayer`;
 * quando Meta Pixel / GA4 forem instalados, os eventos já fluem por aqui.
 */
export type AnalyticsEvent =
  | 'search_submitted'
  | 'property_viewed'
  | 'property_favorited'
  | 'whatsapp_clicked'
  | 'lead_submitted'
  | 'filters_opened'
  // Tour 3D (funil: entrada vista → início → cenas/hotspots → conclusão)
  | 'tour_entry_viewed'
  | 'tour_started'
  | 'tour_opened'
  | 'tour_scene_changed'
  | 'tour_hotspot_clicked'
  | 'tour_floorplan_opened'
  | 'tour_fullscreen_entered'
  | 'tour_completed'
  | 'tour_closed'
  // Modelo 3D (GLB)
  | 'model3d_card_viewed'
  | 'model3d_started'
  | 'model3d_loaded'
  | 'model3d_load_failed'
  | 'model3d_view_changed'
  | 'model3d_plan_view'
  | 'model3d_hotspot_clicked'
  | 'model3d_fullscreen_entered'
  | 'model3d_fullscreen_exited'
  | 'model3d_closed'
  | 'model3d_whatsapp_clicked'
  | 'model3d_schedule_clicked'
  // Página do imóvel
  | 'property_whatsapp_clicked'
  | 'property_schedule_clicked'
  | 'property_tour_cta_clicked'

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
  property_whatsapp_clicked: 'Contact',
  property_schedule_clicked: 'Schedule',
  model3d_whatsapp_clicked: 'Contact',
  model3d_schedule_clicked: 'Schedule',
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
