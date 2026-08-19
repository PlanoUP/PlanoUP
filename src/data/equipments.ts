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
    description: "Tanque de armazenamento com corrimão de segurança, bocais de inspeção e bacia de contenção.",
    image: "/images/tanque-industrial.jpg",
    deliverables: ["Projeto .SKP editável", "Imagem geral em alta resolução", "Vistas técnicas"],
  },
  {
    id: "flotador",
    number: "02",
    slug: "flotador",
    name: "Flotador",
    description: "Vista interna com mecanismo de raspagem/agitação apoiado em estrutura radial e plataforma central.",
    image: "/images/flotador.jpg",
    deliverables: ["Projeto .SKP editável", "Imagem geral em alta resolução", "Vistas técnicas"],
  },
  {
    id: "motor-compressor",
    number: "03",
    slug: "motor-compressor",
    name: "Motor Compressor",
    description: "Skid completo com motor, acoplamento, compressor e estrutura de acesso.",
    image: "/images/motor-compressor.jpg",
    deliverables: ["Projeto .SKP editável", "Imagem geral em alta resolução", "Vistas técnicas"],
  },
  {
    id: "air-cooler",
    number: "04",
    slug: "air-cooler",
    name: "Permutador / Air Cooler",
    description: "Trocador de calor a ar com módulo de ventiladores e feixe tubular.",
    image: "/images/permutador-calor.jpg",
    deliverables: ["Projeto .SKP editável", "Imagem geral em alta resolução", "Vistas técnicas"],
  },
  {
    id: "forno",
    number: "05",
    slug: "forno",
    name: "Forno Industrial",
    description: "Estrutura vertical de processo com chaminé, duto de alimentação e plataforma de acesso superior.",
    image: "/images/forno-industrial.jpg",
    deliverables: ["Projeto .SKP editável", "Imagem geral em alta resolução", "Vistas técnicas"],
  },
  {
    id: "vaso-peneira",
    number: "06",
    slug: "vaso-peneira",
    name: "Vaso / Peneira Molecular",
    description: "Sistema em torres duplas para operação contínua de adsorção e regeneração, com plataforma e escadas de acesso.",
    image: "/images/vaso-de-pressao.jpg",
    deliverables: ["Projeto .SKP editável", "Imagem geral em alta resolução", "Vistas técnicas"],
  },
];
