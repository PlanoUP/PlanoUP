import { equipments } from "@/data/equipments";
import EquipmentCard from "./EquipmentCard";

export default function EquipmentGrid() {
  return (
    <section id="equipamentos" className="section-py bg-background">
      <div className="container-px mx-auto max-w-content">
        <div className="max-w-2xl">
          <span className="eyebrow">Volume 01</span>
          <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            6 PROJETOS INDUSTRIAIS.
            <br />
            PRONTOS PARA VOCÊ UTILIZAR E EDITAR.
          </h2>
          <p className="mt-4 text-base text-text-secondary sm:text-lg">
            Explore os equipamentos incluídos no Volume 01.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {equipments.map((equipment) => (
            <EquipmentCard key={equipment.id} equipment={equipment} />
          ))}
        </div>
      </div>
    </section>
  );
}
