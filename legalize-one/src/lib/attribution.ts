/**
 * Atribuição anônima da visita: sessão (aleatória, por aba), UTMs e referrer de entrada.
 * Nada aqui identifica a pessoa — nome/telefone só existem em leads, quando ela mesma informa.
 */
const SID_KEY = 'lo:sid'
const UTM_KEY = 'lo:utm'
const REF_KEY = 'lo:ref'
export const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
export type Utm = Partial<Record<(typeof UTM_FIELDS)[number], string>>

function storage(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

function randomId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  }
}

/** Extrai UTMs de uma query string (limitadas a 100 caracteres). */
export function parseUtm(search: string): Utm {
  const params = new URLSearchParams(search)
  const utm: Utm = {}
  for (const key of UTM_FIELDS) {
    const value = params.get(key)?.trim()
    if (value) utm[key] = value.slice(0, 100)
  }
  return utm
}

/** Referrer externo (o próprio site não conta como origem). */
export function externalReferrer(referrer: string, ownHost: string): string {
  if (!referrer) return ''
  try {
    const url = new URL(referrer)
    return url.hostname === ownHost ? '' : `${url.origin}${url.pathname}`.slice(0, 300)
  } catch {
    return ''
  }
}

let memorySid: string | null = null

export function getSessionId(): string {
  const s = storage()
  const existing = s?.getItem(SID_KEY) ?? memorySid
  if (existing) return existing
  const id = randomId()
  memorySid = id
  s?.setItem(SID_KEY, id)
  return id
}

/** Primeiro toque da sessão: UTMs e referrer de quando a pessoa chegou. */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return
  const s = storage()
  if (!s) return
  const utm = parseUtm(window.location.search)
  if (Object.keys(utm).length && !s.getItem(UTM_KEY)) s.setItem(UTM_KEY, JSON.stringify(utm))
  if (!s.getItem(REF_KEY)) s.setItem(REF_KEY, externalReferrer(document.referrer, window.location.hostname))
}

export function getAttribution(): { sessionId: string; utm: Utm; referrer: string } {
  const s = storage()
  let utm: Utm = {}
  try {
    utm = JSON.parse(s?.getItem(UTM_KEY) ?? '{}') as Utm
  } catch {
    utm = {}
  }
  return { sessionId: getSessionId(), utm, referrer: s?.getItem(REF_KEY) ?? '' }
}
