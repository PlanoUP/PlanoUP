import { Link } from 'react-router'
import { platform } from '@/config/site'
import { cn } from '@/utils/cn'

/** Marca da plataforma (painel do administrador): símbolo de impulso + "Impulsi" "go". */
export function ImpulsigoLogo({ to = '/dashboard', className }: { to?: string; className?: string }) {
  return (
    <Link to={to} aria-label={`${platform.name} — central da plataforma`} className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 40 40" className="size-10 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="ipg-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2563eb" />
            <stop offset="1" stopColor="#0b1f4d" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#ipg-bg)" />
        {/* Duas setas subindo: impulso */}
        <path d="M11 25.5 20 16.5l9 9" fill="none" stroke="#7dd3fc" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.5 18 20 11.5l6.5 6.5" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
        <circle cx="20" cy="30" r="2.2" fill="#38bdf8" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-navy-950">
          {platform.name.slice(0, -2)}
          <span className="text-navy-700">{platform.name.slice(-2)}</span>
        </span>
        <span className="mt-1 text-[8.5px] font-semibold tracking-[0.22em] text-slate uppercase">Central da plataforma</span>
      </span>
    </Link>
  )
}
