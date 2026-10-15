import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "@/styles/brava-tokens.css";
import { BravaDataProvider } from "@/lib/brava/context";
import { MaterialsDataProvider } from "@/lib/brava/materials/context";
import { CostsDataProvider } from "@/lib/brava/costs/context";
import { MapCoordinatesProvider, MapCalloutOffsetsProvider } from "@/lib/brava/maps/context";
import { UnitsDataProvider } from "@/lib/brava/units/context";
import { EquipmentMaterialsDataProvider } from "@/lib/brava/units/materials/context";
import { EquipmentCostsDataProvider } from "@/lib/brava/units/costs/context";
import { EquipmentMapCoordinatesProvider } from "@/lib/brava/units/maps/context";
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
  title: "Shutdown Control | Brava Energia",
  description:
    "Painel corporativo de acompanhamento, planejamento e gestão das paradas de tanques e unidades de processo da Brava Energia.",
};

export default function BravaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${manrope.variable} brava-app min-h-screen font-brava text-brava-text`}>
      <EditAuthProvider>
        <BravaDataProvider>
          <DataStatusGate>
            <MaterialsDataProvider>
              <CostsDataProvider>
                <MapCoordinatesProvider>
                  <MapCalloutOffsetsProvider>
                    <UnitsDataProvider>
                      <EquipmentMaterialsDataProvider>
                        <EquipmentCostsDataProvider>
                          <EquipmentMapCoordinatesProvider>
                            <Sidebar />
                            <MobileTopBar />
                            <div className="lg:pl-64">{children}</div>
                          </EquipmentMapCoordinatesProvider>
                        </EquipmentCostsDataProvider>
                      </EquipmentMaterialsDataProvider>
                    </UnitsDataProvider>
                  </MapCalloutOffsetsProvider>
                </MapCoordinatesProvider>
              </CostsDataProvider>
            </MaterialsDataProvider>
          </DataStatusGate>
        </BravaDataProvider>
        <EditPasswordModal />
      </EditAuthProvider>
    </div>
  );
}
