import { ShieldCheck } from "lucide-react";
import { product } from "@/config/product";

export default function Guarantee() {
  if (!product.guaranteeDays) return null;

  return (
    <section className="bg-background pb-16 sm:pb-20">
      <div className="container-px mx-auto max-w-content">
        <div className="card-surface mx-auto flex max-w-2xl flex-col items-center gap-3 px-6 py-8 text-center sm:flex-row sm:gap-5 sm:text-left">
          <ShieldCheck className="h-9 w-9 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-white/90 sm:text-base">
            Você tem <strong className="text-white">{product.guaranteeDays} dias</strong> para
            conhecer o material.
          </p>
        </div>
      </div>
    </section>
  );
}
