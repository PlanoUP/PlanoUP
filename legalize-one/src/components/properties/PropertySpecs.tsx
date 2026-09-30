import { Bath, BedDouble, Car, Ruler } from 'lucide-react'
import type { Property } from '@/types/property'
import { cn } from '@/utils/cn'
import { bedroomLabel, pluralize } from '@/utils/format'

type Specs = Pick<Property, 'area' | 'bedrooms' | 'suites' | 'bathrooms' | 'parking'>

export function PropertySpecs({ property, size = 'sm', className }: { property: Specs; size?: 'sm' | 'md'; className?: string }) {
  const items = [
    { icon: Ruler, label: `${property.area} m²`, title: 'Área privativa' },
    { icon: BedDouble, label: bedroomLabel(property), title: 'Quartos' },
    { icon: Bath, label: pluralize(property.bathrooms, 'banheiro', 'banheiros'), title: 'Banheiros' },
    { icon: Car, label: pluralize(property.parking, 'vaga', 'vagas'), title: 'Vagas de garagem' },
  ]
  return (
    <ul
      className={cn(
        'flex flex-wrap items-center text-slate',
        size === 'sm' ? 'gap-x-3.5 gap-y-1.5 text-[12px]' : 'gap-x-6 gap-y-3 text-[14px]',
        className,
      )}
    >
      {items.map(({ icon: Icon, label, title }) => (
        <li key={title} className="inline-flex items-center gap-1.5" title={title}>
          <Icon className={size === 'sm' ? 'size-3.5' : 'size-[18px]'} strokeWidth={1.7} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  )
}
