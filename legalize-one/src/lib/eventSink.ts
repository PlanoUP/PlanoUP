import { getTenant } from '@/tenant/store'
import { getAttribution } from './attribution'
import { isBackendEnabled } from './backend'
import { getSupabase } from './supabase'

/** Tipos aceitos pelo banco (analytics_events.event_type). */
export type StoredEventType =
  | 'page_view'
  | 'property_view'
  | 'gallery_interaction'
  | '3d_open'
  | '3d_interaction'
  | 'tour_open'
  | 'whatsapp_click'
  | 'phone_click'
  | 'lead_created'
  | 'visit_request'
  | 'search'

interface QueuedEvent {
  type: StoredEventType
  propertyId: string | null
  path: string
  metadata: Record<string, string | number | boolean>
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** Metadados permitidos (nunca dados pessoais). */
const METADATA_KEYS = ['placement', 'source', 'device', 'mode', 'id', 'type', 'scene_id', 'purpose'] as const

let context: { propertyId: string | null } = { propertyId: null }
let queue: QueuedEvent[] = []
let timer: number | null = null

/** A página do imóvel informa qual imóvel está aberto (eventos do 3D/tour herdam o vínculo). */
export function setAnalyticsContext(next: { propertyId: string | null }): void {
  context = next
}

export function pickMetadata(payload: Record<string, unknown>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  for (const key of METADATA_KEYS) {
    const value = payload[key]
    if (typeof value === 'string') out[key] = value.slice(0, 60)
    else if (typeof value === 'number' || typeof value === 'boolean') out[key] = value
  }
  return out
}

export function resolvePropertyId(payloadId: unknown): string | null {
  const id = typeof payloadId === 'string' ? payloadId : context.propertyId
  return id && UUID.test(id) ? id : null
}

async function flush(): Promise<void> {
  timer = null
  const tenantId = getTenant().id
  const client = getSupabase()
  const batch = queue
  queue = []
  if (!client || !tenantId || !batch.length) return
  const supabase = await client
  const { sessionId, utm, referrer } = getAttribution()
  // Falhas de analytics nunca atrapalham a navegação.
  await Promise.allSettled(
    batch.map((e) =>
      supabase.rpc('track_event', {
        p_tenant_id: tenantId,
        p_event_type: e.type,
        p_property_id: e.propertyId,
        p_session_id: sessionId,
        p_path: e.path,
        p_referrer: referrer || null,
        p_utm: utm,
        p_metadata: e.metadata,
      }),
    ),
  )
}

/** Enfileira um evento para o banco (sem backend: ignora). Envio em lote a cada ~1,5 s. */
export function persistEvent(type: StoredEventType, payload: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined' || !isBackendEnabled()) return
  queue.push({
    type,
    propertyId: resolvePropertyId(payload.property_id),
    path: window.location.pathname.slice(0, 300),
    metadata: pickMetadata(payload),
  })
  timer ??= window.setTimeout(() => void flush(), 1500)
}

if (typeof window !== 'undefined') {
  // Ao sair/ocultar a aba, envia o que estiver na fila.
  window.addEventListener('pagehide', () => void flush())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush()
  })
}
