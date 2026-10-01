/** Caminhos das rotas públicas. */
export const routes = {
  home: '/',
  properties: '/imoveis',
  property: (slug: string) => `/imovel/${slug}`,
  sell: '/vender',
  login: '/entrar',
  dashboard: '/dashboard',
} as const
