import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/utils/cn'

export function FavoriteButton({ propertyId, className }: { propertyId: string; className?: string }) {
  const { isFavorite, toggle } = useFavorites()
  const active = isFavorite(propertyId)
  return (
    <button
      type="button"
      onClick={() => toggle(propertyId)}
      aria-pressed={active}
      aria-label={active ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-all hover:bg-sand active:scale-90',
        active ? 'text-[#c2410c]' : 'text-navy-950',
        className,
      )}
    >
      <Heart className={cn('size-5 transition-transform', active && 'scale-110 fill-current')} strokeWidth={1.8} />
    </button>
  )
}
