import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('Página não encontrada')
  return (
    <section className="container-page flex flex-col items-center py-28 text-center">
      <p className="font-display text-[88px] leading-none font-extrabold tracking-[-0.06em] text-gold-500">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-navy-950">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-slate">O endereço acessado não existe ou foi alterado.</p>
      <ButtonLink to="/" className="mt-8">
        Voltar para o início
        <ArrowRight className="size-4" />
      </ButtonLink>
    </section>
  )
}
