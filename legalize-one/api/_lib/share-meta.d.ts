export interface ShareMeta {
  title: string
  description: string
  image: string | null
  url: string
  type: 'website' | 'profile'
}
export function escapeHtml(value: unknown): string
export function rasterImage(url: unknown, origin: string): string | null
export function brokerShareMeta(input: {
  profile: Record<string, any>
  property?: Record<string, any> | null
  coverFromMedia?: string | null
  origin: string
  path: string
}): ShareMeta
export function injectMeta(html: string, meta: ShareMeta): string
