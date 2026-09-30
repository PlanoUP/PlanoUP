import { ArrowUpDown, SearchX, X } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { PropertySearch } from '@/components/forms/PropertySearch'
import { PropertyCard, PropertyCardSkeleton } from '@/components/properties/PropertyCard'
import { Button } from '@/components/ui/Button'
import { priceRanges, propertyTypeLabels, sortOptions } from '@/data/filters'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { listProperties } from '@/services/propertyService'
import type { PropertyFilters, SortOption } from '@/types/filters'
import { filtersFromSearchParams, filtersToSearchParams } from '@/utils/filterProperties'

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams])
  const filtersKey = searchParams.toString()
  const { data: results, loading } = useAsyncData(() => listProperties(filters), [filtersKey])

  const purposeLabel = filters.purpose === 'aluguel' ? 'para alugar' : 'à venda'
  usePageTitle(`Imóveis ${purposeLabel}`)

  function apply(next: PropertyFilters) {
    setSearchParams(filtersToSearchParams(next))
  }

  const chips = [
    filters.region && { key: 'region' as const, label: filters.region },
    filters.type && { key: 'type' as const, label: propertyTypeLabels[filters.type] },
    filters.priceRange && {
      key: 'priceRange' as const,
      label: priceRanges[filters.purpose].find((r) => r.id === filters.priceRange)?.label ?? '',
    },
    filters.bedrooms > 0 && { key: 'bedrooms' as const, label: `${filters.bedrooms}+ quartos` },
  ].filter(Boolean) as { key: 'region' | 'type' | 'priceRange' | 'bedrooms'; label: string }[]

  function removeChip(key: (typeof chips)[number]['key']) {
    const reset = { region: '', type: '', priceRange: '', bedrooms: 0 } as const
    apply({ ...filters, [key]: reset[key] })
  }

  return (
    <>
      <section className="bg-navy-950 pt-10 pb-24 text-white sm:pt-14">
        <div className="container-page">
          <p className="eyebrow text-[11px] text-gold-400">Imóveis Legalize</p>
          <h1 className="mt-3 font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-[48px]">
            Imóveis {purposeLabel}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-white/75">
            Todos os imóveis passam por curadoria. Filtre por região, tipo, faixa de preço e quartos.
          </p>
        </div>
      </section>

      <section className="bg-sand pb-16">
        <div className="container-page -mt-16">
          <PropertySearch variant="panel" initialFilters={filters} onSearch={apply} className="relative z-10" />

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mr-2 text-[14px] text-navy-950" aria-live="polite">
                <strong className="font-semibold">{results?.length ?? 0}</strong>{' '}
                {results?.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
              </p>
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => removeChip(chip.key)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy-950/10 bg-white py-1 pr-2 pl-3 text-[12.5px] text-navy-950 hover:border-navy-950/25"
                >
                  {chip.label}
                  <X className="size-3.5 text-slate" aria-label="Remover filtro" />
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-[13px] text-slate">
              <ArrowUpDown className="size-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Ordenar por</span>
              <select
                value={filters.sort}
                onChange={(e) => apply({ ...filters, sort: e.target.value as SortOption })}
                className="h-10 cursor-pointer rounded-full border border-navy-950/10 bg-white px-4 text-[13px] font-medium text-navy-950 outline-none focus:border-navy-800"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading && !results ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : results && results.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-navy-950/15 bg-white px-6 py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-sand text-navy-800">
                <SearchX className="size-6" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold tracking-[-0.02em] text-navy-950">
                Nenhum imóvel com esses filtros
              </h2>
              <p className="mt-2 max-w-md text-[14px] text-slate">
                Ajuste a busca ou fale com um especialista — encontramos o imóvel certo para você, inclusive fora do
                catálogo.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => apply({ ...filters, region: '', type: '', priceRange: '', bedrooms: 0 })}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
