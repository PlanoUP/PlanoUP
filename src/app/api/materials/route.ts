import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db/client";
import { createMaterial, listMaterials } from "@/lib/db/materialsRepo";
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
    const materials = await listMaterials();
    return NextResponse.json({ materials });
  } catch (err) {
    console.error("GET /api/materials failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao consultar os materiais." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para cadastrar um material." },
      { status: 401 }
    );
  }
  try {
    const input = await request.json();
    const material = await createMaterial(input);
    return NextResponse.json({ material }, { status: 201 });
  } catch (err) {
    console.error("POST /api/materials failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao cadastrar o material." }, { status: 500 });
  }
}
