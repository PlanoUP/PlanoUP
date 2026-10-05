import { useEffect, useState, type ReactNode } from 'react'
import { isBackendEnabled } from '@/lib/backend'
import { preloadCatalog } from '@/services/propertyService'
import { setTenant } from './store'
import { applyTenantTheme } from './theme'
import { defaultTenant } from './defaultTenant'

type Status = 'ready' | 'loading' | 'not_found' | 'error'

/**
 * Identifica a imobiliária antes de renderizar o site.
 * Sem backend: pronto imediatamente com a marca padrão (sem tela intermediária — V1 intacta).
 * Com backend: tela neutra curta enquanto resolve (evita mostrar a marca errada).
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(() => (isBackendEnabled() ? 'loading' : 'ready'))
  const [brokerPage, setBrokerPage] = useState(false)

  useEffect(() => {
    if (!isBackendEnabled()) {
      applyTenantTheme(defaultTenant)
      return
    }
    let active = true
    // Resolução (e o cliente Supabase) só é baixada quando o backend está ligado.
    import('./resolveTenant')
      .then(({ resolveTenant }) => resolveTenant())
      .then((tenant) => {
        if (!active) return
        setTenant(tenant)
        applyTenantTheme(tenant)
        preloadCatalog()
        setStatus('ready')
      })
      .catch((error: unknown) => {
        if (!active) return
        setStatus(error instanceof Error && error.message.startsWith('tenant_not_found') ? 'not_found' : 'error')
        setBrokerPage(error instanceof Error && error.message.includes(':corretor:'))
      })
    return () => {
      active = false
    }
  }, [])

  if (status === 'ready') return children
  if (status === 'loading') return <div className="min-h-dvh bg-white" aria-busy="true" />
  return (
    <main className="flex min-h-dvh items-center justify-center bg-sand px-6 text-center">
      <div className="max-w-md">
        <p className="font-display text-[22px] font-bold text-navy-950">
          {status === 'not_found' ? (brokerPage ? 'Perfil não encontrado' : 'Site não encontrado') : 'Não foi possível carregar o site'}
        </p>
        <p className="mt-2 text-[15px] text-slate">
          {status === 'not_found'
            ? brokerPage
              ? 'Este corretor não existe ou a página dele ainda não foi publicada.'
              : 'Este endereço ainda não está ligado a nenhuma imobiliária.'
            : 'Verifique sua conexão e tente novamente em instantes.'}
        </p>
        {status === 'error' && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-navy-950 px-6 text-[14px] font-semibold text-white"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </main>
  )
}
