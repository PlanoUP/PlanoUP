import { Box, DoorOpen, LayoutGrid, Maximize, Minimize, Undo2, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Model3DConfig } from '@/types/model3d'
import { cn } from '@/utils/cn'
import type { Model3DView } from './cameraGoals'

export interface FullscreenControl {
  active: boolean
  toggle: () => void
}

interface Property3DToolbarProps {
  config: Model3DConfig
  view: Model3DView
  onChange: (view: Model3DView) => void
  onOpenRooms: () => void
  /** `null` quando não se aplica (ex.: iPhone, que não tem tela cheia de elemento). */
  fullscreen: FullscreenControl | null
}

/** Planta abre sem cortes (vista superior estável); os pavimentos cortados são opcionais. */
function defaultPlanLevel(config: Model3DConfig) {
  return config.planLevels?.[0]?.id ?? 'default'
}

/**
 * Barra principal: Visão geral · Planta · Ambientes · Tela cheia.
 * No celular vira uma "tab bar" (ícone sobre o texto); no desktop, pílulas.
 */
export function Property3DToolbar({ config, view, onChange, onOpenRooms, fullscreen }: Property3DToolbarProps) {
  const levels = config.planLevels ?? []

  return (
    <div className="flex flex-col items-center gap-2 sm:items-start" onPointerDown={(e) => e.stopPropagation()}>
      {view.kind === 'plan' && (
        <div className="flex max-w-full flex-wrap items-center justify-center gap-2 sm:justify-start" role="group" aria-label="Pavimentos">
          {levels.length > 1 &&
            levels.map((level) => (
              <Chip
                key={level.id}
                selected={view.levelId === level.id}
                onClick={() => onChange({ kind: 'plan', levelId: level.id })}
              >
                {level.label}
              </Chip>
            ))}
          <button
            type="button"
            onClick={() => onChange({ kind: 'overview' })}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-navy-950 px-4 text-[13px] font-semibold text-white shadow-md hover:bg-navy-800"
          >
            <Undo2 className="size-4" aria-hidden="true" />
            Voltar à perspectiva
          </button>
        </div>
      )}

      <div
        role="toolbar"
        aria-label="Modos do modelo 3D"
        className="flex w-full gap-1 rounded-2xl border border-navy-950/10 bg-white/92 p-1 shadow-[0_10px_30px_-12px_rgb(7_27_46/0.35)] backdrop-blur-md sm:w-auto sm:rounded-full"
      >
        <ToolButton
          icon={Box}
          label="Visão geral"
          selected={view.kind === 'overview'}
          onClick={() => onChange({ kind: 'overview' })}
        />
        <ToolButton
          icon={LayoutGrid}
          label="Planta"
          selected={view.kind === 'plan'}
          onClick={() => onChange({ kind: 'plan', levelId: defaultPlanLevel(config) })}
        />
        {(config.viewpoints?.length ?? 0) > 0 && (
          <ToolButton icon={DoorOpen} label="Ambientes" selected={view.kind === 'viewpoint'} onClick={onOpenRooms} haspopup />
        )}
        {fullscreen && (
          <ToolButton
            icon={fullscreen.active ? Minimize : Maximize}
            label={fullscreen.active ? 'Sair da tela cheia' : 'Tela cheia'}
            shortLabel={fullscreen.active ? 'Sair' : 'Tela cheia'}
            selected={false}
            onClick={fullscreen.toggle}
          />
        )}
      </div>
    </div>
  )
}

function ToolButton({
  icon: Icon,
  label,
  shortLabel,
  selected,
  onClick,
  haspopup,
}: {
  icon: LucideIcon
  label: string
  shortLabel?: string
  selected: boolean
  onClick: () => void
  haspopup?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={haspopup ? undefined : selected}
      aria-haspopup={haspopup ? 'dialog' : undefined}
      aria-current={haspopup && selected ? 'true' : undefined}
      aria-label={shortLabel ? label : undefined}
      className={cn(
        'inline-flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[11.5px] font-semibold whitespace-nowrap transition-colors sm:min-h-11 sm:flex-none sm:flex-row sm:gap-2 sm:rounded-full sm:px-4 sm:text-[13.5px]',
        selected ? 'bg-navy-950 text-white' : 'text-navy-950/80 hover:bg-navy-950/6 hover:text-navy-950',
      )}
    >
      <Icon className="size-[18px] sm:size-4" aria-hidden="true" />
      <span className="sm:hidden">{shortLabel ?? label}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[13px] font-semibold whitespace-nowrap shadow-sm backdrop-blur-md transition-colors',
        selected ? 'bg-gold-500 text-navy-950' : 'border border-navy-950/10 bg-white/92 text-navy-950 hover:bg-white',
      )}
    >
      {children}
    </button>
  )
}
