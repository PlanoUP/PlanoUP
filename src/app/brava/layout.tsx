import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "@/styles/brava-tokens.css";
import { BravaDataProvider } from "@/lib/brava/context";
import { MaterialsDataProvider } from "@/lib/brava/materials/context";
import { EditAuthProvider } from "@/lib/brava/editAuthContext";
import Sidebar from "@/components/brava/Sidebar";
import MobileTopBar from "@/components/brava/MobileTopBar";
import DataStatusGate from "@/components/brava/DataStatusGate";
import EditPasswordModal from "@/components/brava/EditPasswordModal";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-brava",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tank Control | Brava Energia",
  description:
    "Painel corporativo de acompanhamento, planejamento e gestão das manutenções de tanques industriais da Brava Energia.",
};

export default function BravaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${manrope.variable} brava-app min-h-screen font-brava text-brava-text`}>
      <EditAuthProvider>
        <BravaDataProvider>
          <DataStatusGate>
            <MaterialsDataProvider>
              <Sidebar />
              <MobileTopBar />
              <div className="lg:pl-64">{children}</div>
            </MaterialsDataProvider>
          </DataStatusGate>
        </BravaDataProvider>
        <EditPasswordModal />
      </EditAuthProvider>
    </div>
  );
}
