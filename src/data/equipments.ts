export type Equipment = {
  id: string;
  number: string;
  slug: "tanque" | "flotador" | "motor-compressor" | "air-cooler" | "forno" | "vaso-peneira";
  name: string;
  description: string;
  image: string;
  deliverables: string[];
};

export const equipments: Equipment[] = [
  {
    id: "tanque",
    number: "01",
    slug: "tanque",
    name: "Tanque Industrial",
    description: "Estrutura de armazenamento vertical com plataformas, escadas e guarda-corpo.",
    image: "/images/tanque.png",
    deliverables: ["Projeto .SKP editável", "Imagem geral em alta resolução", "Vistas técnicas"],
  },
  {
    id: "flotador",
    number: "02",
    slug: "flotador",
    name: "Flotador",
    description: "Unidade circular com passarela, corrimãos e conexões de processo.",
    image: "/images/flotador.png",
    deliverables: ["Projeto .SKP editável", "Imagem geral em alta resolução", "Vistas técnicas"],
  },
  {
    id: "motor-compressor",
    number: "03",
    slug: "motor-compressor",
    name: "Motor Compressor",
    description: "Skid completo com motor, acoplamento, compressor e estrutura de acesso.",
    image: "/images/motor-compressor.png",
    deliverables: ["Projeto .SKP editável", "Imagem geral em alta resolução", "Vistas técnicas"],
  },
  {
    id: "air-cooler",
    number: "04",
    slug: "air-cooler",
    name: "Permutador / Air Cooler",
    description: "Trocador de calor a ar com módulo de ventiladores e feixe tubular.",
    image: "/images/air-cooler.png",
    deliverables: ["Projeto .SKP editável", "Imagem geral em alta resolução", "Vistas técnicas"],
  },
  {
    id: "forno",
    number: "05",
    slug: "forno",
    name: "Forno Industrial",
    description: "Estrutura vertical de processo com chaminé e acessos técnicos.",
    image: "/images/forno.png",
    deliverables: ["Projeto .SKP editável", "Imagem geral em alta resolução", "Vistas técnicas"],
  },
  {
    id: "vaso-peneira",
    number: "06",
    slug: "vaso-peneira",
    name: "Vaso / Peneira Molecular",
    description: "Vaso de processo com estrutura interna, bocais e acessos de manutenção.",
    image: "/images/vaso-peneira.png",
    deliverables: ["Projeto .SKP editável", "Imagem geral em alta resolução", "Vistas técnicas"],
  },
];
