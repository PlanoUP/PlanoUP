import { persistEvent, type StoredEventType } from './eventSink'

/**
 * Camada única de tracking: `dataLayer` (GTM), Meta Pixel e GA4 quando instalados e —
 * com o backend ligado — os eventos relevantes para o painel da imobiliária são gravados
 * no banco (analytics_events), sem dados pessoais.
 */
export type AnalyticsEvent =
  | 'page_viewed'
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
  | 'model3d_cta_clicked'
  | 'model3d_loaded'
  | 'model3d_load_failed'
  | 'model3d_view_changed'
  | 'model3d_plan_view'
  | 'model3d_view_reset'
  | 'model3d_rooms_opened'
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

/** Eventos do site → tipos gravados no banco (o resto fica só no dataLayer). */
export const storedEventTypes: Partial<Record<AnalyticsEvent, StoredEventType>> = {
  page_viewed: 'page_view',
  property_viewed: 'property_view',
  search_submitted: 'search',
  tour_started: 'tour_open',
  model3d_started: '3d_open',
  model3d_view_changed: '3d_interaction',
  model3d_rooms_opened: '3d_interaction',
  model3d_hotspot_clicked: '3d_interaction',
  model3d_view_reset: '3d_interaction',
  model3d_fullscreen_entered: '3d_interaction',
  whatsapp_clicked: 'whatsapp_click',
  property_whatsapp_clicked: 'whatsapp_click',
  model3d_whatsapp_clicked: 'whatsapp_click',
  property_schedule_clicked: 'visit_request',
  model3d_schedule_clicked: 'visit_request',
}

export function track(event: AnalyticsEvent, payload: EventPayload = {}): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ event, ...payload })

  const metaEvent = metaStandardEvents[event]
  if (metaEvent && typeof window.fbq === 'function') window.fbq('track', metaEvent, payload)
  if (typeof window.gtag === 'function') window.gtag('event', event, payload)

  const stored = storedEventTypes[event]
  if (stored) persistEvent(stored, payload)
}
