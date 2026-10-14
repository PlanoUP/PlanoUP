import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listMapCoordinates, upsertMapCoordinate } from "@/lib/db/mapCoordinatesRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_NOT_CONFIGURED", message: "Nenhum banco de dados conectado ao projeto ainda." },
      { status: 503 }
    );
  }
  try {
    const coordinates = await listMapCoordinates();
    return NextResponse.json({ coordinates });
  } catch (err) {
    console.error("GET /api/map-coordinates failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao consultar as coordenadas." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para calibrar o mapa." },
      { status: 401 }
    );
  }
  try {
    const input = await request.json();
    const coordinate = await upsertMapCoordinate(input);
    return NextResponse.json({ coordinate }, { status: 201 });
  } catch (err) {
    console.error("POST /api/map-coordinates failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao salvar a coordenada." }, { status: 500 });
  }
}
