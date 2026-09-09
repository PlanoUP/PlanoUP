import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listTanks } from "@/lib/db/tanksRepo";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_NOT_CONFIGURED", message: "Nenhum banco de dados conectado ao projeto ainda." },
      { status: 503 }
    );
  }
  try {
    const tanks = await listTanks();
    return NextResponse.json({ tanks });
  } catch (err) {
    console.error("GET /api/tanks failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao consultar os tanques." }, { status: 500 });
  }
}
