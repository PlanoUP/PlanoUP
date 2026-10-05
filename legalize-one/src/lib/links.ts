import { getTenant } from '@/tenant/store'

/**
 * Links do site público. Na página de um corretor (`/corretor/:slug`), tudo fica dentro do perfil dele;
 * no site da imobiliária, os caminhos de sempre.
 */
export function propertyHref(propertySlug: string): string {
  const broker = getTenant().broker
  return broker ? `/corretor/${broker.slug}/imovel/${propertySlug}` : `/imovel/${propertySlug}`
}

export function homeHref(): string {
  const broker = getTenant().broker
  return broker ? `/corretor/${broker.slug}` : '/'
}

export function catalogHref(purpose?: string): string {
  const broker = getTenant().broker
  if (broker) return `/corretor/${broker.slug}#imoveis`
  return purpose ? `/imoveis?finalidade=${purpose}` : '/imoveis'
}
