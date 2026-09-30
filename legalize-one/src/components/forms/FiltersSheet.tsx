import { useMemo, useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { bedroomOptions, priceRanges, propertyTypeOptions } from '@/data/filters'
import { getLocalCatalog } from '@/services/propertyService'
import type { PropertyFilters } from '@/types/filters'
import type { PropertyPurpose } from '@/types/property'
import { cn } from '@/utils/cn'
import { filterProperties } from '@/utils/filterProperties'

interface FiltersSheetProps {
  open: boolean
  filters: PropertyFilters
  onClose: () => void
  onApply: (filters: PropertyFilters) => void
}

const purposes: { value: PropertyPurpose; label: string }[] = [
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
]

/**
 * Filtros avançados no mobile (bottom sheet): opções como chips grandes e
 * contagem ao vivo no botão de aplicar. Edita um rascunho — nada muda até "Ver imóveis".
 */
export function FiltersSheet({ open, filters, onClose, onApply }: FiltersSheetProps) {
  const [draft, setDraft] = useState(filters)
  const [openedWith, setOpenedWith] = useState<PropertyFilters | null>(null)
  if (open && openedWith !== filters) {
    setOpenedWith(filters)
    setDraft(filters)
  }

  const count = useMemo(() => filterProperties(getLocalCatalog(), draft).length, [draft])
  const set = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => setDraft((d) => ({ ...d, [key]: value }))

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Filtrar imóveis"
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, type: '', priceRange: '', bedrooms: 0 }))}
            className="h-12 rounded-full px-5 text-[15px] font-semibold text-navy-800 underline-offset-4 hover:underline"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            disabled={count === 0}
            className="h-12 flex-1 rounded-full bg-navy-800 text-[15px] font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-50"
          >
            {count === 0 ? 'Nenhum imóvel' : `Ver ${count} ${count === 1 ? 'imóvel' : 'imóveis'}`}
          </button>
        </div>
      }
    >
      <div className="space-y-6 pt-1">
        <ChipGroup
          label="Finalidade"
          value={draft.purpose}
          options={purposes}
          onChange={(v) => setDraft((d) => ({ ...d, purpose: v, priceRange: '' }))}
          equal
        />
        <ChipGroup
          label="Tipo de imóvel"
          value={draft.type}
          options={propertyTypeOptions}
          onChange={(v) => set('type', v)}
        />
        <ChipGroup
          label="Faixa de preço"
          value={draft.priceRange}
          options={priceRanges[draft.purpose].map((r) => ({ value: r.id, label: r.label }))}
          onChange={(v) => set('priceRange', v)}
        />
        <ChipGroup
          label="Quartos"
          value={String(draft.bedrooms)}
          options={bedroomOptions.map((o) => ({ ...o, label: o.value === '0' ? 'Todos' : `${o.value}+` }))}
          onChange={(v) => set('bedrooms', Number(v))}
          equal
        />
      </div>
    </BottomSheet>
  )
}

interface ChipGroupProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  /** Opções em colunas iguais (segmentado). */
  equal?: boolean
}

function ChipGroup<T extends string>({ label, value, options, onChange, equal }: ChipGroupProps<T>) {
  return (
    <fieldset>
      <legend className="text-[13px] font-semibold text-navy-950">{label}</legend>
      <div
        role="radiogroup"
        aria-label={label}
        className={cn('mt-2.5 gap-2', equal ? 'grid auto-cols-fr grid-flow-col' : 'flex flex-wrap')}
      >
        {options.map((opt) => {
          const selected = opt.value === value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={cn(
                'min-h-11 rounded-full border px-4 text-[14px] font-medium transition-colors',
                selected
                  ? 'border-navy-950 bg-navy-950 text-white'
                  : 'border-navy-950/15 text-navy-950 hover:border-navy-950/35',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
