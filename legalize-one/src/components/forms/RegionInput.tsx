import { MapPin } from 'lucide-react'
import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'
import { normalizeText } from '@/utils/format'
import { FieldShell } from './SearchField'

interface RegionInputProps {
  id: string
  value: string
  suggestions: string[]
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
}

/** Campo de região com autocomplete acessível (combobox). */
export function RegionInput({
  id,
  value,
  suggestions,
  onChange,
  label = 'Região',
  placeholder = 'Ex: Parnamirim, Natal',
  className,
}: RegionInputProps) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const matches = useMemo(() => {
    const q = normalizeText(value)
    const list = q ? suggestions.filter((s) => normalizeText(s).includes(q)) : suggestions
    return list.slice(0, 6)
  }, [value, suggestions])

  const showList = open && matches.length > 0 && !matches.some((m) => m === value)

  function select(option: string) {
    onChange(option)
    setOpen(false)
    setActive(-1)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showList) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % matches.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i <= 0 ? matches.length - 1 : i - 1))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      select(matches[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      className={className}
      icon={<MapPin className="size-5 shrink-0 text-navy-950" strokeWidth={1.8} aria-hidden="true" />}
    >
      <span className="h-6" aria-hidden="true" />
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        enterKeyHint="search"
        autoCapitalize="words"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setActive(-1)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        className="absolute inset-0 w-full rounded-xl bg-transparent pt-[26px] pr-4 pl-12 text-base text-navy-950 outline-none placeholder:text-slate lg:text-[13.5px]"
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-30 overflow-hidden rounded-xl border border-navy-950/10 bg-white py-1.5 shadow-[var(--shadow-float)] animate-pop"
        >
          {matches.map((option, i) => (
            <li
              key={option}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                select(option)
              }}
              className={cn(
                'flex min-h-11 cursor-pointer items-center gap-2.5 px-4 py-2.5 text-[15px] text-navy-950 lg:text-[13.5px]',
                i === active ? 'bg-sand' : 'hover:bg-sand',
              )}
            >
              <MapPin className="size-4 text-gold-600" aria-hidden="true" />
              {option}
            </li>
          ))}
        </ul>
      )}
    </FieldShell>
  )
}
