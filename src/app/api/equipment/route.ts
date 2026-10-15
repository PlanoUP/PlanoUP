import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listEquipment } from "@/lib/db/equipmentRepo";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_NOT_CONFIGURED", message: "Nenhum banco de dados conectado ao projeto ainda." },
      { status: 503 }
    );
  }
  try {
    const equipment = await listEquipment();
    return NextResponse.json({ equipment });
  } catch (err) {
    console.error("GET /api/equipment failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao consultar os equipamentos." }, { status: 500 });
  }
}
