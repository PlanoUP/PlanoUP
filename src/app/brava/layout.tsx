import type { Metadata } from "next";
import "@/styles/brava-tokens.css";
import { BravaDataProvider } from "@/lib/brava/context";
import Sidebar from "@/components/brava/Sidebar";
import MobileTopBar from "@/components/brava/MobileTopBar";

export const metadata: Metadata = {
  title: "Tank Control | Brava Energia",
  description:
    "Painel corporativo de acompanhamento, planejamento e gestão das manutenções de tanques industriais da Brava Energia.",
};

export default function BravaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="brava-app min-h-screen font-sans text-brava-text">
      <BravaDataProvider>
        <Sidebar />
        <MobileTopBar />
        <div className="lg:pl-60">{children}</div>
      </BravaDataProvider>
    </div>
  );
}
