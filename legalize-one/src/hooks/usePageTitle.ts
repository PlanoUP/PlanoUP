import { useEffect } from 'react'
import { site } from '@/config/site'

/** Define o título da aba. Sem argumento, usa o título padrão da marca. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${site.name}` : `${site.name} · Do documento à chave`
  }, [title])
}
