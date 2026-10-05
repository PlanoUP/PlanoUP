import { useEffect } from 'react'
import { site } from '@/config/site'
import { isDefaultBrand } from '@/tenant/defaultTenant'
import { useTenant } from '@/tenant/store'

/** Define o título da aba. Sem argumento, usa o título padrão da imobiliária. */
export function usePageTitle(title?: string) {
  const tenant = useTenant()
  // Imobiliária padrão mantém o título da V1 ("Legalize One · Do documento à chave").
  // Página de corretor: o nome dele, mesmo quando a conta é a imobiliária padrão.
  const v1 = isDefaultBrand(tenant) && !tenant.broker
  const brand = v1 ? site.name : tenant.name
  const tagline = v1 ? 'Do documento à chave' : tenant.tagline
  useEffect(() => {
    document.title = title ? `${title} · ${brand}` : [brand, tagline].filter(Boolean).join(' · ')
  }, [title, brand, tagline])
}
