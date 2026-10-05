import { useTenant } from '@/tenant/store'

/** Faixa que avisa quando o site está aberto em pré-visualização (`?previa=`). */
export function PreviewBanner() {
  const tenant = useTenant()
  if (!tenant.preview) return null
  return (
    <div className="bg-gold-500 px-4 py-2 text-center text-[13.5px] font-semibold text-navy-950">
      Pré-visualização do site da {tenant.name}.{' '}
      <a href="/?previa=sair" className="underline underline-offset-2">
        Sair
      </a>
    </div>
  )
}
