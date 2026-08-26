import type { Unit } from "@/types/paint-control";

// Fixed UUIDs so the seed is stable across server/client renders (no
// hydration mismatch) and across reloads before localStorage takes over.
// Some TAGs repeat in the source list on purpose — each row below is still
// an independent unit with its own id, per spec §7.
export const SEED_UNITS: Unit[] = [
  { id: "5680d790-3b07-4520-b271-3b3cd14c8c77", tag: "UEB", name: "(ATI) UEB1 - Unidade Biodiesel desativada" },
  { id: "9940d274-d428-4558-89c1-35abf71358b6", tag: "CARREGAM", name: "(ATI) Carregamento GLP - Diesel" },
  { id: "c1c906a2-694f-42cf-9483-0628fa792376", tag: "ATI", name: "(ATI) Ativo Industrial de Guamaré" },
  { id: "5c7a11ea-070e-4474-b6b7-13ec8850ba44", tag: "BAP", name: "(ATI) Base de Apoio Ativo Industrial" },
  { id: "7ceea253-78ec-4cb6-92d6-cef011d66a72", tag: "ECR", name: "Estação de Carregamento" },
  { id: "63293cde-97a5-4311-ae27-8d93352391bf", tag: "ECSA", name: "(ATI) Estação de Compressão e Secagem de Ar" },
  { id: "1e4f8f69-ffd9-49e0-a60a-0f21afecd969", tag: "ECUB-II", name: "(ATI) ECUB II - Estação Recompressão" },
  { id: "18381681-f0ae-489b-8f78-78c976cd88a9", tag: "ECUB-V", name: "(ATI) ECUB V - Estação Compressores Ubarana V" },
  { id: "aaa89aa3-6e3d-440a-be84-551642f21fcc", tag: "ECUB-VI", name: "(ATI) ECUB VI Estação Compressores Ubarana VI" },
  { id: "23f266a0-5db5-4174-bab0-c366b33a2a2b", tag: "ECUBIAIV", name: "(ATI) ECUB I-III-IV Estação Compressores Ubarana" },
  { id: "40d0e498-6f60-42d9-89f0-36c9ca5fb0fe", tag: "EIA", name: "(ATI) EIA - Estação Injeção de Água Ubarana" },
  { id: "b6a20e02-db49-478d-9f57-f48e308d88d6", tag: "EMEDS", name: "(ATI) EMEDS - Estações de Medição" },
  { id: "886422d4-caa9-4d17-8a90-ce4ccb5d2645", tag: "ETA", name: "(ATI) ETA - Estação de Tratamento de Água" },
  { id: "e2ae4945-af13-43c8-9465-9e26930f3ba2", tag: "ETAP", name: "(ATI) ETAP - Estação Tratamento Água Produzida" },
  { id: "2d0afc27-5730-4a6f-9ce5-f8f710946a0d", tag: "ETE", name: "(ATI) ETE - Estação Tratamento de Efluentes" },
  { id: "1ebe8c59-ce68-4c16-8b65-697c41f128b3", tag: "ETO", name: "(ATI) ETO - Estação de Tratamento de Óleo" },
  { id: "4f6f81c4-a6e5-43ff-8f7c-0468d6b8d173", tag: "LAB", name: "(ATI) Laboratório Análises Químicas" },
  { id: "f4fe22a9-6741-42db-add6-bd0f0988530f", tag: "SE-5142", name: "(ATI) SE-5142 Subestação 138 kV" },
  { id: "536eb393-8cac-48ec-b479-b44db022c1bb", tag: "SE-522", name: "(ATI) SE-522 Subestação 69/4.16 kV" },
  { id: "c22ba18c-0838-4cd3-a7fd-8a16ac467666", tag: "TAG", name: "Terminal Guamaré" },
  { id: "2dc0b874-5855-4a18-a0b1-e5be35a8ff62", tag: "U260", name: "(ATI) U260 - Unidade de Diesel" },
  { id: "e4cd067e-4865-41c8-89eb-2d1de32df573", tag: "U270", name: "(ATI) U270 - Unidade de QAV" },
  { id: "9f069bc1-4bf9-422a-aaae-660382c253d7", tag: "U280A", name: "(ATI) U280A Unidade Tratamento Cáustico (UTC)" },
  { id: "f5e5d8c6-bfb8-4ed1-aaec-ec8f0c31761b", tag: "UEB", name: "Unidade Biodiesel" },
  { id: "c04af494-797e-409d-8951-e45ced0181ce", tag: "UEP", name: "(ATI) UEP - Unidade Estabilização de Pescada" },
  { id: "ddb2f9bc-1943-4098-b75a-98adea34dcfa", tag: "UPGN III", name: "(ATI) UPGN III Unidade Processamento de Gás" },
  { id: "b529a78d-57f2-47c3-ba98-b84837c5cd15", tag: "UPGN-I", name: "(ATI) UPGN I Unidade Processamento de Gás" },
  { id: "a30eb3b1-12c5-4fce-957b-4edd91b3c230", tag: "UPGN-II", name: "(ATI) UPGN II Unidade Processamento de Gás" },
  { id: "829ce07b-3590-4cbf-b75e-b006758d775a", tag: "UPGN-III", name: "(ATI) UPGN III Unidade Processamento de Gás" },
  { id: "6c59d08d-9fb3-4336-bd5d-0a0069bb4225", tag: "UTE", name: "(ATI) UTE - Unidade de Transferência e Estocagem" },
  { id: "dcb0ef3a-0d76-49f6-8e8b-611005ffbef5", tag: "UTG", name: "(ATI) UTG - Unidade de Tratamento de Gás" },
];

export const UNIT_BY_ID = new Map(SEED_UNITS.map((u) => [u.id, u]));

// Convenience lookups used by the seed activities below.
export const UNIT_ID_U260 = "2dc0b874-5855-4a18-a0b1-e5be35a8ff62";
export const UNIT_ID_U270 = "e4cd067e-4865-41c8-89eb-2d1de32df573";
export const UNIT_ID_UPGN_III = "ddb2f9bc-1943-4098-b75a-98adea34dcfa";
export const UNIT_ID_ETA = "886422d4-caa9-4d17-8a90-ce4ccb5d2645";
export const UNIT_ID_UTG = "dcb0ef3a-0d76-49f6-8e8b-611005ffbef5";
export const UNIT_ID_TAG = "c22ba18c-0838-4cd3-a7fd-8a16ac467666";
