import { cn } from '@/utils/cn'

/** Foto do corretor; sem foto, as iniciais sobre a cor principal. */
export function BrokerAvatar({ name, photoUrl, className }: { name: string; photoUrl: string | null; className?: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  return photoUrl ? (
    <img src={photoUrl} alt={`Foto de ${name}`} className={cn('rounded-full bg-sand object-cover', className)} loading="eager" decoding="async" />
  ) : (
    <span aria-hidden="true" className={cn('flex items-center justify-center rounded-full bg-navy-950 font-display font-bold text-white', className)}>
      {initials}
    </span>
  )
}
