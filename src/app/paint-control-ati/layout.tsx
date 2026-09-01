import type { Metadata } from "next";
import PaintControlShell from "@/components/paint-control/PaintControlShell";

// Scoped to this route segment only — the root PlanoUP landing page keeps
// its own title/branding; this section is a distinct product ("ATI
// GUAMARÉ — PAINT CONTROL"), not part of the PlanoUP 3D library.
//
// openGraph must be repeated here explicitly: Next.js metadata merges
// per-field with the parent layout, and since the root layout already
// declares an openGraph object (for the PlanoUP landing page), leaving
// this one out means the *root's* og:title/og:description — not this
// page's title/description — are what link previews (WhatsApp, etc.) show.
const TITLE = "ATI GUAMARÉ — PAINT CONTROL";
const DESCRIPTION =
  "Gestão de serviços de pintura, revitalização e custos do contrato — Ativo Industrial de Guamaré.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: TITLE,
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function PaintControlLayout({ children }: { children: React.ReactNode }) {
  return <PaintControlShell>{children}</PaintControlShell>;
}
