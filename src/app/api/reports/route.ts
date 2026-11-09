import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db/client";
import { listReports, upsertDraft } from "@/lib/db/executiveReportsRepo";
import { isRequestEditor } from "@/lib/auth/editAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_NOT_CONFIGURED", message: "Nenhum banco de dados conectado ao projeto ainda." },
      { status: 503 }
    );
  }
  try {
    const scope = new URL(request.url).searchParams.get("scope") ?? undefined;
    const reports = await listReports(scope ?? undefined);
    return NextResponse.json({ reports });
  } catch (err) {
    console.error("GET /api/reports failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao consultar os relatórios." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isRequestEditor())) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Desbloqueie o modo de edição para editar o relatório." },
      { status: 401 }
    );
  }
  try {
    const input = await request.json();
    const report = await upsertDraft(input);
    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "REPORT_ALREADY_CLOSED") {
      return NextResponse.json(
        { error: "REPORT_ALREADY_CLOSED", message: "Esse relatório já foi fechado e não pode mais ser editado." },
        { status: 409 }
      );
    }
    console.error("POST /api/reports failed", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Falha ao salvar o relatório." }, { status: 500 });
  }
}
