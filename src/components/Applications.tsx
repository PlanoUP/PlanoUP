import {
  ClipboardList,
  Presentation,
  FlaskConical,
  LayoutGrid,
  GraduationCap,
  School,
  BookMarked,
  Boxes,
} from "lucide-react";

const applications = [
  { icon: ClipboardList, label: "Planejamento" },
  { icon: Presentation, label: "Apresentações" },
  { icon: FlaskConical, label: "Estudos preliminares" },
  { icon: LayoutGrid, label: "Layouts" },
  { icon: GraduationCap, label: "Treinamentos" },
  { icon: School, label: "Projetos acadêmicos" },
  { icon: BookMarked, label: "Referências" },
  { icon: Boxes, label: "Modelagem" },
];

export default function Applications() {
  return (
    <section className="section-py bg-background">
      <div className="container-px mx-auto max-w-content">
        <h2 className="max-w-2xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
          ONDE VOCÊ PODE UTILIZAR.
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {applications.map(({ icon: Icon, label }) => (
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
      </div>
    </section>
  );
}
