import { Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router'
import { SiteLayout } from '@/components/layout/SiteLayout'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import {
  Account,
  AuthRoot,
  BrokerLayout,
  BrokerProfile,
  DashboardHome,
  DashboardLayout,
  LeadDetail,
  LeadList,
  Login,
  More,
  Platform,
  Properties,
  PropertyDetails,
  PropertyEditor,
  Privacy,
  PropertyList,
  Results,
  Sell,
  Team,
  TenantSettingsPage,
} from './lazyPages'

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
      { path: 'privacidade', element: withSuspense(<Privacy />) },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    // Página profissional do corretor: layout próprio (o corretor é a marca); a página do imóvel é a mesma do site.
    path: 'corretor/:brokerSlug',
    element: withSuspense(<BrokerLayout />),
    errorElement: <NotFound />,
    children: [
      { index: true, element: withSuspense(<BrokerProfile />) },
      { path: 'imovel/:slug', element: withSuspense(<PropertyDetails />) },
      { path: '*', element: withSuspense(<BrokerProfile />) },
    ],
  },
  {
    // Painel da imobiliária (fora do layout público).
    element: withSuspense(<AuthRoot />),
    errorElement: <NotFound />,
    children: [
      { path: 'entrar', element: withSuspense(<Login />) },
      {
        path: 'dashboard',
        element: withSuspense(<DashboardLayout />),
        children: [
          { index: true, element: withSuspense(<DashboardHome />) },
          { path: 'imoveis', element: withSuspense(<PropertyList />) },
          { path: 'imoveis/novo', element: withSuspense(<PropertyEditor />) },
          { path: 'imoveis/:id', element: withSuspense(<PropertyEditor />) },
          { path: 'contatos', element: withSuspense(<LeadList />) },
          { path: 'contatos/novo', element: withSuspense(<LeadDetail />) },
          { path: 'contatos/:id', element: withSuspense(<LeadDetail />) },
          { path: 'resultados', element: withSuspense(<Results />) },
          { path: 'equipe', element: withSuspense(<Team />) },
          { path: 'conta', element: withSuspense(<Account />) },
          { path: 'imobiliaria', element: withSuspense(<TenantSettingsPage />) },
          { path: 'mais', element: withSuspense(<More />) },
          { path: 'plataforma', element: withSuspense(<Platform />) },
          { path: '*', element: withSuspense(<DashboardHome />) },
        ],
      },
    ],
  },
])
