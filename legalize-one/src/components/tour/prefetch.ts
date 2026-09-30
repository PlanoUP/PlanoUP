/** Import dinâmico do modo imersivo (chunk separado). */
export const loadImmersiveTour = () => import('./ImmersiveTour')

/** Antecipa o download do modo imersivo (hover/foco/visibilidade da entrada). */
export function prefetchImmersiveTour() {
  void loadImmersiveTour()
}
