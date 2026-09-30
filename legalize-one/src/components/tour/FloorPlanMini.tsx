import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { TourFloor, TourScene } from '@/types/tour'
import { cn } from '@/utils/cn'

interface FloorPlanMiniProps {
  floors: TourFloor[]
  floorId: string
  onFloorChange: (floorId: string) => void
  scenes: TourScene[]
  activeScene: TourScene
  onSceneSelect: (sceneId: string) => void
  className?: string
}

/** Mini planta baixa com indicador de posição e direção da câmera. */
export function FloorPlanMini({
  floors,
  floorId,
  onFloorChange,
  scenes,
  activeScene,
  onSceneSelect,
  className,
}: FloorPlanMiniProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const floor = floors.find((f) => f.id === floorId) ?? floors[0]

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [menuOpen])

  const activeRoom = activeScene.floorId === floor.id ? floor.rooms.find((r) => r.id === activeScene.roomId) : undefined
  const sceneByRoom = new Map(scenes.filter((s) => s.floorId === floor.id).map((s) => [s.roomId, s]))

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className={cn('rounded-xl border border-white/15 bg-navy-950/70 p-2.5 text-white shadow-xl backdrop-blur-md', className)}
    >
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          className="flex w-full items-center justify-between gap-2 rounded-md px-1.5 py-1 text-[12px] font-semibold hover:bg-white/10"
        >
          {floor.label}
          <ChevronDown className={cn('size-3.5 transition-transform', menuOpen && 'rotate-180')} />
        </button>
        {menuOpen && (
          <ul
            role="listbox"
            aria-label="Pavimento"
            className="absolute top-full right-0 left-0 z-20 mt-1 animate-pop overflow-hidden rounded-lg border border-white/15 bg-navy-950/95 py-1 backdrop-blur-md"
          >
            {floors.map((f) => (
              <li key={f.id} role="option" aria-selected={f.id === floor.id}>
                <button
                  type="button"
                  onClick={() => {
                    onFloorChange(f.id)
                    setMenuOpen(false)
                  }}
                  className="flex w-full items-center justify-between px-2.5 py-1.5 text-left text-[12px] hover:bg-white/10"
                >
                  {f.label}
                  {f.id === floor.id && <Check className="size-3.5 text-gold-400" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <svg viewBox="0 0 100 100" className="mt-1.5 block aspect-square w-full" role="group" aria-label={`Planta — ${floor.label}`}>
        <rect x="1" y="1" width="98" height="98" fill="none" stroke="rgb(255 255 255 / 0.2)" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
        {floor.rooms.map((room) => {
          const scene = sceneByRoom.get(room.id)
          const isActive = activeRoom?.id === room.id
          return (
            <g
              key={room.id}
              onClick={scene ? () => onSceneSelect(scene.id) : undefined}
              className={scene ? 'cursor-pointer' : undefined}
              role={scene ? 'button' : undefined}
              aria-label={scene ? `Ir para ${scene.label}` : undefined}
            >
              <rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill={isActive ? 'rgb(217 180 122 / 0.28)' : scene ? 'rgb(255 255 255 / 0.06)' : 'transparent'}
                stroke="white"
                strokeWidth={1.4}
                className="transition-[fill] duration-300 hover:fill-white/15"
              />
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 + (isActive ? 9 : 1.6)}
                textAnchor="middle"
                fontSize="4.6"
                fill="rgb(255 255 255 / 0.7)"
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
            <g transform={`rotate(${activeScene.heading})`} className="transition-transform duration-500">
              <path d="M0 0 L-9 -18 A20 20 0 0 1 9 -18 Z" fill="rgb(230 197 141 / 0.45)" />
            </g>
            <circle r="4.6" fill="#D9B47A" stroke="white" strokeWidth="1.4" />
            <circle r="1.6" fill="white" />
          </g>
        )}
      </svg>
    </div>
  )
}
