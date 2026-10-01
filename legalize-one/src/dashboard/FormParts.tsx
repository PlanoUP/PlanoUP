import type { ReactNode } from 'react'

/** Peças de formulário do painel (mesma aparência em todas as telas). */

export const inputClass =
  'mt-1.5 h-12 w-full rounded-xl border border-navy-950/15 bg-white px-4 text-[16px] text-navy-950 outline-none focus:border-navy-800 focus:ring-2 focus:ring-navy-800/15 disabled:bg-sand disabled:text-slate'

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-card sm:p-6">
      <h2 className="font-display text-[19px] font-bold text-navy-950">{title}</h2>
      {description && <p className="mt-1 text-[14px] text-slate">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label className="block text-[14px] font-semibold text-navy-950">
        {label}
        {children}
      </label>
      {hint && !error && <p className="mt-1 text-[12.5px] text-slate">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

