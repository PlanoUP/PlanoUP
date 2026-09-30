import {
  ArrowLeftRight,
  ChartColumn,
  FileCheck2,
  FileSearch,
  FileText,
  Handshake,
  Layers,
  PenLine,
  Rotate3d,
  ScanSearch,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

export const benefits: Feature[] = [
  {
    icon: FileText,
    title: 'Imóveis com documentação verificada',
    description: 'Mais segurança para comprar ou vender.',
  },
  {
    icon: ShieldCheck,
    title: 'Assessoria especializada',
    description: 'Do início ao fim da negociação.',
  },
  {
    icon: ChartColumn,
    title: 'Divulgação estratégica',
    description: 'Seu imóvel no canal certo, para o público certo.',
  },
  {
    icon: UsersRound,
    title: 'Atendimento personalizado',
    description: 'Entendemos seu momento e indicamos as melhores opções.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Compra e venda com suporte completo',
    description: 'Jurídico, documentação e acompanhamento.',
  },
]

export const tourFeatures: Feature[] = [
  { icon: Rotate3d, title: 'Navegação', description: 'livre pelos ambientes' },
  { icon: ScanSearch, title: 'Hotspots', description: 'com informações' },
  { icon: Layers, title: 'Planta 3D', description: 'e medidas reais' },
]

export const documentationSteps: Feature[] = [
  { icon: FileText, title: 'Matrícula', description: 'verificada' },
  { icon: PenLine, title: 'Regularização', description: 'em dia' },
  { icon: FileSearch, title: 'Documentação', description: 'analisada' },
  { icon: ShieldCheck, title: 'Situação', description: 'do imóvel' },
  { icon: Handshake, title: 'Acompanhamento', description: 'até a assinatura' },
]

export const documentationChecklist = [
  'Matrícula atualizada e sem ônus',
  'Certidões negativas do vendedor',
  'Habite-se e averbação da construção',
  'IPTU e condomínio quitados',
  'Conferência jurídica do contrato',
]

export const sellSteps: Feature[] = [
  {
    icon: FileSearch,
    title: 'Análise documental',
    description: 'Conferimos matrícula, certidões e pendências antes de anunciar.',
  },
  {
    icon: ChartColumn,
    title: 'Avaliação e divulgação',
    description: 'Preço de mercado, fotos profissionais, tour 3D e mídia segmentada.',
  },
  {
    icon: FileCheck2,
    title: 'Negociação segura',
    description: 'Filtramos compradores e acompanhamos até a escritura.',
  },
]
