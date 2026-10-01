/**
 * Pedido de abertura automática do modelo 3D, enviado no `state` da navegação
 * (ex.: "Explorar modelo 3D" na Home). O valor é a origem do clique (analytics).
 * Vale uma única vez: é consumido ao chegar, então recarregar ou voltar não reabre.
 */
export const AUTO_START_3D = 'autoStart3D'

export type AutoStart3DState = { [AUTO_START_3D]?: string }
