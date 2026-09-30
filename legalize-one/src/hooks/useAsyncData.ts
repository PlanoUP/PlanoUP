import { useEffect, useState, type DependencyList } from 'react'

interface AsyncState<T> {
  data: T | undefined
  loading: boolean
  error: Error | null
}

/**
 * Executa uma função assíncrona (serviço de dados) e expõe loading/erro.
 * Descarta respostas obsoletas quando as dependências mudam.
 */
export function useAsyncData<T>(loader: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: null })

  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, loading: true, error: null }))
    loader()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error: unknown) =>
        active &&
        setState({ data: undefined, loading: false, error: error instanceof Error ? error : new Error(String(error)) }),
      )
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
