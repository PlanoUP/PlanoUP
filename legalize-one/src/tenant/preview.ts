const KEY = 'site-preview'
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

/**
 * Pré-visualização: `?previa=<endereço-curto>` abre o site de uma imobiliária que ainda não tem
 * domínio próprio (fica guardado na aba); `?previa=sair` volta ao site do domínio.
 */
export function previewSlug(search: string = window.location.search): string | null {
  const raw = new URLSearchParams(search).get('previa')
  const slug = raw?.trim().toLowerCase() ?? null
  const valid = slug !== null && slug !== 'sair' && SLUG.test(slug) ? slug : null
  try {
    if (raw !== null) {
      if (valid) sessionStorage.setItem(KEY, valid)
      else sessionStorage.removeItem(KEY)
      return valid
    }
    return sessionStorage.getItem(KEY)
  } catch {
    return valid
  }
}

export function clearPreview(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* sem armazenamento: nada a limpar */
  }
}
