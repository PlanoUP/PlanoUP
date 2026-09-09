import { AssetMapConfig } from "./types";

// Coordinates were measured directly off the reference images provided by
// Brava (public/images/brava/maps/source/*-reference.png) by overlaying a
// percentage grid and reading each tank's drawn position — never inferred
// from the drawn labels themselves (see lib/brava/maps/README below). Two
// known gaps, intentionally left unmapped rather than guessed:
//   - TQ-1222-23 does not appear labeled anywhere on the Área 1222 reference.
//   - The reference draws "TQ-122225 / LAV. QUENTE" twice, over two visually
//     distinct tanks. Only the first is mapped to the real TQ-1222-25; the
//     second has no confirmed TAG and is left out entirely.
// Both are flagged to the user for confirmation before a coordinate is added.

export const ASSET_MAPS: AssetMapConfig[] = [
  {
    id: "410-6313",
    name: "Tancagem 410 / 6313",
    shortLabel: "410 / 6313",
    image: "/images/brava/maps/410-6313.jpg",
    imageWidth: 1586,
    imageHeight: 832,
    tankIds: [
      "TQ-41001",
      "TQ-41002",
      "TQ-41004",
      "TQ-41005",
      "TQ-41007",
      "TQ-41008",
      "TQ-6313001",
      "TQ-6313002",
      "TQ-6313003",
      "TQ-6313004",
      "TQ-6313005",
      "TQ-6313006",
      "TQ-6313007",
    ],
    coordinates: [
      { tag: "TQ-6313007", x: 54, y: 9 },
      { tag: "TQ-6313003", x: 63, y: 10 },
      { tag: "TQ-41002", x: 49, y: 24 },
      { tag: "TQ-6313004", x: 64, y: 19 },
      { tag: "TQ-41001", x: 44, y: 36 },
      { tag: "TQ-41005", x: 59, y: 29 },
      { tag: "TQ-6313005", x: 30, y: 52 },
      { tag: "TQ-41004", x: 56, y: 43 },
      { tag: "TQ-6313006", x: 26, y: 60 },
      { tag: "TQ-41007", x: 44, y: 53 },
      { tag: "TQ-41008", x: 40, y: 69 },
      { tag: "TQ-6313001", x: 31, y: 83 },
      { tag: "TQ-6313002", x: 40, y: 88 },
    ],
    filters: [
      { value: "410", label: "410", familyMatch: "410" },
      { value: "6313", label: "6313", familyMatch: "6313" },
    ],
  },
  {
    id: "270",
    name: "Área 270",
    shortLabel: "Área 270",
    image: "/images/brava/maps/270.jpg",
    imageWidth: 1586,
    imageHeight: 832,
    tankIds: [
      "TQ-27001",
      "TQ-27002",
      "TQ-27003",
      "TQ-27004",
      "TQ-27009",
      "TQ-27010",
      "TQ-27011",
      "TQ-27015",
      "TQ-27016",
      // TQ-27017: incluir aqui se existir na base — sem coordenada até ser
      // claramente identificado no mapa (ver getTanksByMap: entra na lista/
      // busca com "posição a definir").
    ],
    coordinates: [
      { tag: "TQ-27009", x: 57, y: 8 },
      { tag: "TQ-27010", x: 54, y: 16 },
      { tag: "TQ-27001", x: 49, y: 29 },
      { tag: "TQ-27002", x: 45, y: 39 },
      { tag: "TQ-27004", x: 43, y: 55 },
      { tag: "TQ-27011", x: 68, y: 12 },
      { tag: "TQ-27003", x: 63, y: 28 },
      { tag: "TQ-27015", x: 43, y: 65 },
      { tag: "TQ-27016", x: 44, y: 78 },
    ],
    filters: [
      { value: "DIESEL", label: "Diesel", productMatch: "Diesel" },
      { value: "QAV", label: "QAV", productMatch: "QAV" },
      { value: "GASOLINA", label: "Gasolina", productMatch: "Gasolina" },
    ],
  },
  {
    id: "1222",
    name: "Área 1222",
    shortLabel: "Área 1222",
    image: "/images/brava/maps/1222.jpg",
    imageWidth: 1586,
    imageHeight: 832,
    tankIds: [
      "TQ-1222-21",
      "TQ-1222-22",
      "TQ-1222-23",
      "TQ-1222-24",
      "TQ-1222-25",
      "TQ-1222-31",
      "TQ-1222-32",
      "TQ-1222-33",
      "TQ-1222-34",
      "TQ-1222-35",
      "TQ-1222-36",
      "TQ-1222-37",
      "TQ-1222-41",
      "TQ-1222-42",
      "TQ-1222-43",
      "TQ-1222-44",
    ],
    coordinates: [
      { tag: "TQ-1222-21", x: 79, y: 38 },
      { tag: "TQ-1222-22", x: 71, y: 35 },
      // TQ-1222-23: sem posição confirmada — não aparece rotulado no mapa.
      { tag: "TQ-1222-24", x: 78, y: 47 },
      { tag: "TQ-1222-25", x: 71, y: 44 },
      { tag: "TQ-1222-31", x: 46, y: 42 },
      { tag: "TQ-1222-32", x: 48, y: 34 },
      { tag: "TQ-1222-33", x: 52, y: 25 },
      { tag: "TQ-1222-34", x: 54, y: 17 },
      { tag: "TQ-1222-35", x: 17, y: 48 },
      { tag: "TQ-1222-36", x: 15, y: 58 },
      { tag: "TQ-1222-37", x: 26, y: 80 },
      { tag: "TQ-1222-41", x: 71, y: 25 },
      { tag: "TQ-1222-42", x: 76, y: 17 },
      { tag: "TQ-1222-43", x: 78, y: 27 },
      { tag: "TQ-1222-44", x: 79, y: 20 },
    ],
    filters: [
      { value: "LAV_FRIO", label: "Lav. Frio", productMatch: "Lavagem a Frio" },
      { value: "LAV_QUENTE", label: "Lav. Quente", productMatch: "Lavagem a Quente" },
      { value: "CARGA", label: "Carga", productMatch: "Carga" },
    ],
  },
];
