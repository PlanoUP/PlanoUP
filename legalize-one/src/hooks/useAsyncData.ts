import { useEffect, useEffectEvent, useState } from 'react'

interface AsyncState<T> {
  data: T | undefined
  loading: boolean
  error: Error | null
}

interface Resolved<T> {
  key: string
  data: T | undefined
  error: Error | null
}

/**
 * Executa uma função assíncrona (serviço de dados) e expõe loading/erro.
 * `key` identifica a consulta: quando muda, a função é executada novamente.
 * Enquanto a nova consulta carrega, o último resultado continua disponível em `data`;
 * respostas obsoletas são descartadas.
 */
export function useAsyncData<T>(loader: () => Promise<T>, key: string): AsyncState<T> {
  const [resolved, setResolved] = useState<Resolved<T> | null>(null)
  const load = useEffectEvent(loader)

  useEffect(() => {
    let active = true
    load()
      .then((data) => {
        if (active) setResolved({ key, data, error: null })
      })
      .catch((error: unknown) => {
        if (active)
          setResolved({ key, data: undefined, error: error instanceof Error ? error : new Error(String(error)) })
      })
    return () => {
      active = false
    }
  }, [key])

  return {
    data: resolved?.data,
    loading: resolved?.key !== key,
    error: resolved?.key === key ? resolved.error : null,
  }
}
