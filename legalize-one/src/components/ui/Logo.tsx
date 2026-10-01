import { Link } from 'react-router'
import { isDefaultBrand } from '@/tenant/defaultTenant'
import { useTenant } from '@/tenant/store'
import { cn } from '@/utils/cn'

interface LogoProps {
  tone?: 'dark' | 'light'
  className?: string
}

/**
 * Logo da imobiliária ativa: arquivo enviado no painel; senão, a marca LEGALIZE em SVG
 * (imobiliária padrão); senão, o nome em texto no mesmo estilo.
 */
export function Logo({ tone = 'dark', className }: LogoProps) {
  const tenant = useTenant()
  const main = tone === 'dark' ? '#071B2E' : '#FFFFFF'
  if (tenant.branding.logoUrl) {
    return (
      <Link to="/" aria-label={`${tenant.name} — início`} className={cn('inline-flex items-center', className)}>
        <img
          src={tenant.branding.logoUrl}
          alt=""
          className={cn('h-10 w-auto max-w-[200px] object-contain', tone === 'light' && 'brightness-0 invert')}
        />
      </Link>
    )
  }
  if (!isDefaultBrand(tenant)) {
    return (
      <Link to="/" aria-label={`${tenant.name} — início`} className={cn('inline-flex flex-col leading-none', className)}>
        <span className="font-display text-[22px] font-extrabold tracking-[0.02em] uppercase" style={{ color: main }}>
          {tenant.name}
        </span>
        {tenant.creci && (
          <span className={cn('mt-1 text-[8.5px] font-semibold tracking-[0.22em]', tone === 'dark' ? 'text-navy-950/80' : 'text-white/70')}>
            {tenant.creci}
          </span>
        )}
      </Link>
    )
  }
  return (
    <Link to="/" aria-label="Legalize Soluções Imobiliárias — início" className={cn('group inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 48 44" className="h-10 w-11 shrink-0" aria-hidden="true">
        <path d="M4 20 24 4l14 11.2" fill="none" stroke={main} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M34 8v6" stroke={main} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M8 19v21h22" fill="none" stroke={main} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="23" y="17" width="20" height="24" rx="2.5" fill="none" stroke="#D9B47A" strokeWidth="3" />
        <path d="M27.5 24h11M27.5 29h11M27.5 34h7" stroke="#D9B47A" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M13 26h5v5h-5z" fill={main} />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[22px] font-extrabold tracking-[0.02em]" style={{ color: main }}>
          LEGALIZE
        </span>
        <span className={cn('mt-1 text-[8.5px] font-semibold tracking-[0.22em]', tone === 'dark' ? 'text-navy-950/80' : 'text-white/70')}>
          SOLUÇÕES IMOBILIÁRIAS
        </span>
      </span>
    </Link>
  )
}
