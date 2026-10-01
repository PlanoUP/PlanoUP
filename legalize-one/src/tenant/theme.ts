import { DEFAULT_PRIMARY, DEFAULT_SECONDARY } from './defaultTenant'
import type { TenantConfig } from './types'

/**
 * Tema por imobiliária SEM recompilar o CSS: as utilidades do Tailwind v4 usam as
 * variáveis `--color-*` de index.css, então basta sobrescrevê-las no :root.
 * Os tons intermediários são derivados com color-mix (suportado pelos navegadores atuais).
 * Para as cores padrão da Legalize nada é sobrescrito — visual idêntico à V1.
 */
export function themeVariables(primary: string, secondary: string): Record<string, string> {
  const vars: Record<string, string> = {}
  if (primary.toLowerCase() !== DEFAULT_PRIMARY) {
    vars['--color-navy-950'] = primary
    vars['--color-navy-900'] = `color-mix(in oklab, ${primary} 88%, white)`
    vars['--color-navy-800'] = `color-mix(in oklab, ${primary} 76%, white)`
    vars['--color-navy-700'] = `color-mix(in oklab, ${primary} 64%, white)`
  }
  if (secondary.toLowerCase() !== DEFAULT_SECONDARY) {
    vars['--color-gold-500'] = secondary
    vars['--color-gold-400'] = `color-mix(in oklab, ${secondary} 80%, white)`
    vars['--color-gold-600'] = `color-mix(in oklab, ${secondary} 85%, black)`
  }
  return vars
}

const APPLIED = new Set<string>()

/** Aplica cores, favicon e cor da barra do navegador do tenant. */
export function applyTenantTheme(tenant: TenantConfig, doc: Document = document): void {
  const root = doc.documentElement
  const vars = themeVariables(tenant.branding.primaryColor, tenant.branding.secondaryColor)
  for (const name of APPLIED) if (!(name in vars)) root.style.removeProperty(name)
  APPLIED.clear()
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value)
    APPLIED.add(name)
  }
  doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', tenant.branding.primaryColor)
  if (tenant.branding.faviconUrl) {
    const icon = doc.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (icon) {
      icon.href = tenant.branding.faviconUrl
      icon.removeAttribute('type')
    }
  }
}
