import { Box, Eye, LayoutGrid, Undo2 } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Model3DConfig, Model3DMode } from '@/types/model3d'
import { cn } from '@/utils/cn'
import type { Model3DView } from './cameraGoals'

interface Property3DToolbarProps {
  config: Model3DConfig
  view: Model3DView
  onChange: (view: Model3DView) => void
}

const modes: { id: Model3DMode; label: string; icon: typeof Box }[] = [
  { id: 'exterior', label: 'Exterior', icon: Box },
  { id: 'plan', label: 'Planta', icon: LayoutGrid },
  { id: 'tour', label: 'Visita', icon: Eye },
]

const modeOf = (view: Model3DView): Model3DMode =>
  view.kind === 'plan' ? 'plan' : view.kind === 'viewpoint' ? 'tour' : 'exterior'

/** Barra de modos: Exterior · Planta (pavimentos) · Visita (pontos de vista). Rolável no celular. */
export function Property3DToolbar({ config, view, onChange }: Property3DToolbarProps) {
  const mode = modeOf(view)
  const levels = config.planLevels ?? []
  const viewpoints = config.viewpoints ?? []

  function selectMode(next: Model3DMode) {
    if (next === 'exterior') onChange({ kind: 'exterior' })
    else if (next === 'plan') onChange({ kind: 'plan', levelId: levels[1]?.id ?? levels[0]?.id ?? 'default' })
    else onChange({ kind: 'viewpoint', id: viewpoints[0]?.id ?? 'geral' })
  }

  return (
    <div className="flex flex-col items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
      {/* Sub-opções do modo atual */}
      {mode === 'plan' && (
        <div className="flex max-w-full flex-wrap items-center justify-center gap-2 px-1">
          {levels.length > 1 &&
            levels.map((level) => (
              <Chip
                key={level.id}
                selected={view.kind === 'plan' && view.levelId === level.id}
                onClick={() => onChange({ kind: 'plan', levelId: level.id })}
              >
                {level.label}
              </Chip>
            ))}
          <button
            type="button"
            onClick={() => onChange({ kind: 'exterior' })}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-gold-400/50 bg-navy-950/70 px-4 text-[13px] font-semibold text-gold-400 backdrop-blur-md hover:bg-navy-950/90"
          >
            <Undo2 className="size-4" aria-hidden="true" />
            Voltar para perspectiva
          </button>
        </div>
      )}
      {mode === 'tour' && viewpoints.length > 0 && (
        <div className="no-scrollbar flex max-w-full items-center gap-2 overflow-x-auto px-1" role="group" aria-label="Pontos de vista">
          {viewpoints.map((vp) => (
            <Chip
              key={vp.id}
              selected={view.kind === 'viewpoint' && view.id === vp.id}
              onClick={() => onChange({ kind: 'viewpoint', id: vp.id })}
            >
              {vp.label}
            </Chip>
          ))}
        </div>
      )}

      {/* Modos */}
      <div role="tablist" aria-label="Modo de visualização" className="flex gap-1 rounded-full border border-white/15 bg-navy-950/75 p-1 shadow-2xl backdrop-blur-md">
        {modes.map(({ id, label, icon: Icon }) => {
          const selected = mode === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => selectMode(id)}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition-colors sm:px-5',
                selected ? 'bg-white text-navy-950' : 'text-white/85 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[13px] font-semibold whitespace-nowrap backdrop-blur-md transition-colors',
        selected ? 'bg-gold-500 text-navy-950' : 'border border-white/20 bg-navy-950/70 text-white hover:bg-navy-950/90',
      )}
    >
      {children}
    </button>
  )
}
