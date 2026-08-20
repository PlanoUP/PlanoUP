export const product = {
  name: "Biblioteca PlanoUP 3D Industrial",
  volume: "Volume 01",
  price: 47,
  oldPrice: 97,
  checkoutUrl: "https://pay.kirvano.com/8efadb23-03e7-4727-a6e7-72f9a98554a9",
  projects: 6,
  resources: 18,
  lessons: 5,
  /**
   * Dias de garantia. Deixe null para não exibir nenhuma promessa de prazo
   * até que um valor real seja definido.
   */
  guaranteeDays: null as number | null,
};

export function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
}
