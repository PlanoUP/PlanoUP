import { Clock, Search, RefreshCw, Presentation } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Tempo",
    text: "Horas criando equipamentos básicos.",
  },
  {
    icon: Search,
    title: "Referência",
    text: "Procurando modelos que realmente façam sentido para indústria.",
  },
  {
    icon: RefreshCw,
    title: "Retrabalho",
    text: "Recriando elementos semelhantes em cada projeto.",
  },
  {
    icon: Presentation,
    title: "Apresentação",
    text: "Precisando entregar um material visual profissional rapidamente.",
  },
];

export default function Problems() {
  return (
    <section className="section-py bg-background">
      <div className="container-px mx-auto max-w-content">
        <h2 className="max-w-2xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
          QUANTO TEMPO VOCÊ PERDE COMEÇANDO DO ZERO?
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card-surface p-5">
              <Icon className="h-5 w-5 text-accent" />
              <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{text}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-lg font-semibold text-white sm:text-xl">
          Você não precisa começar cada novo projeto com uma tela vazia.
        </p>
      </div>
    </section>
  );
}
