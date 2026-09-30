import { useEffect, useRef } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'
import { resizeImage } from '@/lib/images'
import type { TourScene } from '@/types/tour'
import { cn } from '@/utils/cn'

interface SceneThumbnailsProps {
  scenes: TourScene[]
  activeId: string
  onSelect: (sceneId: string) => void
}

export function SceneThumbnails({ scenes, activeId, onSelect }: SceneThumbnailsProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // Mantém a miniatura ativa visível no mobile.
  useEffect(() => {
    const list = listRef.current
    const active = list?.querySelector<HTMLElement>('[aria-current="true"]')
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
      className="no-scrollbar flex min-w-0 gap-2 overflow-x-auto"
    >
      {scenes.map((scene) => {
        const active = scene.id === activeId
        return (
          <button
            key={scene.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-current={active ? 'true' : undefined}
            onClick={() => onSelect(scene.id)}
            className={cn(
              'group/th relative h-[58px] w-[84px] shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-[64px] sm:w-[96px]',
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
            <span className="absolute inset-x-1 bottom-1 truncate text-center text-[10.5px] font-semibold text-white">
              {scene.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
