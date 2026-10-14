import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db/client";
import { createCost, listCosts } from "@/lib/db/costsRepo";
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
    const costs = await listCosts();
    return NextResponse.json({ costs });
  } catch (err) {
    console.error("GET /api/costs failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao consultar os custos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para cadastrar um custo." },
      { status: 401 }
    );
  }
  try {
    const input = await request.json();
    const cost = await createCost(input);
    return NextResponse.json({ cost }, { status: 201 });
  } catch (err) {
    console.error("POST /api/costs failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao cadastrar o custo." }, { status: 500 });
  }
}
