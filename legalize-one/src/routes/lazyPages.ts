import { lazy } from 'react'

// Páginas secundárias carregadas sob demanda (code splitting por rota).
export const Properties = lazy(() => import('@/pages/Properties'))
export const PropertyDetails = lazy(() => import('@/pages/PropertyDetails'))
export const Sell = lazy(() => import('@/pages/Sell'))
