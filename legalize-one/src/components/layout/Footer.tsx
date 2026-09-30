import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router'
import { Logo } from '@/components/ui/Logo'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { site } from '@/config/site'
import { whatsappLink } from '@/lib/whatsapp'

const columns = [
  {
    title: 'Imóveis',
    links: [
      { label: 'Comprar', to: '/imoveis?finalidade=venda' },
      { label: 'Alugar', to: '/imoveis?finalidade=aluguel' },
      { label: 'Casas em condomínio', to: '/imoveis?tipo=casa-condominio' },
      { label: 'Apartamentos', to: '/imoveis?tipo=apartamento' },
    ],
  },
  {
    title: 'Legalize',
    links: [
      { label: 'Vender meu imóvel', to: '/vender' },
      { label: 'Tour 3D', to: '/#tour-3d' },
      { label: 'Documentação', to: '/#documentacao' },
      { label: 'Sobre', to: '/#sobre' },
    ],
  },
]

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer id="contato" className="bg-navy-950 text-white">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1.3fr] md:gap-12 md:py-16">
        <div className="col-span-2 md:col-span-1">
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
            Do documento à chave. Imóveis selecionados com análise documental e assessoria completa em Natal e
            Parnamirim.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="eyebrow text-gold-400">{col.title}</p>
            <ul className="mt-3 md:mt-4 md:space-y-0.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="inline-flex min-h-10 items-center text-sm text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 md:col-span-1">
          <p className="eyebrow text-gold-400">Contato</p>
          <ul className="mt-3 space-y-1 text-sm text-white/70 md:mt-4">
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2.5 hover:text-white">
                <WhatsAppIcon className="size-4 text-gold-400" />
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex min-h-10 items-center gap-2.5 break-all hover:text-white">
                <Mail className="size-4 text-gold-400" />
                {site.email}
              </a>
            </li>
            <li className="flex min-h-10 items-center gap-2.5">
              <MapPin className="size-4 text-gold-400" />
              {site.address}
            </li>
            <li className="flex min-h-10 items-center gap-2.5">
              <Phone className="size-4 text-gold-400" />
              Seg. a sáb., 8h às 18h
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/45 sm:flex-row sm:justify-between">
          <p>
            © {YEAR} {site.company}. {site.creci}.
          </p>
          <p>Legalize One · Plataforma imobiliária</p>
        </div>
      </div>
    </footer>
  )
}
