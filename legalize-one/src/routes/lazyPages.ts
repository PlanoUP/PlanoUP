import { lazy } from 'react'

// Páginas secundárias carregadas sob demanda (code splitting por rota).
export const Properties = lazy(() => import('@/pages/Properties'))
export const PropertyDetails = lazy(() => import('@/pages/PropertyDetails'))
export const Sell = lazy(() => import('@/pages/Sell'))

// Área logada (painel): nada disso é baixado por quem só navega no site.
export const AuthRoot = lazy(() => import('@/pages/auth/AuthRoot'))
export const Login = lazy(() => import('@/pages/auth/Login'))
export const DashboardLayout = lazy(() => import('@/pages/dashboard/DashboardLayout'))
export const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome'))
export const PropertyList = lazy(() => import('@/pages/dashboard/PropertyList'))
export const PropertyEditor = lazy(() => import('@/pages/dashboard/PropertyEditor'))
export const LeadList = lazy(() => import('@/pages/dashboard/LeadList'))
export const LeadDetail = lazy(() => import('@/pages/dashboard/LeadDetail'))
