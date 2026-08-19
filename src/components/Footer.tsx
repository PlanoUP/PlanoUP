import { site } from "@/config/site";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="container-px mx-auto flex max-w-content flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <div className="text-sm font-bold text-white">{site.name}</div>
          <div className="font-mono text-[11px] tracking-[0.14em] text-text-secondary">
            {site.slogan}
          </div>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-text-secondary">
          Biblioteca de projetos 3D industriais para estudo, apresentação e referência. Os
          modelos são fornecidos como material de apoio e não substituem projetos executivos de
          engenharia.
        </p>
        <p className="text-xs text-text-secondary">
          © {new Date().getFullYear()} {site.name}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
