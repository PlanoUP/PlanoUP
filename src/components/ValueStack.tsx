import { Box, Image as ImageIcon, Ruler, BookOpen } from "lucide-react";
import { product } from "@/config/product";

const stack = [
  { icon: Box, value: "6", label: "Modelos .SKP editáveis" },
  { icon: ImageIcon, value: "6", label: "Imagens gerais em alta resolução" },
  { icon: Ruler, value: "6", label: "Conjuntos de vistas técnicas" },
  { icon: BookOpen, value: "5", label: "Aulas em PDF ilustrado" },
];

export default function ValueStack() {
  return (
    <section className="section-py bg-surface/40">
      <div className="container-px mx-auto max-w-content text-center">
        <h2 className="mx-auto max-w-2xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
          NÃO É APENAS UM MODELO 3D.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-text-secondary sm:text-lg">
          Você recebe uma base completa de recursos para estudar, editar, apresentar e
          desenvolver seus próprios projetos.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stack.map(({ icon: Icon, value, label }) => (
            <div key={label} className="card-surface p-5">
              <Icon className="mx-auto h-5 w-5 text-accent" />
              <div className="mt-3 font-mono text-2xl font-extrabold text-white">{value}</div>
              <div className="mt-1 text-xs leading-snug text-text-secondary">{label}</div>
            </div>
          ))}
        </div>

        <div className="relative mx-auto mt-12 max-w-md">
          <div className="card-surface flex flex-col items-center gap-1 border-accent/30 bg-surface-light px-8 py-8">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-secondary">
              Biblioteca PlanoUP
            </span>
            <span className="text-xl font-extrabold text-white">{product.volume}</span>
            <span className="mt-3 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-accent">
              {product.resources} recursos digitais incluídos
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
