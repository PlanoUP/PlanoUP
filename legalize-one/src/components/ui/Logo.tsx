import { Link } from 'react-router'
import { cn } from '@/utils/cn'

interface LogoProps {
  tone?: 'dark' | 'light'
  className?: string
}

/** Marca LEGALIZE — casa com documento, remetendo a "do documento à chave". */
export function Logo({ tone = 'dark', className }: LogoProps) {
  const main = tone === 'dark' ? '#071B2E' : '#FFFFFF'
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
