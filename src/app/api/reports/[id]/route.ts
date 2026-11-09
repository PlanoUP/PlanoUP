import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db/client";
import { getReport } from "@/lib/db/executiveReportsRepo";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_NOT_CONFIGURED", message: "Nenhum banco de dados conectado ao projeto ainda." },
      { status: 503 }
    );
  }
  try {
    const report = await getReport(decodeURIComponent(params.id));
    if (!report) {
      return NextResponse.json({ error: "NOT_FOUND", message: "Relatório não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ report });
  } catch (err) {
    console.error("GET /api/reports/[id] failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao consultar o relatório." }, { status: 500 });
  }
}
