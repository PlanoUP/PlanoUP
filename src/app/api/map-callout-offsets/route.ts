import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listMapCalloutOffsets, upsertMapCalloutOffset } from "@/lib/db/mapCalloutOffsetsRepo";
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
    const offsets = await listMapCalloutOffsets();
    return NextResponse.json({ offsets });
  } catch (err) {
    console.error("GET /api/map-callout-offsets failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao consultar as posições dos informativos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para mover o informativo." },
      { status: 401 }
    );
  }
  try {
    const input = await request.json();
    const offset = await upsertMapCalloutOffset(input);
    return NextResponse.json({ offset }, { status: 201 });
  } catch (err) {
    console.error("POST /api/map-callout-offsets failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao salvar a posição do informativo." }, { status: 500 });
  }
}
