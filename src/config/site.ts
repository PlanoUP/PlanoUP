export const site = {
  name: "PlanoUP",
  slogan: "PLANEJE. TESTE. CONSTRUA.",
  description:
    "Biblioteca PlanoUP 3D Industrial — 6 projetos industriais editáveis, imagens, vistas técnicas e treinamento prático para SketchUp.",
  url: "https://planoup.com.br",
};

/**
 * Canal oficial de atendimento via WhatsApp. Único lugar onde o número
 * deve ser configurado — nenhum componente deve montar a URL manualmente.
 */
export const whatsapp = {
  number: "5584999588850",
  displayNumber: "(84) 99958-8850",
  message: "Olá! Vim pelo site da PlanoUP e tenho uma dúvida sobre a Biblioteca Industrial 3D.",
};

export function getWhatsAppLink() {
  return `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(whatsapp.message)}`;
}
