import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router'
import { Logo } from '@/components/ui/Logo'
import { PlatformMark } from '@/components/ui/PlatformMark'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { whatsappLink } from '@/lib/whatsapp'
import { isDefaultBrand } from '@/tenant/defaultTenant'
import { useTenant } from '@/tenant/store'

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
    title: '',
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
  const tenant = useTenant()
  const { contact } = tenant
  return (
    // No celular, o espaço do CTA fixo fica dentro do rodapé (sem faixa branca abaixo dele).
    <footer id="contato" className="bg-navy-950 pb-[calc(72px+env(safe-area-inset-bottom))] text-white md:pb-0">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1.3fr] md:gap-12 md:py-16">
        <div className="col-span-2 md:col-span-1">
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
            {isDefaultBrand(tenant)
              ? 'Do documento à chave. Imóveis selecionados com análise documental e assessoria completa em Natal e Parnamirim.'
              : tenant.tagline}
          </p>
        </div>

        {columns.map((col, i) => (
          <div key={i}>
            <p className="eyebrow text-gold-400">{col.title || tenant.name}</p>
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
            {contact.whatsapp && (
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2.5 hover:text-white">
                  <WhatsAppIcon className="size-4 text-gold-400" />
                  {contact.phoneDisplay}
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="inline-flex min-h-10 items-center gap-2.5 break-all hover:text-white">
                  <Mail className="size-4 text-gold-400" />
                  {contact.email}
                </a>
              </li>
            )}
            {contact.address && (
              <li className="flex min-h-10 items-center gap-2.5">
                <MapPin className="size-4 text-gold-400" />
                {contact.address}
              </li>
            )}
            {contact.businessHours && (
              <li className="flex min-h-10 items-center gap-2.5">
                <Phone className="size-4 text-gold-400" />
                {contact.businessHours}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/45 sm:flex-row sm:justify-between">
          <p>
            © {YEAR} {tenant.legalName}.{tenant.creci && ` ${tenant.creci}.`}
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/privacidade" className="hover:text-white/80">
              Política de privacidade
            </Link>
            <PlatformMark tone="light" />
          </p>
        </div>
      </div>
    </footer>
  )
}
