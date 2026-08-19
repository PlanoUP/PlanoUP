import { Check } from "lucide-react";
import type { Equipment } from "@/data/equipments";
import EquipmentImage from "./EquipmentImage";

export default function EquipmentCard({ equipment }: { equipment: Equipment }) {
  return (
    <article className="card-surface group flex flex-col overflow-hidden transition-colors duration-200 hover:border-accent/30">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-[#0c0f10]">
        <span className="absolute left-4 top-4 z-10 font-mono text-2xl font-bold text-white/25">
          {equipment.number}
        </span>
        <span className="absolute right-4 top-4 z-10 rounded-full border border-accent/40 bg-background/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-accent">
          Editável
        </span>
        <div className="relative h-full w-full p-6 transition-transform duration-300 group-hover:scale-[1.03]">
          <EquipmentImage
            src={equipment.image}
            slug={equipment.slug}
            alt={equipment.name}
            imageClassName="object-contain p-2"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold uppercase tracking-wide text-white">
          {equipment.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
          {equipment.description}
        </p>

        <ul className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4">
          {equipment.deliverables.map((item) => (
            <li key={item} className="flex items-center gap-2 text-[13px] text-white/85">
              <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
