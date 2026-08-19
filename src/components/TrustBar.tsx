import { ShieldCheck, Zap, FileEdit, Headset } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Pagamento seguro" },
  { icon: Zap, label: "Acesso imediato" },
  { icon: FileEdit, label: "Arquivos editáveis" },
  { icon: Headset, label: "Suporte PlanoUP" },
];

export default function TrustBar() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-px mx-auto grid max-w-content grid-cols-2 gap-y-5 py-6 sm:grid-cols-4 sm:gap-4 sm:py-5">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center justify-center gap-2 sm:justify-start">
            <Icon className="h-4 w-4 shrink-0 text-accent" />
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary sm:text-[13px]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
