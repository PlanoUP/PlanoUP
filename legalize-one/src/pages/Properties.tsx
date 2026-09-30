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
  const { data: results, loading } = useAsyncData(() => listProperties(filters), filtersKey)

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
      <section className="bg-navy-950 pt-7 pb-20 text-white sm:pt-14 sm:pb-24">
        <div className="container-page">
          <p className="eyebrow text-[11px] text-gold-400">Imóveis Legalize</p>
          <h1 className="mt-3 font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-[48px]">
            Imóveis {purposeLabel}
          </h1>
          <p className="mt-2 max-w-xl text-[14.5px] text-white/75 sm:mt-3 sm:text-[15px]">
            Todos os imóveis passam por curadoria. Filtre por região, tipo, faixa de preço e quartos.
          </p>
        </div>
      </section>

      <section className="bg-sand pb-16">
        <div className="container-page -mt-14 sm:-mt-16">
          <PropertySearch variant="panel" initialFilters={filters} onSearch={apply} className="relative z-10" />

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mr-1 text-[15px] text-navy-950" aria-live="polite">
                <strong className="font-semibold">{results?.length ?? 0}</strong>{' '}
                {results?.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
              </p>
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => removeChip(chip.key)}
                  aria-label={`Remover filtro: ${chip.label}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-navy-950/10 bg-white pr-2.5 pl-3.5 text-[13px] text-navy-950 hover:border-navy-950/25"
                >
                  {chip.label}
                  <X className="size-4 text-slate" aria-hidden="true" />
                </button>
              ))}
              {chips.length > 0 && (
                <button
                  type="button"
                  onClick={() => apply({ ...filters, region: '', type: '', priceRange: '', bedrooms: 0 })}
                  className="inline-flex h-10 items-center px-2 text-[13.5px] font-semibold text-navy-800 underline-offset-4 hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 self-start text-[13px] text-slate sm:self-auto">
              <ArrowUpDown className="size-4" aria-hidden="true" />
              <span>Ordenar por</span>
              <select
                value={filters.sort}
                onChange={(e) => apply({ ...filters, sort: e.target.value as SortOption })}
                className="h-11 cursor-pointer rounded-full border border-navy-950/10 bg-white px-4 text-base font-medium text-navy-950 outline-none focus:border-navy-800 lg:text-[13px]"
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
