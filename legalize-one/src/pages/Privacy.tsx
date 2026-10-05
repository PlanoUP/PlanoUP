import type { ReactNode } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useTenant } from '@/tenant/store'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="font-display text-[20px] font-bold tracking-[-0.02em] text-navy-950">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-navy-950/85">{children}</div>
    </section>
  )
}

/** Política de privacidade (LGPD — Lei 13.709/2018). Dados do controlador vêm da imobiliária ativa. */
export default function Privacy() {
  usePageTitle('Política de privacidade')
  const tenant = useTenant()
  const { contact } = tenant
  const channels = [contact.email, contact.phoneDisplay, contact.address].filter(Boolean).join(' · ')

  return (
    <div className="bg-sand">
      <article className="container-page max-w-3xl py-12 sm:py-16">
        <p className="eyebrow text-[11px] text-gold-600">Privacidade</p>
        <h1 className="mt-2 font-display text-[30px] leading-tight font-bold tracking-[-0.03em] text-balance text-navy-950 sm:text-[36px]">
          Política de privacidade
        </h1>
        <p className="mt-3 text-[15px] text-slate">
          Como {tenant.legalName || tenant.name} trata os dados de quem visita este site, conforme a Lei Geral de Proteção de Dados
          (Lei 13.709/2018).
        </p>

        <Block title="Quem é o responsável pelos dados">
          <p>
            {tenant.legalName || tenant.name}
            {tenant.creci ? `, ${tenant.creci}` : ''}, é a controladora dos dados pessoais coletados neste site.
          </p>
          {channels && <p>Contato: {channels}.</p>}
        </Block>

        <Block title="Quais dados coletamos">
          <p>
            <strong>Quando você preenche um formulário</strong> (pedido de contato, ligação ou avaliação para vender): nome, telefone,
            e-mail quando informado, a mensagem e o imóvel de interesse.
          </p>
          <p>
            <strong>Quando você navega</strong>: páginas e imóveis visitados, uso do tour e do modelo 3D, cliques em contato, a origem da
            visita (por exemplo, Google ou Instagram) e um identificador aleatório da visita. Esses dados de navegação não incluem seu
            nome, telefone ou endereço IP.
          </p>
        </Block>

        <Block title="Para que usamos">
          <p>Para responder ao seu pedido, agendar visitas, apresentar imóveis compatíveis e avaliar imóveis que você deseja vender.</p>
          <p>Para entender quais imóveis e páginas despertam mais interesse e melhorar o site e o atendimento.</p>
          <p>
            As bases legais são o seu consentimento ao enviar o formulário, os procedimentos preliminares a um contrato que você solicitar e
            o legítimo interesse em melhorar nossos serviços.
          </p>
        </Block>

        <Block title="Com quem compartilhamos">
          <p>
            Seus dados de contato são acessados apenas pela equipe da imobiliária responsável pelo atendimento. Usamos fornecedores de
            tecnologia para hospedar o site e armazenar os dados com segurança, que tratam as informações somente para prestar esse
            serviço. Não vendemos seus dados.
          </p>
        </Block>

        <Block title="Por quanto tempo guardamos">
          <p>
            Pelo tempo necessário para o atendimento e a negociação, e pelo prazo exigido por obrigações legais. Depois disso, os dados são
            excluídos ou anonimizados.
          </p>
        </Block>

        <Block title="Seus direitos">
          <p>
            Você pode pedir a confirmação de que tratamos seus dados, o acesso, a correção, a exclusão, a portabilidade e informações sobre
            compartilhamento, além de revogar o consentimento a qualquer momento. Basta entrar em contato pelos canais acima.
          </p>
        </Block>

        <Block title="Armazenamento no seu navegador">
          <p>
            O site guarda no seu próprio navegador apenas preferências como imóveis favoritos e o identificador aleatório da visita. Você
            pode apagá-los limpando os dados de navegação.
          </p>
        </Block>

        <Block title="Atualizações">
          <p>Esta política pode ser atualizada. A versão vigente é sempre a publicada nesta página.</p>
        </Block>
      </article>
    </div>
  )
}
