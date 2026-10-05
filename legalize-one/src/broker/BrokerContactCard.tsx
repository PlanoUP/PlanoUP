import { Link } from 'react-router'
import { cn } from '@/utils/cn'
import { BrokerAvatar } from './BrokerAvatar'
import type { BrokerProfile } from './types'

/** "Gostou deste imóvel?" — quem atende é o corretor dono da página. */
export function BrokerContactCard({ broker, className }: { broker: BrokerProfile; className?: string }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Link to={`/corretor/${broker.slug}`} className="shrink-0" aria-label={`Perfil de ${broker.name}`}>
        <BrokerAvatar name={broker.name} photoUrl={broker.photoUrl} className="size-16 text-[20px] ring-2 ring-white shadow-card" />
      </Link>
      <div className="min-w-0">
        <p className="font-display text-[17px] font-bold tracking-[-0.02em] text-navy-950">Gostou deste imóvel?</p>
        <p className="mt-0.5 truncate text-[14.5px] font-semibold text-navy-950">{broker.name}</p>
        {broker.creci && <p className="truncate text-[12.5px] text-slate">{broker.creci}</p>}
      </div>
    </div>
  )
}
