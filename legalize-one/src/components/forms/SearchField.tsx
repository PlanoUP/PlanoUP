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
        <label htmlFor={htmlFor} className="pointer-events-none text-[12px] font-semibold text-navy-950">
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

/** Select nativo ocupando a caixa inteira (toda a área é tocável). */
export function SearchSelect<T extends string>({ id, label, value, options, onChange, className }: SearchSelectProps<T>) {
  return (
    <FieldShell label={label} htmlFor={id} className={className}>
      <span className="h-5" aria-hidden="true" />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="absolute inset-0 w-full cursor-pointer appearance-none truncate rounded-xl bg-transparent pt-[26px] pr-10 pl-4 text-base text-slate outline-none lg:text-[13.5px]"
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
