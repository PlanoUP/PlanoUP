import { Component, type ReactNode } from 'react'
import { track } from '@/lib/analytics'

interface Props {
  fallback: ReactNode
  children: ReactNode
}

interface State {
  failed: boolean
}

/** Captura falhas de renderização do WebGL/modelo e mostra a alternativa (fotos / visita). */
export class Property3DErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    track('model3d_load_failed', { reason: 'render', message: error.message.slice(0, 120) })
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
