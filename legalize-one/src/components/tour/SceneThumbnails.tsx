import { Check } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'
import { resizeImage } from '@/lib/images'
import type { TourScene } from '@/types/tour'
import { cn } from '@/utils/cn'

interface SceneThumbnailsProps {
  scenes: TourScene[]
  activeId: string
  onSelect: (sceneId: string) => void
  /** Ambientes já visitados (marcados com ✓). */
  visited?: ReadonlySet<string>
  size?: 'md' | 'sm'
  className?: string
}

export function SceneThumbnails({ scenes, activeId, onSelect, visited, size = 'md', className }: SceneThumbnailsProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // Mantém a miniatura ativa visível na faixa rolável.
  useEffect(() => {
    const list = listRef.current
    const active = list?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!list || !active) return
    const left = active.offsetLeft - list.clientWidth / 2 + active.clientWidth / 2
    list.scrollTo({ left, behavior: 'smooth' })
  }, [activeId])

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Ambientes"
      onPointerDown={(e) => e.stopPropagation()}
      className={cn('no-scrollbar flex min-w-0 snap-x gap-2 overflow-x-auto overscroll-x-contain', className)}
    >
      {scenes.map((scene) => {
        const active = scene.id === activeId
        const seen = visited?.has(scene.id) && !active
        return (
          <button
            key={scene.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${scene.label}${seen ? ' (visitado)' : ''}`}
            onClick={() => onSelect(scene.id)}
            className={cn(
              'group/th relative shrink-0 snap-start overflow-hidden rounded-lg border-2 transition-all',
              size === 'md' ? 'h-[58px] w-[88px] sm:h-[64px] sm:w-[100px]' : 'h-11 w-[72px]',
              active ? 'border-gold-400 shadow-[0_0_0_3px_rgb(217_180_122/0.25)]' : 'border-white/25 hover:border-white/60',
            )}
          >
            <SmartImage
              src={resizeImage(scene.image, 240)}
              alt=""
              fallback={scene.fallback}
              className="absolute inset-0"
              imgClassName="transition-transform duration-500 group-hover/th:scale-110"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" />
            {seen && (
              <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-white/90 text-navy-950">
                <Check className="size-2.5" strokeWidth={3.5} />
              </span>
            )}
            <span
              className={cn(
                'absolute inset-x-1 bottom-1 truncate text-center font-semibold text-white',
                size === 'md' ? 'text-[10.5px]' : 'text-[9.5px]',
              )}
            >
              {scene.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
