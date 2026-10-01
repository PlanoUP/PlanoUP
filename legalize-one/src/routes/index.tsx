import { Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router'
import { SiteLayout } from '@/components/layout/SiteLayout'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import { AuthRoot, DashboardHome, Login, Properties, PropertyDetails, Sell } from './lazyPages'

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>{node}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'imoveis', element: withSuspense(<Properties />) },
      { path: 'imovel/:slug', element: withSuspense(<PropertyDetails />) },
      { path: 'vender', element: withSuspense(<Sell />) },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    // Painel da imobiliária (fora do layout público).
    element: withSuspense(<AuthRoot />),
    errorElement: <NotFound />,
    children: [
      { path: 'entrar', element: withSuspense(<Login />) },
      { path: 'dashboard/*', element: withSuspense(<DashboardHome />) },
    ],
  },
])
