import { DOC_KINDS, requiredDocs } from './clientsApi'

/**
 * Materiais de apoio que o corretor envia ao cliente pelo WhatsApp.
 * Textos próprios e genéricos: regras específicas de banco/programa mudam — o texto
 * pede ao cliente que confirme os detalhes com o corretor.
 */
export interface Material {
  id: string
  title: string
  summary: string
  /** Itens exibidos no cartão e enviados na mensagem. */
  items: string[]
  footer?: string
}

const docList = (keys: string[]) => keys.map((k) => `${DOC_KINDS[k].label} — ${DOC_KINDS[k].hint}`)

export const MATERIALS: Material[] = [
  {
    id: 'renda-formal',
    title: 'Documentos — renda formal',
    summary: 'Para quem trabalha com carteira assinada.',
    items: docList(requiredDocs({ income_type: 'formal', marital_status: null, dependents: 0 }).map((d) => d.key)),
    footer: 'Casado(a) ou em união estável? Envie também os documentos do cônjuge.',
  },
  {
    id: 'renda-informal',
    title: 'Documentos — renda informal',
    summary: 'Para autônomos e quem não tem carteira assinada.',
    items: docList(requiredDocs({ income_type: 'informal', marital_status: null, dependents: 0 }).map((d) => d.key)),
    footer: 'Quanto mais a movimentação no banco mostrar a sua renda, melhor para a análise.',
  },
  {
    id: 'familia',
    title: 'Cônjuge e dependentes',
    summary: 'O que enviar quando a família entra no processo.',
    items: [
      'Casado(a) ou união estável: RG/CNH, CPF e comprovante de renda do cônjuge',
      'Certidão de casamento ou declaração de união estável',
      'Dependentes: certidão de nascimento ou RG de cada um',
      'Quem pode entrar como dependente varia conforme o banco e o programa — confirme comigo antes de enviar',
    ],
  },
  {
    id: 'boas-fotos',
    title: 'Como enviar documentos sem erro',
    summary: 'Evita retrabalho e acelera a análise.',
    items: [
      'Foto com boa luz, sem reflexo e sem cortar as bordas',
      'Frente e verso de documentos com dois lados',
      'PDF original quando o documento for digital (contracheque, extrato, FGTS)',
      'Documentos dentro da validade e com nome completo legível',
      'Um arquivo por documento, com nome fácil de identificar',
    ],
  },
  {
    id: 'etapas',
    title: 'Etapas até a chave',
    summary: 'Para o cliente entender o caminho do financiamento.',
    items: [
      '1. Cadastro e envio dos documentos',
      '2. Análise de crédito pelo banco',
      '3. Aprovação e escolha das condições',
      '4. Avaliação do imóvel (laudo) pelo engenheiro do banco',
      '5. Assinatura do contrato',
      '6. Registro em cartório',
      '7. Entrega das chaves',
    ],
    footer: 'Os prazos variam conforme o banco e o cartório. Eu te aviso a cada etapa.',
  },
]

export function materialMessage(m: Material, senderName?: string | null): string {
  const lines = [`*${m.title}*`, m.summary, '', ...m.items.map((i) => (/^\d+\./.test(i) ? i : `• ${i}`))]
  if (m.footer) lines.push('', m.footer)
  if (senderName) lines.push('', `Qualquer dúvida, fale comigo: ${senderName}.`)
  return lines.join('\n')
}
