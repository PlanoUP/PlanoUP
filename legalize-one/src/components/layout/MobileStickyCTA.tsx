import { Search } from 'lucide-react'
import { Link } from 'react-router'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { track } from '@/lib/analytics'
import { whatsappLink } from '@/lib/whatsapp'

/** Barra de ações fixa no rodapé — apenas em telas pequenas. */
export function MobileStickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-950/10 bg-white/95 backdrop-blur-md md:hidden">
      <div className="pb-safe">
        <div className="grid grid-cols-2 gap-2.5 px-4 py-3">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('whatsapp_clicked', { placement: 'mobile_sticky' })}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#1f8a5b]/25 bg-[#effaf4] text-[14px] font-semibold text-[#136b44] active:scale-[0.98]"
          >
            <WhatsAppIcon className="size-5" />
            WhatsApp
          </a>
          <Link
            to="/imoveis"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-navy-800 text-[14px] font-semibold text-white active:scale-[0.98]"
          >
            <Search className="size-[18px]" />
            Encontrar imóvel
          </Link>
        </div>
      </div>
    </div>
  )
}
