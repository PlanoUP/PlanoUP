import { lazy } from 'react'

// Páginas secundárias carregadas sob demanda (code splitting por rota).
export const Properties = lazy(() => import('@/pages/Properties'))
export const PropertyDetails = lazy(() => import('@/pages/PropertyDetails'))
export const Sell = lazy(() => import('@/pages/Sell'))

// Área logada (painel): nada disso é baixado por quem só navega no site.
export const AuthRoot = lazy(() => import('@/pages/auth/AuthRoot'))
export const Login = lazy(() => import('@/pages/auth/Login'))
export const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome'))
