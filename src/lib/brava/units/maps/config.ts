import { EquipmentAssetMapConfig } from "./types";
import { EQUIPMENT_SEED } from "../data/equipment";
import { EQUIPMENT_TYPE_LABELS } from "../types";

// "geral" uses the real aerial photo of the plant provided by the user —
// nothing on it is labeled yet, so coordinates stay empty until someone
// calibrates each equipment's position via "Modo de Calibração", exactly
// like the tanks "geral" map worked before it was calibrated. U-260/U-270
// still use placeholder background images until their own close-up photos
// are provided.

const U260_TAGS = EQUIPMENT_SEED.filter((e) => e.unit === "U-260").map((e) => e.tag);
const U270_TAGS = EQUIPMENT_SEED.filter((e) => e.unit === "U-270").map((e) => e.tag);

function typeFilters(unit: "U-260" | "U-270") {
  const types = Array.from(new Set(EQUIPMENT_SEED.filter((e) => e.unit === unit).map((e) => e.equipmentType)));
  return types.map((t) => ({ value: t, label: EQUIPMENT_TYPE_LABELS[t], equipmentTypeMatch: t }));
}

export const EQUIPMENT_ASSET_MAPS: EquipmentAssetMapConfig[] = [
  {
    id: "geral",
    name: "Visão Geral",
    shortLabel: "Visão Geral",
    image: "/images/brava/maps/units/geral.webp",
    imageWidth: 1448,
    imageHeight: 1086,
    equipmentIds: [...U260_TAGS, ...U270_TAGS],
    coordinates: [],
    filters: [],
  },
  {
    id: "U-260",
    name: "Unidade U-260",
    shortLabel: "U-260",
    image: "/images/brava/maps/units/u-260.png",
    imageWidth: 1600,
    imageHeight: 900,
    equipmentIds: U260_TAGS,
    coordinates: [],
    filters: typeFilters("U-260"),
  },
  {
    id: "U-270",
    name: "Unidade U-270",
    shortLabel: "U-270",
    image: "/images/brava/maps/units/u-270.png",
    imageWidth: 1600,
    imageHeight: 900,
    equipmentIds: U270_TAGS,
    coordinates: [],
    filters: typeFilters("U-270"),
  },
];
