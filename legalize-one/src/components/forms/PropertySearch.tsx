import { Search } from 'lucide-react'
import { useId, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { bedroomOptions, priceRanges, propertyTypeOptions } from '@/data/filters'
import { track } from '@/lib/analytics'
import { getLocalCatalog } from '@/services/propertyService'
import type { PropertyFilters } from '@/types/filters'
import type { PropertyPurpose } from '@/types/property'
import { cn } from '@/utils/cn'
import { defaultFilters, filtersToSearchParams, getRegionSuggestions } from '@/utils/filterProperties'
import { RegionInput } from './RegionInput'
import { SearchSelect } from './SearchField'

interface PropertySearchProps {
  /** `hero`: sobreposto ao banner da Home. `panel`: barra de filtros da listagem. */
  variant?: 'hero' | 'panel'
  initialFilters?: Partial<PropertyFilters>
  /** Quando omitido, navega para /imoveis com os filtros na URL. */
  onSearch?: (filters: PropertyFilters) => void
  className?: string
}

const tabs: { value: PropertyPurpose; label: string }[] = [
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
]

export function PropertySearch({ variant = 'hero', initialFilters, onSearch, className }: PropertySearchProps) {
  const navigate = useNavigate()
  const uid = useId()
  const [filters, setFilters] = useState<PropertyFilters>({ ...defaultFilters, ...initialFilters })

  // Sincroniza quando os filtros externos mudam (ex.: navegação pelo histórico).
  const initialKey = JSON.stringify(initialFilters ?? {})
  const [lastKey, setLastKey] = useState(initialKey)
  if (lastKey !== initialKey) {
    setLastKey(initialKey)
    setFilters({ ...defaultFilters, ...initialFilters })
  }

  const regionSuggestions = useMemo(() => getRegionSuggestions(getLocalCatalog()), [])
  const priceOptions = priceRanges[filters.purpose].map((r) => ({ value: r.id, label: r.label }))

  function update<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function changePurpose(purpose: PropertyPurpose) {
    // Faixas de preço dependem da finalidade.
    setFilters((prev) => ({ ...prev, purpose, priceRange: '' }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    track('search_submitted', {
      purpose: filters.purpose,
      region: filters.region,
      type: filters.type,
      price_range: filters.priceRange,
      bedrooms: filters.bedrooms,
    })
    if (onSearch) onSearch(filters)
    else navigate(`/imoveis?${filtersToSearchParams(filters).toString()}`)
  }

  const hero = variant === 'hero'

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)} role="search" aria-label="Buscar imóveis">
      {/* Abas Comprar / Alugar */}
      <div
        role="tablist"
        aria-label="Finalidade"
        className={cn(
          'inline-flex gap-1 p-1.5',
          hero ? 'rounded-t-2xl bg-white pr-2.5 pb-2 pl-4 pt-4' : 'mb-3 rounded-full bg-sand',
        )}
      >
        {tabs.map((tab) => {
          const selected = filters.purpose === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => changePurpose(tab.value)}
              className={cn(
                'h-9 min-w-[104px] rounded-full px-6 text-[13.5px] font-semibold transition-all',
                selected ? 'bg-navy-950 text-white shadow-sm' : 'text-navy-950 hover:bg-navy-950/5',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        className={cn(
          'grid gap-3 bg-white',
          hero
            ? 'rounded-2xl rounded-tl-none p-4 shadow-[0_30px_60px_-30px_rgb(7_27_46/0.45),0_2px_6px_rgb(7_27_46/0.05)] sm:p-5'
            : 'rounded-2xl border border-navy-950/8 p-3 shadow-[var(--shadow-card)]',
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr_auto]',
        )}
      >
        <RegionInput
          id={`${uid}-regiao`}
          value={filters.region}
          suggestions={regionSuggestions}
          onChange={(v) => update('region', v)}
          className="sm:col-span-2 lg:col-span-1"
        />
        <SearchSelect
          id={`${uid}-tipo`}
          label="Tipo de imóvel"
          value={filters.type}
          options={propertyTypeOptions}
          onChange={(v) => update('type', v)}
        />
        <SearchSelect
          id={`${uid}-preco`}
          label="Faixa de preço"
          value={filters.priceRange}
          options={priceOptions}
          onChange={(v) => update('priceRange', v)}
        />
        <SearchSelect
          id={`${uid}-quartos`}
          label="Quartos"
          value={String(filters.bedrooms)}
          options={bedroomOptions}
          onChange={(v) => update('bedrooms', Number(v))}
        />
        <button
          type="submit"
          className="inline-flex h-[60px] items-center justify-center gap-2.5 rounded-xl bg-navy-800 px-7 text-[15px] font-semibold text-white shadow-[0_14px_28px_-14px_rgb(11_49_88/0.9)] transition-all hover:bg-navy-700 active:scale-[0.99] sm:col-span-2 lg:col-span-1"
        >
          <Search className="size-5" strokeWidth={2.2} aria-hidden="true" />
          Buscar imóveis
        </button>
      </div>
    </form>
  )
}
