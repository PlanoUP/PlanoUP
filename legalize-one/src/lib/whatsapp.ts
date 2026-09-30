import { site } from '@/config/site'

export function whatsappLink(message: string = site.whatsappDefaultMessage): string {
  const number = site.whatsappNumber.replace(/\D/g, '')
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
