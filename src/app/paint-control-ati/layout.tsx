import type { Metadata } from "next";
import PaintControlShell from "@/components/paint-control/PaintControlShell";

// Scoped to this route segment only — the root PlanoUP landing page keeps
// its own title/branding; this section is a distinct product ("ATI
// GUAMARÉ — PAINT CONTROL"), not part of the PlanoUP 3D library.
export const metadata: Metadata = {
  title: "ATI GUAMARÉ — PAINT CONTROL",
  description:
    "Gestão de serviços de pintura, revitalização e custos do contrato — Ativo Industrial de Guamaré.",
};

export default function PaintControlLayout({ children }: { children: React.ReactNode }) {
  return <PaintControlShell>{children}</PaintControlShell>;
}
