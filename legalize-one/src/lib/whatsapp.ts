import { getTenant } from '@/tenant/store'

/** Link do WhatsApp da imobiliária ativa (número e mensagem padrão vêm da configuração do tenant). */
export function whatsappLink(message?: string): string {
  const { whatsapp, whatsappMessage } = getTenant().contact
  const number = whatsapp.replace(/\D/g, '')
  return `https://wa.me/${number}?text=${encodeURIComponent(message ?? whatsappMessage)}`
}
