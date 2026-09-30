import { MapPin } from 'lucide-react'
import type { TourFloor, TourScene } from '@/types/tour'
import { cn } from '@/utils/cn'

interface FloorPlanProps {
  floors: TourFloor[]
  floorId: string
  onFloorChange: (floorId: string) => void
  scenes: TourScene[]
  activeScene: TourScene
  onSceneSelect: (sceneId: string) => void
  /** `panel`: painel compacto (desktop). `sheet`: versão ampliada (bottom sheet no mobile). */
  size?: 'panel' | 'sheet'
  className?: string
}

/**
 * Planta baixa sincronizada com o ambiente atual: destaca o cômodo, mostra a
 * posição e a direção da câmera e navega para a cena ao tocar em um cômodo.
 */
export function FloorPlan({
  floors,
  floorId,
  onFloorChange,
  scenes,
  activeScene,
  onSceneSelect,
  size = 'panel',
  className,
}: FloorPlanProps) {
  const floor = floors.find((f) => f.id === floorId) ?? floors[0]
  const activeRoom = activeScene.floorId === floor.id ? floor.rooms.find((r) => r.id === activeScene.roomId) : undefined
  const sceneByRoom = new Map(scenes.filter((s) => s.floorId === floor.id).map((s) => [s.roomId, s]))
  const sheet = size === 'sheet'
  const activeFloorLabel = floors.find((f) => f.id === activeScene.floorId)?.label

  return (
    <div className={cn('text-white', className)}>
      {floors.length > 1 && (
        <div role="tablist" aria-label="Pavimento" className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-white/8 p-1">
          {floors.map((f) => {
            const selected = f.id === floor.id
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onFloorChange(f.id)}
                className={cn(
                  'relative rounded-lg font-semibold transition-colors',
                  sheet ? 'h-11 text-[14px]' : 'h-9 text-[12px]',
                  selected ? 'bg-white text-navy-950' : 'text-white/75 hover:bg-white/10 hover:text-white',
                )}
              >
                {f.label}
                {f.id === activeScene.floorId && !selected && (
                  <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-gold-400" aria-label="(você está aqui)" />
                )}
              </button>
            )
          })}
        </div>
      )}

      <svg
        viewBox="0 0 100 100"
        className={cn('mt-2 block aspect-square w-full', sheet && 'mx-auto max-w-[340px]')}
        role="group"
        aria-label={`Planta — ${floor.label}`}
      >
        <rect x="1" y="1" width="98" height="98" fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
        {floor.rooms.map((room) => {
          const scene = sceneByRoom.get(room.id)
          const isActive = activeRoom?.id === room.id
          return (
            <g
              key={room.id}
              onClick={scene && !isActive ? () => onSceneSelect(scene.id) : undefined}
              onKeyDown={
                scene && !isActive
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSceneSelect(scene.id)
                      }
                    }
                  : undefined
              }
              tabIndex={scene && !isActive ? 0 : undefined}
              role={scene ? 'button' : undefined}
              aria-label={scene ? (isActive ? `${scene.label} (você está aqui)` : `Ir para ${scene.label}`) : undefined}
              aria-current={isActive ? 'location' : undefined}
              className={cn('outline-none', scene && !isActive && 'group/room cursor-pointer')}
            >
              <rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                rx="0.8"
                fill={isActive ? 'rgb(217 180 122 / 0.32)' : scene ? 'rgb(255 255 255 / 0.07)' : 'transparent'}
                stroke={isActive ? '#E6C58D' : 'white'}
                strokeOpacity={scene || isActive ? 1 : 0.45}
                strokeWidth={isActive ? 1.6 : 1.1}
                className="transition-[fill] duration-300 group-hover/room:fill-white/18 group-focus-visible/room:fill-white/25"
              />
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 + (isActive ? 10 : 1.6)}
                textAnchor="middle"
                fontSize={sheet ? 4.4 : 4.8}
                fontWeight={isActive ? 700 : 500}
                fill={isActive ? '#E6C58D' : scene ? 'rgb(255 255 255 / 0.85)' : 'rgb(255 255 255 / 0.45)'}
                className="pointer-events-none select-none"
              >
                {room.label}
              </text>
            </g>
          )
        })}
        {activeRoom && (
          <g
            transform={`translate(${activeRoom.x + activeRoom.width / 2} ${activeRoom.y + activeRoom.height / 2 - 2})`}
            className="pointer-events-none"
          >
            <g transform={`rotate(${activeScene.heading})`}>
              <path d="M0 0 L-9 -18 A20 20 0 0 1 9 -18 Z" fill="rgb(230 197 141 / 0.5)" />
            </g>
            <circle r="5" fill="rgb(217 180 122 / 0.45)" className="animate-pulse-ring [transform-box:fill-box] [transform-origin:center]" />
            <circle r="4.4" fill="#D9B47A" stroke="white" strokeWidth="1.4" />
            <circle r="1.5" fill="white" />
          </g>
        )}
      </svg>

      <p className={cn('mt-2 flex items-center gap-1.5 text-white/80', sheet ? 'justify-center text-[14px]' : 'text-[11.5px]')}>
        <MapPin className={cn('shrink-0 text-gold-400', sheet ? 'size-4' : 'size-3.5')} aria-hidden="true" />
        <span className="truncate">
          Você está em <strong className="font-semibold text-white">{activeScene.label}</strong>
          {floor.id !== activeScene.floorId && activeFloorLabel ? ` · ${activeFloorLabel}` : ''}
        </span>
      </p>
    </div>
  )
}
