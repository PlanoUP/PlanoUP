import { Wrench, HardHat, ClipboardList, PenTool, GraduationCap, Settings } from "lucide-react";

const audience = [
  { icon: Wrench, label: "Técnicos" },
  { icon: HardHat, label: "Engenheiros" },
  { icon: ClipboardList, label: "Planejadores" },
  { icon: PenTool, label: "Projetistas" },
  { icon: GraduationCap, label: "Estudantes" },
  { icon: Settings, label: "Manutenção" },
];

export default function Audience() {
  return (
    <section className="section-py bg-surface/40">
      <div className="container-px mx-auto max-w-content">
        <h2 className="max-w-2xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
          CRIADO PARA QUEM TRABALHA OU ESTUDA INDÚSTRIA.
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {audience.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="card-surface flex flex-col items-center gap-2.5 px-3 py-6 text-center"
            >
              <Icon className="h-5 w-5 text-accent" />
              <span className="text-xs font-medium uppercase tracking-wide text-white/90">
                {label}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-lg font-semibold text-white sm:text-xl">
          Você não precisa ser especialista em SketchUp para começar.
        </p>
      </div>
    </section>
  );
}
