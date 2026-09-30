import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router'
import { SiteLayout } from '@/components/layout/SiteLayout'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'

// Páginas secundárias carregadas sob demanda.
const Properties = lazy(() => import('@/pages/Properties'))
const PropertyDetails = lazy(() => import('@/pages/PropertyDetails'))
const Sell = lazy(() => import('@/pages/Sell'))

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
])
