import { Search, SlidersHorizontal } from 'lucide-react'
import { useId, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { bedroomOptions, priceRanges, propertyTypeOptions } from '@/data/filters'
import { useIsSmUp } from '@/hooks/useMediaQuery'
import { track } from '@/lib/analytics'
import { getLocalCatalog } from '@/services/propertyService'
import type { PropertyFilters } from '@/types/filters'
import type { PropertyPurpose } from '@/types/property'
import { cn } from '@/utils/cn'
import { defaultFilters, filtersToSearchParams, getRegionSuggestions } from '@/utils/filterProperties'
import { FiltersSheet } from './FiltersSheet'
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

/**
 * Busca de imóveis.
 * - A partir de `sm`: formulário completo (abas + região + tipo + preço + quartos).
 * - Celular: "Onde você quer morar?" + botão de filtros (bottom sheet) + buscar.
 * Os dois modos compartilham o mesmo estado e os mesmos parâmetros de URL.
 */
export function PropertySearch({ variant = 'hero', initialFilters, onSearch, className }: PropertySearchProps) {
  const navigate = useNavigate()
  const uid = useId()
  const isSmUp = useIsSmUp()
  const [filters, setFilters] = useState<PropertyFilters>({ ...defaultFilters, ...initialFilters })
  const [sheetOpen, setSheetOpen] = useState(false)

  // Sincroniza quando os filtros externos mudam (ex.: navegação pelo histórico).
  const initialKey = JSON.stringify(initialFilters ?? {})
  const [lastKey, setLastKey] = useState(initialKey)
  if (lastKey !== initialKey) {
    setLastKey(initialKey)
    setFilters({ ...defaultFilters, ...initialFilters })
  }

  const regionSuggestions = useMemo(() => getRegionSuggestions(getLocalCatalog()), [])
  const priceOptions = priceRanges[filters.purpose].map((r) => ({ value: r.id, label: r.label }))
  const advancedCount = [filters.type, filters.priceRange, filters.bedrooms > 0].filter(Boolean).length

  function update<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function changePurpose(purpose: PropertyPurpose) {
    // Faixas de preço dependem da finalidade.
    setFilters((prev) => ({ ...prev, purpose, priceRange: '' }))
  }

  function submit(next: PropertyFilters) {
    track('search_submitted', {
      purpose: next.purpose,
      region: next.region,
      type: next.type,
      price_range: next.priceRange,
      bedrooms: next.bedrooms,
    })
    if (onSearch) onSearch(next)
    else navigate(`/imoveis?${filtersToSearchParams(next).toString()}`)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    submit(filters)
  }

  const hero = variant === 'hero'

  const tabList = (
    <div
      role="tablist"
      aria-label="Finalidade"
      className={cn(
        'gap-1',
        isSmUp
          ? cn('inline-flex p-1.5', hero ? 'rounded-t-2xl bg-white pt-4 pr-2.5 pb-2 pl-4' : 'mb-3 rounded-full bg-sand')
          : 'grid grid-cols-2 rounded-xl bg-sand p-1',
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
              'rounded-full px-6 font-semibold transition-all',
              isSmUp ? 'h-10 min-w-[104px] text-[13.5px]' : 'h-11 rounded-lg text-[15px]',
              selected ? 'bg-navy-950 text-white shadow-sm' : 'text-navy-950 hover:bg-navy-950/5',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )

  // --- Celular -----------------------------------------------------------------
  if (!isSmUp) {
    return (
      <form onSubmit={handleSubmit} className={cn('relative', className)} role="search" aria-label="Buscar imóveis">
        <div
          className={cn(
            'space-y-3 rounded-2xl bg-white p-3',
            hero ? 'shadow-[0_30px_60px_-30px_rgb(7_27_46/0.55),0_2px_6px_rgb(7_27_46/0.06)]' : 'border border-navy-950/8 shadow-[var(--shadow-card)]',
          )}
        >
          {tabList}
          <RegionInput
            id={`${uid}-regiao`}
            label="Onde você quer morar?"
            placeholder="Bairro ou cidade"
            value={filters.region}
            suggestions={regionSuggestions}
            onChange={(v) => update('region', v)}
          />
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSheetOpen(true)
                track('filters_opened', { placement: variant })
              }}
              className="relative inline-flex h-12 items-center gap-2 rounded-xl border border-navy-950/15 px-4 text-[15px] font-semibold text-navy-950"
            >
              <SlidersHorizontal className="size-[18px]" aria-hidden="true" />
              Filtros
              {advancedCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-gold-500 text-[11px] font-bold text-navy-950">
                  {advancedCount}
                </span>
              )}
            </button>
            <button
              type="submit"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-navy-800 text-[15px] font-semibold text-white shadow-[0_14px_28px_-14px_rgb(11_49_88/0.9)] active:scale-[0.99]"
            >
              <Search className="size-5" strokeWidth={2.2} aria-hidden="true" />
              Buscar imóveis
            </button>
          </div>
        </div>
        <FiltersSheet
          open={sheetOpen}
          filters={filters}
          onClose={() => setSheetOpen(false)}
          onApply={(next) => {
            setFilters(next)
            setSheetOpen(false)
            submit(next)
          }}
        />
      </form>
    )
  }

  // --- Tablet e desktop ----------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)} role="search" aria-label="Buscar imóveis">
      {tabList}
      <div
        className={cn(
          'grid gap-3 bg-white',
          hero
            ? 'rounded-2xl rounded-tl-none p-4 shadow-[0_30px_60px_-30px_rgb(7_27_46/0.45),0_2px_6px_rgb(7_27_46/0.05)] sm:p-5'
            : 'rounded-2xl border border-navy-950/8 p-3 shadow-[var(--shadow-card)]',
          'grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr_auto]',
        )}
      >
        <RegionInput
          id={`${uid}-regiao`}
          value={filters.region}
          suggestions={regionSuggestions}
          onChange={(v) => update('region', v)}
          className="col-span-2 lg:col-span-1"
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
          className="inline-flex h-[60px] items-center justify-center gap-2.5 rounded-xl bg-navy-800 px-7 text-[15px] font-semibold text-white shadow-[0_14px_28px_-14px_rgb(11_49_88/0.9)] transition-all hover:bg-navy-700 active:scale-[0.99] lg:col-span-1"
        >
          <Search className="size-5" strokeWidth={2.2} aria-hidden="true" />
          Buscar imóveis
        </button>
      </div>
    </form>
  )
}
