import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import type { SelectOption } from '@/types/filters'
import { cn } from '@/utils/cn'

interface FieldShellProps {
  label: string
  htmlFor: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

/** Caixa com rótulo superior, no estilo dos campos da busca da referência. */
export function FieldShell({ label, htmlFor, icon, children, className }: FieldShellProps) {
  return (
    <div
      className={cn(
        'group relative flex h-[60px] items-center gap-3 rounded-xl border border-navy-950/12 bg-white px-4 transition-colors focus-within:border-navy-800 hover:border-navy-950/25',
        className,
      )}
    >
      {icon}
      <div className="flex min-w-0 flex-1 flex-col">
        <label htmlFor={htmlFor} className="text-[12px] font-semibold text-navy-950">
          {label}
        </label>
        {children}
      </div>
    </div>
  )
}

interface SearchSelectProps<T extends string> {
  id: string
  label: string
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  className?: string
}

export function SearchSelect<T extends string>({ id, label, value, options, onChange, className }: SearchSelectProps<T>) {
  return (
    <FieldShell label={label} htmlFor={id} className={className}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-[13.5px] text-slate outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-navy-950/70"
        aria-hidden="true"
      />
    </FieldShell>
  )
}
