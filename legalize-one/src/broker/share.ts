/** Compartilhar no celular (menu nativo) ou copiar o link no computador. */
export async function shareLink(input: { title: string; text?: string; url: string }): Promise<'shared' | 'copied' | 'cancelled'> {
  try {
    if (navigator.share) {
      await navigator.share(input)
      return 'shared'
    }
    await navigator.clipboard.writeText(input.url)
    return 'copied'
  } catch {
    return 'cancelled'
  }
}

export async function copyLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}

/** Abre o WhatsApp para a pessoa escolher com quem compartilhar. */
export function whatsappShareHref(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`
}

export function absoluteUrl(path: string): string {
  return new URL(path, window.location.origin).toString()
}
