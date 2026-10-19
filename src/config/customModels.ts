import { whatsapp } from "./site";

/**
 * Serviços de modelagem sob encomenda. Preços "a partir de" — o valor final
 * é fechado no orçamento. priceFrom = null exibe "Sob orçamento".
 */
export type CustomService = {
  id: "equipamento" | "area" | "animacao";
  name: string;
  priceFrom: number | null;
  description: string;
  includes: string[];
  examples: string;
  highlight?: boolean;
};

export const customServices: CustomService[] = [
  {
    id: "equipamento",
    name: "Modelo de equipamento rápido",
    priceFrom: 119.9,
    description:
      "Um equipamento modelado em 3D a partir das suas dimensões, desenho ou foto de referência.",
    includes: ["Arquivo .SKP editável", "Imagens do modelo", "Dimensões principais do equipamento"],
    examples: "Vaso de pressão, tanque, trocador de calor, bomba, torre, air cooler",
    highlight: true,
  },
  {
    id: "area",
    name: "Área industrial",
    priceFrom: 299.9,
    description:
      "Um conjunto de equipamentos com estruturas e arranjo geral, para layout, estudo ou apresentação.",
    includes: ["Vários equipamentos no mesmo arquivo", "Estruturas e arranjo da área", "Imagens gerais da área"],
    examples: "Skid, casa de bombas, área de tanques, unidade de processo simplificada",
  },
  {
    id: "animacao",
    name: "Animação de manobra",
    priceFrom: null,
    description:
      "A sequência da manobra animada em 3D, para planejar a execução e alinhar a equipe antes de ir a campo.",
    includes: ["Sequência passo a passo da manobra", "Vídeo da animação", "Escopo definido com você"],
    examples: "Içamento de carga, montagem de andaime, trepanação, troca de feixe",
  },
];

export const referenceOptions = [
  "Tenho desenho técnico (PDF/DWG)",
  "Tenho fotos do equipamento",
  "Tenho só as dimensões principais",
  "Ainda não tenho referência",
];

export const deadlineOptions = [
  "Sem pressa",
  "Até 7 dias",
  "Até 15 dias",
  "Urgente — preciso conversar",
];

export type CustomRequest = {
  nome: string;
  empresa: string;
  whatsapp: string;
  servico: string;
  descricao: string;
  referencia: string;
  prazo: string;
};

export function buildCustomRequestMessage(r: CustomRequest) {
  const lines = [
    "Olá! Vim pelo site da PlanoUP e quero um *modelo 3D personalizado*.",
    "",
    `*Serviço:* ${r.servico}`,
    `*Nome:* ${r.nome}`,
    r.empresa ? `*Empresa:* ${r.empresa}` : null,
    `*WhatsApp:* ${r.whatsapp}`,
    `*Referência:* ${r.referencia || "—"}`,
    `*Prazo:* ${r.prazo || "—"}`,
    "",
    "*O que preciso:*",
    r.descricao,
  ].filter((l) => l !== null);
  return lines.join("\n");
}

export function getCustomRequestWhatsAppLink(message?: string) {
  const text =
    message ??
    "Olá! Vim pelo site da PlanoUP e quero um orçamento de modelo 3D personalizado.";
  return `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(text)}`;
}
